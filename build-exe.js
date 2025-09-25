const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🔨 Starte EXE-Build für Windows...');

// Erstelle dist Verzeichnis falls es nicht existiert
if (!fs.existsSync('dist')) {
    fs.mkdirSync('dist');
    console.log('📁 dist/ Verzeichnis erstellt');
}

// Prüfe ob pkg installiert ist
exec('pkg --version', (error) => {
    if (error) {
        console.log('📦 Installiere pkg...');
        exec('pnpm install -g pkg', (installError) => {
            if (installError) {
                console.error('❌ Fehler beim Installieren von pkg:', installError);
                process.exit(1);
            }
            buildExe();
        });
    } else {
        buildExe();
    }
});

function buildExe() {
    console.log('⚙️ Verwende server-standalone.js für Single-EXE Build...');

    // Build-Kommando für Standalone-Version ohne Redis-Abhängigkeit
    const buildCommand = 'pkg server-standalone.js --target node18-win-x64 --output dist/compressor.exe --compress Brotli';

    console.log('🏗️ Führe Build aus:', buildCommand);

    exec(buildCommand, (error, stdout, stderr) => {
        if (error) {
            console.error('❌ Build-Fehler:', error);
            process.exit(1);
        }

        if (stderr) {
            console.log('⚠️ Build-Warnungen:', stderr);
        }

        console.log('📤 Build-Output:');
        console.log(stdout);

        // Prüfe ob EXE erstellt wurde
        if (fs.existsSync('dist/compressor.exe')) {
            const stats = fs.statSync('dist/compressor.exe');
            const fileSizeMB = (stats.size / 1024 / 1024).toFixed(2);

            console.log('✅ EXE erfolgreich erstellt!');
            console.log(`📊 Dateigröße: ${fileSizeMB} MB`);
            console.log('📁 Pfad: dist/compressor.exe');
            console.log('');
            console.log('🚀 Zum Starten der Anwendung:');
            console.log('   .\\dist\\compressor.exe');
            console.log('');
            console.log('💡 Die EXE öffnet automatisch einen Browser auf http://localhost:3000');
        } else {
            console.error('❌ EXE-Datei wurde nicht erstellt!');
            process.exit(1);
        }
    });
}