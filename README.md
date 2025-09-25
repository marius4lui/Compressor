# 🖼️ Compressor - Multi-Platform Image Compression Tool

Ein leistungsstarkes Bildkompressions-Tool mit moderner Web-UI und Desktop-Anwendung. Verfügt über zwei Versionen: Web-basiert und GUI mit Electron.

## ✨ Features

### 🌐 Web Version
- **🖼️ Multi-Format Support**: JPEG, PNG, WebP
- **⚙️ Einstellbare Qualität**: Qualitätsregler von 10% bis 100%
- **🔄 Cluster-Processing**: Nutzt mehrere CPU-Kerne für schnelle Verarbeitung
- **📊 Live-Statistiken**: Echtzeitanzeige der Warteschlange und Verarbeitung
- **🎨 Moderne UI**: Drag & Drop, Responsive Design, Progress-Anzeige
- **💾 Direkt-Download**: Komprimierte Bilder sofort herunterladen

### 🖥️ GUI Version (Electron)
- **🚀 Cross-Platform**: Windows, macOS, Linux
- **🖥️ Native Desktop Experience**: Eigenständige Anwendung
- **🌐 Integrierter Webserver**: Lokale Express-Server Integration
- **📁 Multi-File Support**: Batch-Verarbeitung mit ZIP/Folder Download
- **⚡ Offline-Fähig**: Funktioniert ohne Internetverbindung
- **🎯 Benutzerfreundlich**: Einfache Installation und Bedienung

## 🛠️ Installation & Build

### Voraussetzungen
- Node.js 16+ installiert
- PNPM package manager

### Schritt 1: Dependencies installieren
```bash
pnpm install
```

### Schritt 2: Anwendung starten

**Web Version:**
```bash
pnpm run start:standalone
```

**GUI Version (Electron):**
```bash
pnpm run electron
```

### Schritt 3: Build für Distribution

**Windows EXE (Web Version):**
```bash
pnpm run build:win
```

**Electron App (Alle Plattformen):**
```bash
# Windows
pnpm run build:electron:win

# macOS
pnpm run build:electron:mac

# Linux
pnpm run build:electron:linux
```

## 🚀 Verwendung

### Web Version

**Server starten:**
```bash
pnpm run start:standalone
```

**Was passiert beim Start:**
1. ✅ HTTP-Server startet auf Port 3005
2. 🌐 Browser öffnet automatisch http://localhost:3005
3. 📋 Konsole zeigt Status-Updates und Job-Informationen

### GUI Version (Electron)

**Anwendung starten:**
```bash
pnpm run electron
# oder nach dem Build
pnpm run start:post-build
```

**Was passiert beim Start:**
1. ✅ Electron-Fenster öffnet sich
2. 🌐 Integrierter Express-Server startet auf Port 3005
3. 🖥️ Web-UI wird im Electron-Fenster geladen
4. 📱 Vollständige Desktop-Erfahrung mit System-Integration

### Web-Interface verwenden

1. **📁 Bild auswählen**: Drag & Drop oder "Datei auswählen"
2. **⚙️ Einstellungen**: Qualität (10-100%) und Format wählen
3. **🚀 Komprimieren**: Button klicken und Verarbeitung abwarten
4. **💾 Download**:
   - Web: Einzelnes Bild herunterladen
   - GUI: ZIP oder Ordner mit allen Bildern

## 📁 Projektstruktur

```
Compressor/
├── server.js                  # Haupt-Server (mit Redis/Bull-Queue)
├── server-standalone.js       # Standalone-Version für Web-Betrieb
├── main.js                    # Electron Hauptprozess
├── build-exe.js              # Automatisches Build-Script für EXE
├── package.json              # Dependencies und Scripts
├── pnpm-workspace.yaml       # Workspace Konfiguration
├── public/
│   └── index.html           # Web-UI mit modernem Design
├── dist/
│   ├── compressor.exe       # Fertige Windows-Anwendung
│   └── ...                   # Electron Build Outputs
└── web/                     # Web Version Dokumentation
    └── index.html           # Projektbeschreibungsseite
```

## 🔧 Entwicklung

### Development-Server starten
```bash
# Web Version mit Redis/Bull-Queue (empfohlen für Entwicklung)
pnpm run dev

# Web Version Standalone testen
pnpm run start:standalone

# Electron App im Development Modus
pnpm run electron:dev
```

### Available Scripts
- `pnpm start` - Produktions-Server mit Redis
- `pnpm run dev` - Development mit Nodemon
- `pnpm run start:standalone` - Standalone ohne Redis
- `pnpm run electron` - Electron App starten
- `pnpm run electron:dev` - Electron im Development Modus
- `pnpm run build:win` - Windows EXE erstellen
- `pnpm run build:electron:win` - Electron für Windows bauen
- `pnpm run build:electron:mac` - Electron für macOS bauen
- `pnpm run build:electron:linux` - Electron für Linux bauen

## ⚙️ Technische Details

### Server-Features
- **Express.js**: Web-Server und API
- **Cluster**: Multi-Core CPU-Nutzung
- **Sharp**: Hochperformante Bildverarbeitung
- **Multer**: File-Upload Handling
- **In-Memory Queue**: Für EXE-Build (ohne Redis)

### Electron-Features
- **Cross-Platform**: Windows, macOS, Linux Support
- **Native Integration**: System-Notifications, Menüs, Shortcuts
- **Auto-Updates**: Unterstützung für Updates via electron-updater
- **Packaging**: electron-builder für Distribution

### UI-Features
- **Responsive Design**: Mobile & Desktop optimiert
- **Drag & Drop**: Intuitive Datei-Auswahl
- **Live Progress**: Echtzeitanzeige der Verarbeitung
- **Format-Unterstützung**: JPEG, PNG, WebP
- **Statistiken**: Server-Status und Warteschlange
- **Multi-File Upload**: Batch-Verarbeitung
- **Download-Optionen**: Einzel, ZIP, Ordner

### Build-Process
- **PKG**: Erstellt Single-File EXE für Web Version
- **Electron Builder**: Cross-Platform Desktop Apps
- **Node.js 18**: Target-Runtime
- **Brotli-Kompression**: Kleinere EXE-Datei
- **Asset-Bundling**: HTML/CSS automatisch eingebunden

## 🖥️ System-Anforderungen

### Web Version
- **OS**: Windows 7/8/10/11 (x64), macOS, Linux
- **RAM**: Mindestens 1GB verfügbar
- **CPU**: Multi-Core empfohlen für beste Performance
- **Port**: 3005 muss verfügbar sein

### GUI Version (Electron)
- **OS**: Windows 10+, macOS 10.14+, Linux (Ubuntu 18.04+)
- **RAM**: Mindestens 2GB empfohlen
- **CPU**: x64 oder ARM64
- **Speicher**: ~200MB für Installation

## 📊 Performance

- **Cluster-Mode**: Nutzt alle verfügbaren CPU-Kerne
- **Memory-Efficient**: Streaming-Processing für große Dateien
- **Fast Processing**: Sharp-Library für optimierte Bildverarbeitung
- **Queue-System**: Verhindert Überlastung bei vielen gleichzeitigen Uploads

## 🐛 Troubleshooting

**Allgemein:**
- Port 3005 bereits belegt → Port in server-standalone.js/main.js anpassen
- Node.js Version prüfen (16+ erforderlich)
- `pnpm install` erneut ausführen

**Web Version:**
- Browser öffnet nicht automatisch → Manuell http://localhost:3005 aufrufen
- EXE startet nicht → Antivirus/Firewall prüfen

**GUI Version:**
- Electron startet nicht → `pnpm install` in electron-app Ordner ausführen
- App crasht → Logs in AppData/Local/Programs/compressor prüfen

**Build-Fehler:**
- PKG nicht gefunden → `pnpm install -g pkg`
- Electron build fehlschlägt → electron-builder installieren: `pnpm install -g electron-builder`
- Speicherplatz prüfen (Builds benötigen viel Platz)

## 👨‍💻 Entwickelt mit

### Backend
- **Node.js & Express.js** - Webserver und API
- **Sharp** - Hochperformante Bildverarbeitung
- **Cluster** - Multi-Core CPU-Nutzung
- **Multer** - File-Upload Handling
- **Bull Queue** - Job-Queue mit Redis
- **Electron** - Desktop Application Framework

### Frontend
- **Modern Vanilla JS** - Interaktive UI
- **CSS Grid & Flexbox** - Responsive Layout
- **Fetch API** - Kommunikation mit Server
- **Drag & Drop API** - Datei-Upload
- **Web Animations API** - Smooth Transitions

### Build & Deployment
- **PKG** - Node.js zu EXE Compiler
- **Electron Builder** - Cross-Platform Packager
- **PNPM** - Effizienter Package Manager
- **Brotli** - Komprimierung

---

**🎯 Ready-to-use**: Nach `pnpm install` und je nach Bedarf `pnpm run build:win` oder `pnpm run build:electron:*` ist die Anwendung sofort einsatzbereit!

## 📄 Lizenz

MIT License - Siehe LICENSE Datei für Details

## 🔗 Links

- **GitHub Repository**: https://github.com/marius4lui/Compressor
- **Pull Request**: https://github.com/marius4lui/Compressor/pull/1
- **Live Demo**: Web-Version unter http://localhost:3005 nach `pnpm run start:standalone`