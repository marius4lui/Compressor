# 🖼️ Bildkompressor - Windows EXE

Eine vollständige Windows-Anwendung zur Bildkompression mit moderner Web-UI und leistungsstarker Backend-Verarbeitung.

## ✨ Features

- **🚀 Single-File EXE**: Vollständig eigenständige Windows-Anwendung
- **🖼️ Multi-Format Support**: JPEG, PNG, WebP
- **⚙️ Einstellbare Qualität**: Qualitätsregler von 10% bis 100%
- **🔄 Cluster-Processing**: Nutzt mehrere CPU-Kerne für schnelle Verarbeitung
- **📊 Live-Statistiken**: Echtzeitanzeige der Warteschlange und Verarbeitung
- **🎨 Moderne UI**: Drag & Drop, Responsive Design, Progress-Anzeige
- **💾 Direkt-Download**: Komprimierte Bilder sofort herunterladen

## 🛠️ Installation & Build

### Voraussetzungen
- Node.js 16+ installiert
- PNPM package manager

### Schritt 1: Dependencies installieren
```bash
pnpm install
```

### Schritt 2: Windows EXE erstellen
```bash
pnpm run build:win
```

Das Build-Script:
- Installiert automatisch `pkg` falls nicht vorhanden
- Nutzt die Standalone-Version ohne Redis-Abhängigkeit
- Erstellt `dist/compressor.exe` (~40-50MB)
- Komprimiert mit Brotli für kleinere Dateigröße

## 🚀 Verwendung

### EXE starten
```bash
.\dist\compressor.exe
```

**Was passiert beim Start:**
1. ✅ HTTP-Server startet auf Port 3000
2. 🌐 Browser öffnet automatisch http://localhost:3000
3. 📋 Konsole zeigt Status-Updates und Job-Informationen

### Web-Interface verwenden

1. **📁 Bild auswählen**: Drag & Drop oder "Datei auswählen"
2. **⚙️ Einstellungen**: Qualität (10-100%) und Format wählen
3. **🚀 Komprimieren**: Button klicken und Verarbeitung abwarten
4. **💾 Download**: Komprimiertes Bild herunterladen

## 📁 Projektstruktur

```
bildkompressor/
├── server.js              # Haupt-Server (mit Redis/Bull-Queue)
├── server-standalone.js   # Standalone-Version für EXE-Build
├── build-exe.js          # Automatisches Build-Script
├── package.json          # Dependencies und Scripts
├── public/
│   └── index.html        # Web-UI mit modernem Design
└── dist/
    └── compressor.exe    # Fertige Windows-Anwendung
```

## 🔧 Entwicklung

### Development-Server starten
```bash
# Mit Redis/Bull-Queue (empfohlen für Entwicklung)
pnpm run dev

# Standalone-Version testen
pnpm run start:standalone
```

### Available Scripts
- `pnpm start` - Produktions-Server mit Redis
- `pnpm run dev` - Development mit Nodemon
- `pnpm run start:standalone` - Standalone ohne Redis
- `pnpm run build:win` - Windows EXE erstellen
- `pnpm run build` - Alias für build:win

## ⚙️ Technische Details

### Server-Features
- **Express.js**: Web-Server und API
- **Cluster**: Multi-Core CPU-Nutzung
- **Sharp**: Hochperformante Bildverarbeitung
- **Multer**: File-Upload Handling
- **In-Memory Queue**: Für EXE-Build (ohne Redis)

### UI-Features
- **Responsive Design**: Mobile & Desktop optimiert
- **Drag & Drop**: Intuitive Datei-Auswahl
- **Live Progress**: Echtzeitanzeige der Verarbeitung
- **Format-Unterstützung**: JPEG, PNG, WebP
- **Statistiken**: Server-Status und Warteschlange

### Build-Process
- **PKG**: Erstellt Single-File EXE
- **Node.js 18**: Target-Runtime
- **Brotli-Kompression**: Kleinere EXE-Datei
- **Asset-Bundling**: HTML/CSS automatisch eingebunden

## 🖥️ System-Anforderungen

- **OS**: Windows 7/8/10/11 (x64)
- **RAM**: Mindestens 1GB verfügbar
- **CPU**: Multi-Core empfohlen für beste Performance
- **Port**: 3000 muss verfügbar sein

## 📊 Performance

- **Cluster-Mode**: Nutzt alle verfügbaren CPU-Kerne
- **Memory-Efficient**: Streaming-Processing für große Dateien
- **Fast Processing**: Sharp-Library für optimierte Bildverarbeitung
- **Queue-System**: Verhindert Überlastung bei vielen gleichzeitigen Uploads

## 🐛 Troubleshooting

**EXE startet nicht:**
- Port 3000 bereits belegt → Anderer Port in server-standalone.js konfigurieren
- Antivirus blockiert → Ausnahme hinzufügen

**Browser öffnet nicht automatisch:**
- Manuell http://localhost:3000 aufrufen
- Firewall-Einstellungen prüfen

**Build-Fehler:**
- Node.js Version prüfen (16+ erforderlich)
- `pnpm install` erneut ausführen
- PKG global installieren: `pnpm install -g pkg`

## 📄 Lizenz

MIT License - Siehe LICENSE Datei für Details

## 👨‍💻 Entwickelt mit

- **Node.js & Express.js** - Backend
- **Sharp** - Bildverarbeitung
- **PKG** - EXE-Packaging
- **Modern Vanilla JS** - Frontend
- **CSS Grid & Flexbox** - Responsive Layout

---

**🎯 Ready-to-use**: Nach `pnpm install` und `pnpm run build:win` ist die EXE sofort einsatzbereit!