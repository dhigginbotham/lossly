# 🎯 Lossly - Beautiful Image Compression

![Lossly Logo](public/icon.png)

Lossly is a VIBE-coded Electron application that provides beautiful image compression with real-time preview. Built with love using Electron, React, Chakra UI, and powered by multiple compression engines.

## ✨ Features

- 🖼️ **Real-time Image Comparison** - Side-by-side comparison with draggable divider
- 📦 **Batch Processing** - Process multiple images simultaneously with worker threads
- 🎨 **Format Conversion** - Convert between JPEG, PNG, WebP, GIF, and SVG formats
- ⚙️ **Advanced Settings** - Full control over compression parameters with tooltips
- 💾 **Compression History** - Track all your compressions with detailed statistics
- 🎯 **Presets** - Save and reuse your favorite compression settings
- 🌙 **Beautiful Dark Theme** - VIBE-coded Chakra UI with glassmorphism effects
- ⚡ **Blazing Fast** - Multi-threaded compression with hardware acceleration

## 🏗️ Project Structure

```
lossly/
├── src/
│   ├── main/              # Electron main process
│   │   └── index.js       # Main entry point
│   ├── preload/           # Preload scripts
│   │   └── index.js       # Secure IPC bridge
│   ├── renderer/          # React frontend
│   │   ├── components/    # React components
│   │   ├── stores/        # Zustand state management
│   │   ├── hooks/         # Custom React hooks
│   │   ├── services/      # Frontend services
│   │   ├── theme/         # Chakra UI theme
│   │   └── App.jsx        # Main React app
│   └── backend/           # Express backend
│       ├── server.js      # Express server
│       ├── routes/        # API routes
│       ├── services/      # Backend services
│       └── workers/       # Worker threads
├── docs/                  # Documentation
├── public/                # Static assets
└── package.json           # Project configuration
```

## 🚀 Getting Started

### Prerequisites

- Node.js v20.0.0 or higher
- npm or yarn

### Installation

```bash
# Clone the repository
git clone https://github.com/yourusername/lossly.git
cd lossly

# Install dependencies
npm install

# Start development
npm run dev
```

### Development Scripts

```bash
npm run dev         # Start Electron app in development mode
npm run build       # Build the application
npm run dist        # Build distributables for current platform
npm run dist:all    # Build for all platforms
npm test           # Run tests
npm run lint        # Run ESLint
```

## 🛠️ Technology Stack

### Frontend
- **React 18** - UI library
- **Chakra UI** - Component library with custom VIBE theme
- **Zustand** - State management
- **Vite** - Build tool
- **Framer Motion** - Animations

### Backend
- **Electron** - Desktop framework
- **Express** - Web server
- **SQLite** - Local database
- **compress-images** - Image compression
- **Sharp** - High-performance image processing
- **Worker Threads** - Parallel processing

### Compression Engines
- **mozjpeg** - JPEG optimization
- **pngquant** - PNG optimization
- **gifsicle** - GIF optimization
- **svgo** - SVG optimization
- **WebP** - Modern image format

## 📸 Screenshots

### Main Compression View
![Compression View](docs/screenshots/compression.png)

### Batch Processing
![Batch Processing](docs/screenshots/batch.png)

### Settings Panel
![Settings](docs/screenshots/settings.png)

## 🔧 Configuration

### Compression Settings

```javascript
{
  format: 'jpeg',      // Output format
  quality: 85,         // 0-100 quality
  resize: {
    maxWidth: 1920,    // Maximum width
    maxHeight: 1080,   // Maximum height
    maintainAspectRatio: true
  },
  advanced: {
    progressive: true,  // Progressive encoding
    stripMetadata: true,// Remove EXIF data
    optimizationLevel: 3 // PNG optimization
  }
}
```

### Worker Pool Configuration

```javascript
{
  minWorkers: 1,
  maxWorkers: CPU_CORES - 1,
  idleTimeout: 60000,
  taskTimeout: 300000,
  memoryLimit: 512MB
}
```

## 📦 Building & Distribution

### Building for Production

```bash
# Windows
npm run dist:win

# macOS
npm run dist:mac

# Linux
npm run dist:linux

# All platforms
npm run dist:all
```

### Code Signing

1. **Windows**: Set `WINDOWS_CERT_FILE` and `WINDOWS_CERT_PASSWORD` environment variables
2. **macOS**: Configure Apple Developer certificates and notarization
3. **Linux**: No code signing required

## 🧪 Testing

```bash
# Unit tests
npm run test:unit

# Integration tests
npm run test:integration

# E2E tests
npm run test:e2e

# All tests
npm test
```

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Built with ❤️ by the Lossly team
- Special thanks to all contributors
- Inspired by the need for beautiful, efficient image compression

## 📞 Support

- 📧 Email: support@lossly.app
- 🐛 Issues: [GitHub Issues](https://github.com/yourusername/lossly/issues)
- 💬 Discord: [Join our community](https://discord.gg/lossly)

---

**Lossly** - Making image compression beautiful and efficient! 🚀
