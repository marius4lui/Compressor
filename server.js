const express = require('express');
const cluster = require('cluster');
const os = require('os');
const multer = require('multer');
const sharp = require('sharp');
const Bull = require('bull');
const path = require('path');
const fs = require('fs');
const { exec } = require('child_process');

const PORT = process.env.PORT || 3000;
const numCPUs = os.cpus().length;

if (cluster.isMaster) {
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
                     process.platform === 'win32' ? 'start' : 'xdg-open';
        exec(`${start} ${url}`);
    }, 2000);

} else {
    const app = express();

    const imageQueue = new Bull('image compression', {
        redis: { port: 6379, host: '127.0.0.1' },
        settings: {
            stalledInterval: 30 * 1000,
            maxStalledCount: 1
        }
    });

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

    const jobs = new Map();

    imageQueue.process('compress', async (job, done) => {
        try {
            const { buffer, originalname, quality, format } = job.data;

            console.log(`🔄 Job ${job.id}: Verarbeite ${originalname}`);
            jobs.set(job.id, { status: 'processing', filename: originalname });

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

            const result = {
                buffer: compressedBuffer,
                originalSize: originalSize,
                compressedSize: compressedBuffer.length,
                compressionRatio: compressionRatio,
                filename: originalname,
                format: format
            };

            jobs.set(job.id, {
                status: 'completed',
                filename: originalname,
                result: result
            });

            console.log(`✅ Job ${job.id}: ${originalname} komprimiert (${compressionRatio}% Ersparnis)`);
            done(null, result);

        } catch (error) {
            console.error(`❌ Job ${job.id}: Fehler bei ${job.data.originalname}:`, error.message);
            jobs.set(job.id, {
                status: 'failed',
                filename: job.data.originalname,
                error: error.message
            });
            done(error);
        }
    });

    app.post('/compress', upload.single('image'), async (req, res) => {
        try {
            if (!req.file) {
                return res.status(400).json({ error: 'Keine Datei hochgeladen' });
            }

            const quality = parseInt(req.body.quality) || 80;
            const format = req.body.format || 'jpeg';

            const job = await imageQueue.add('compress', {
                buffer: req.file.buffer,
                originalname: req.file.originalname,
                quality: quality,
                format: format
            });

            jobs.set(job.id, { status: 'queued', filename: req.file.originalname });

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
        const jobId = req.params.jobId;
        const jobInfo = jobs.get(parseInt(jobId));

        if (!jobInfo) {
            return res.status(404).json({ error: 'Job nicht gefunden' });
        }

        res.json(jobInfo);
    });

    app.get('/download/:jobId', (req, res) => {
        const jobId = req.params.jobId;
        const jobInfo = jobs.get(parseInt(jobId));

        if (!jobInfo || jobInfo.status !== 'completed') {
            return res.status(404).json({ error: 'Datei nicht verfügbar' });
        }

        const result = jobInfo.result;
        const filename = path.parse(result.filename).name + '_compressed.' + result.format;

        res.set({
            'Content-Type': `image/${result.format}`,
            'Content-Disposition': `attachment; filename="${filename}"`,
            'Content-Length': result.buffer.length
        });

        res.send(result.buffer);
    });

    app.get('/queue-stats', async (req, res) => {
        try {
            const waiting = await imageQueue.getWaiting();
            const active = await imageQueue.getActive();
            const completed = await imageQueue.getCompleted();
            const failed = await imageQueue.getFailed();

            res.json({
                waiting: waiting.length,
                active: active.length,
                completed: completed.length,
                failed: failed.length,
                workers: Object.keys(cluster.workers).length
            });
        } catch (error) {
            res.status(500).json({ error: 'Fehler beim Abrufen der Statistiken' });
        }
    });

    app.listen(PORT, () => {
        console.log(`🔧 Worker ${process.pid} läuft auf Port ${PORT}`);
    });

    process.on('SIGTERM', () => {
        imageQueue.close().then(() => {
            console.log('Queue geschlossen');
            process.exit(0);
        });
    });
}