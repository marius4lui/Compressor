const express = require('express');
const cluster = require('cluster');
const os = require('os');
const multer = require('multer');
const sharp = require('sharp');
const path = require('path');
const fs = require('fs');
const { exec } = require('child_process');
const archiver = require('archiver');

const PORT = process.env.PORT || 3005;
const numCPUs = os.cpus().length;

// In-Memory Queue für Single-EXE Deployment (ohne Redis)
class SimpleQueue {
    constructor() {
        this.jobs = new Map();
        this.workers = [];
        this.jobCounter = 0;
        this.processing = false;
    }

    add(type, data) {
        const jobId = ++this.jobCounter;
        const job = {
            id: jobId,
            type: type,
            data: data,
            status: 'waiting',
            createdAt: new Date()
        };

        this.jobs.set(jobId, job);
        this.processNext();
        return { id: jobId };
    }

    async processNext() {
        if (this.processing) return;

        const waitingJob = Array.from(this.jobs.values()).find(job => job.status === 'waiting');
        if (!waitingJob) return;

        this.processing = true;
        waitingJob.status = 'active';

        try {
            const result = await this.processJob(waitingJob);
            waitingJob.status = 'completed';
            waitingJob.result = result;
        } catch (error) {
            waitingJob.status = 'failed';
            waitingJob.error = error.message;
        }

        this.processing = false;
        setTimeout(() => this.processNext(), 100);
    }

    async processJob(job) {
        const { buffer, originalname, quality, format } = job.data;

        let sharpInstance = sharp(buffer);
        const metadata = await sharpInstance.metadata();
        const originalSize = buffer.length;

        if (format === 'webp') {
            sharpInstance = sharpInstance.webp({ quality: quality });
        } else if (format === 'jpeg') {
            sharpInstance = sharpInstance.jpeg({ quality: quality });
        } else if (format === 'png') {
            sharpInstance = sharpInstance.png({
                quality: quality,
                compressionLevel: 9
            });
        }

        const compressedBuffer = await sharpInstance.toBuffer();
        const compressionRatio = ((originalSize - compressedBuffer.length) / originalSize * 100).toFixed(1);

        return {
            buffer: compressedBuffer,
            originalSize: originalSize,
            compressedSize: compressedBuffer.length,
            compressionRatio: compressionRatio,
            filename: originalname,
            format: format
        };
    }

    getJob(jobId) {
        return this.jobs.get(jobId);
    }

    getStats() {
        const jobs = Array.from(this.jobs.values());
        return {
            waiting: jobs.filter(j => j.status === 'waiting').length,
            active: jobs.filter(j => j.status === 'active').length,
            completed: jobs.filter(j => j.status === 'completed').length,
            failed: jobs.filter(j => j.status === 'failed').length,
            workers: Object.keys(cluster.workers || {}).length || 1
        };
    }
}

if (cluster.isMaster && numCPUs > 1) {
    console.log(`🚀 Master ${process.pid} wird gestartet`);
    console.log(`📊 Verfügbare CPU-Kerne: ${numCPUs}`);

    for (let i = 0; i < Math.min(numCPUs, 4); i++) {
        cluster.fork();
    }

    cluster.on('exit', (worker, code, signal) => {
        console.log(`Worker ${worker.process.pid} beendet`);
        cluster.fork();
    });

    setTimeout(() => {
        console.log(`🌐 Server läuft auf http://localhost:${PORT}`);
        console.log('📁 Öffne Browser für Bildkompression...');

        const url = `http://localhost:${PORT}`;
        const start = process.platform === 'darwin' ? 'open' :
                     process.platform === 'win32' ? 'start ""' : 'xdg-open';
        exec(`${start} ${url}`, (err) => {
            if (err) console.log('Browser konnte nicht automatisch geöffnet werden. Öffne manuell:', url);
        });
    }, 2000);

} else {
    const app = express();
    const imageQueue = new SimpleQueue();

    const storage = multer.memoryStorage();
    const upload = multer({
        storage: storage,
        limits: {
            fileSize: 10 * 1024 * 1024 // 10MB limit
        },
        fileFilter: (req, file, cb) => {
            if (file.mimetype.startsWith('image/')) {
                cb(null, true);
            } else {
                cb(new Error('Nur Bilddateien sind erlaubt!'), false);
            }
        }
    });

    app.use(express.static(path.join(__dirname, 'public')));
    app.use(express.json());

    app.post('/compress', upload.single('image'), async (req, res) => {
        try {
            if (!req.file) {
                return res.status(400).json({ error: 'Keine Datei hochgeladen' });
            }

            const quality = parseInt(req.body.quality) || 80;
            const format = req.body.format || 'jpeg';

            const job = imageQueue.add('compress', {
                buffer: req.file.buffer,
                originalname: req.file.originalname,
                quality: quality,
                format: format
            });

            console.log(`📥 Job ${job.id}: ${req.file.originalname} in Warteschlange`);

            res.json({
                jobId: job.id,
                message: 'Bild wird verarbeitet...',
                filename: req.file.originalname
            });

        } catch (error) {
            console.error('Upload-Fehler:', error);
            res.status(500).json({ error: 'Server-Fehler beim Upload' });
        }
    });

    app.get('/status/:jobId', (req, res) => {
        const jobId = parseInt(req.params.jobId);
        const job = imageQueue.getJob(jobId);

        if (!job) {
            return res.status(404).json({ error: 'Job nicht gefunden' });
        }

        const response = {
            status: job.status,
            filename: job.data.originalname
        };

        if (job.status === 'completed') {
            response.result = job.result;
        } else if (job.status === 'failed') {
            response.error = job.error;
        }

        res.json(response);
    });

    app.get('/download/:jobId', (req, res) => {
        const jobId = parseInt(req.params.jobId);
        const job = imageQueue.getJob(jobId);

        if (!job || job.status !== 'completed') {
            return res.status(404).json({ error: 'Datei nicht verfügbar' });
        }

        const result = job.result;
        const filename = path.parse(result.filename).name + '_compressed.' + result.format;

        res.set({
            'Content-Type': `image/${result.format}`,
            'Content-Disposition': `attachment; filename="${filename}"`,
            'Content-Length': result.buffer.length
        });

        res.send(result.buffer);
    });

    app.get('/download-all', (req, res) => {
        const { jobs, type } = req.query;

        if (!jobs) {
            return res.status(400).json({ error: 'Keine Jobs angegeben' });
        }

        const jobIds = jobs.split(',').map(id => parseInt(id));
        const completedJobs = jobIds.map(id => imageQueue.getJob(id)).filter(job => job && job.status === 'completed');

        if (!completedJobs.length) {
            return res.status(404).json({ error: 'Keine abgeschlossenen Jobs gefunden' });
        }

        if (type === 'zip') {
            // ZIP-Download
            const archive = archiver('zip', { zlib: { level: 9 }});
            const zipFilename = `compressed_images_${Date.now()}.zip`;

            res.set({
                'Content-Type': 'application/zip',
                'Content-Disposition': `attachment; filename="${zipFilename}"`
            });

            archive.pipe(res);

            completedJobs.forEach(job => {
                const result = job.result;
                const filename = path.parse(result.filename).name + '_compressed.' + result.format;
                archive.append(result.buffer, { name: filename });
            });

            archive.finalize();
        } else {
            // Ordner-Download (TAR für bessere Ordnerstruktur)
            const archiver = require('archiver');
            const archive = archiver('tar', { gzip: true });
            const tarFilename = `compressed_images_${Date.now()}.tar.gz`;

            res.set({
                'Content-Type': 'application/gzip',
                'Content-Disposition': `attachment; filename="${tarFilename}"`
            });

            archive.pipe(res);

            completedJobs.forEach(job => {
                const result = job.result;
                const filename = path.parse(result.filename).name + '_compressed.' + result.format;
                archive.append(result.buffer, { name: `compressed_images/${filename}` });
            });

            archive.finalize();
        }
    });

    app.get('/queue-stats', async (req, res) => {
        try {
            const stats = imageQueue.getStats();
            res.json(stats);
        } catch (error) {
            res.status(500).json({ error: 'Fehler beim Abrufen der Statistiken' });
        }
    });

    app.listen(PORT, () => {
        const workerId = cluster.worker ? cluster.worker.process.pid : process.pid;
        console.log(`🔧 Worker ${workerId} läuft auf Port ${PORT}`);

        if (!cluster.worker) {
            console.log(`🌐 Entwicklungsserver bereit auf http://localhost:${PORT}`);
            console.log('🔄 Drücke Ctrl+C zum Beenden');
        }
    });

    process.on('SIGINT', () => {
        console.log('\n💫 Server wird beendet...');
        process.exit(0);
    });

    process.on('SIGTERM', () => {
        console.log('Shutdown Signal empfangen');
        process.exit(0);
    });
}