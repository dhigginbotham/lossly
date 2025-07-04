# 🎯 Lossly - Beautiful Image Compression

![Lossly Logo](public/icon.png)

Lossly is a VIBE-coded Electron application that provides beautiful image compression with real-time preview. Built with love using Electron, React, Chakra UI, and powered by multiple compression engines.

## ✨ Features

### 🖼️ **Core Compression**
- **Real-time Image Comparison** - Side-by-side comparison with draggable divider
- **Format Conversion** - Convert between JPEG, PNG, WebP, GIF, and SVG formats
- **Advanced Settings** - Full control over compression parameters with helpful tooltips
- **Hardware Acceleration** - Multi-threaded compression for blazing fast performance

### 📦 **Batch Processing**
- **Multi-Image Processing** - Process hundreds of images simultaneously
- **Real-time Progress Tracking** - Live progress updates with visual indicators
- **Image Previews** - Thumbnail previews of all batch items
- **Drag & Drop Support** - Simply drag images into the batch area
- **Selective Processing** - Choose which images to process with checkboxes
- **Download Management** - Batch download all processed images

### 🎯 **Smart Presets System**
- **Built-in Presets** - 4 professionally crafted presets:
  - 🌐 **Web Optimized** - Perfect for websites (85% quality, 1920px max width)
  - 📧 **Email Attachment** - Email-friendly sizes (70% quality, 1024px max width)
  - 📱 **Social Media** - High quality for social platforms (90% quality, 2048px max width)
  - ✨ **High Quality** - Minimal compression for maximum quality (95% quality)
- **Custom Presets** - Create, edit, and manage your own compression presets
- **One-Click Apply** - Instantly apply any preset to your compression settings
- **Preset Duplication** - Copy existing presets as starting points for new ones

### 📊 **Advanced History Management**
- **Comprehensive Tracking** - Complete history of all compression activities
- **Smart Search & Filtering** - Find images by name, date range, or compression type
- **Detailed Statistics** - Track total savings, average reduction, and format breakdowns
- **Visual History** - Real image thumbnails in history view
- **Data Export** - Export history data in JSON or CSV formats for analysis
- **History Cleanup** - Automatic cleanup of old or corrupted history entries
- **Quick Actions** - Open images, show in folder, or recompress directly from history

### 🛠️ **Professional Tools**
- **Shell Integration** - Open compressed images with default applications
- **File Management** - Show images in file explorer with one click
- **Data Validation** - Robust error handling and data integrity checks
- **Performance Monitoring** - Track compression time and file size statistics
- **Memory Management** - Optimized for handling large batches efficiently

### 🎨 **Beautiful Interface**
- **Dark Theme** - VIBE-coded Chakra UI with glassmorphism effects
- **Smooth Animations** - Framer Motion powered transitions
- **Responsive Design** - Adapts to different window sizes
- **Intuitive Navigation** - Clean sidebar navigation between views
- **Progress Indicators** - Visual feedback for all operations

## 🏗️ Project Structure

```
lossly/
├── src/
│   ├── main/              # Electron main process
│   │   └── index.js       # Main entry point with IPC handlers
│   ├── preload/           # Preload scripts
│   │   └── index.js       # Secure IPC bridge with API exposure
│   ├── renderer/          # React frontend
│   │   ├── components/    # React components
│   │   │   ├── views/     # Main application views
│   │   │   ├── layout/    # Layout components
│   │   │   ├── common/    # Shared components
│   │   │   └── ...        # Feature-specific components
│   │   ├── stores/        # Zustand state management
│   │   │   ├── appStore.js      # Main application state
│   │   │   ├── batchStore.js    # Batch processing state
│   │   │   ├── historyStore.js  # History management
│   │   │   ├── imageStore.js    # Image handling state
│   │   │   └── settingsStore.js # Settings and presets
│   │   ├── hooks/         # Custom React hooks
│   │   ├── services/      # Frontend services
│   │   ├── theme/         # Chakra UI theme
│   │   └── App.jsx        # Main React app
│   └── backend/           # Express backend
│       ├── server.js      # Express server setup
│       ├── routes/        # API routes
│       │   ├── compression.js # Image compression endpoints
│       │   ├── batch.js      # Batch processing endpoints
│       │   ├── history.js    # History management endpoints
│       │   └── settings.js   # Settings and presets endpoints
│       ├── services/      # Backend services
│       │   ├── databaseService.js # SQLite database operations
│       │   └── workerPoolService.js # Worker thread management
│       └── workers/       # Worker threads
│           └── compressionWorker.js # Image compression worker
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
npm run dev              # Start Electron app in development mode
npm run dev:main         # Start only the Electron main process
npm run dev:renderer     # Start only the Vite dev server
npm run dev:server       # Start only the Express backend
npm run build            # Build the application
npm run build:main       # Build Electron main process
npm run build:renderer   # Build React frontend
npm run dist             # Build distributables for current platform
npm run dist:win         # Build for Windows
npm run dist:mac         # Build for macOS
npm run dist:linux       # Build for Linux
npm test                 # Run all tests
npm run test:unit        # Run unit tests
npm run test:e2e         # Run end-to-end tests
npm run lint             # Run ESLint
```

## 🛠️ Technology Stack

### Frontend
- **React 18** - Modern UI library with hooks and concurrent features
- **Chakra UI v2** - Component library with custom VIBE theme and dark mode
- **Zustand** - Lightweight state management with persistence
- **Vite** - Next-generation build tool with HMR
- **Framer Motion** - Production-ready motion library for animations
- **React Dropzone** - Drag & drop file uploads with image preview

### Backend
- **Electron 30** - Cross-platform desktop framework
- **Express 4** - Fast, unopinionated web framework
- **SQLite 3** - Embedded SQL database with full ACID compliance
- **Sharp** - High-performance image processing for Node.js
- **SVGO** - SVG optimization with plugin architecture
- **Worker Threads** - CPU-intensive task parallelization

### Compression Engines
- **Sharp** - JPEG, PNG, WebP, AVIF processing
- **SVGO** - SVG optimization and minification
- **Built-in Electron** - Native image format support

## 📸 Screenshots

> **Note**: Screenshots are currently being captured and will be added soon to showcase the new v1.1.0 features including the enhanced batch processing, smart presets system, and advanced history management.

**Planned Screenshots:**
- **Main Compression View** - Real-time side-by-side comparison with draggable divider
- **Batch Processing Dashboard** - Multi-image processing with progress tracking
- **Smart Presets System** - Built-in and custom presets management
- **Advanced History & Analytics** - Comprehensive tracking with search and filtering
- **Settings & Configuration** - Fine-tuned compression parameters

## 📸 Application Views

### 🖼️ Main Compression View
The primary interface for single image compression with real-time preview and side-by-side comparison.

**Key Features:**
- Drag & drop image upload
- Real-time compression preview
- Draggable divider for before/after comparison
- Compression settings panel
- File size and reduction statistics
- Save and export options

### 📦 Batch Processing View
Process multiple images simultaneously with professional workflow tools.

**Key Features:**
- Multi-image drag & drop support
- Real-time progress tracking with visual indicators
- Image thumbnail previews in batch queue
- Selective processing with checkboxes
- Batch statistics (total saved, completion rate)
- Download all processed images

### 🎯 Presets Management
Save and manage compression presets for different use cases.

**Built-in Presets:**
- **🌐 Web Optimized**: JPEG 85%, max 1920px width, progressive encoding
- **📧 Email Attachment**: JPEG 70%, max 1024px width, metadata stripped
- **📱 Social Media**: JPEG 90%, max 2048px width, high quality
- **✨ High Quality**: 95% quality, original dimensions, minimal compression

**Custom Presets:**
- Create unlimited custom presets
- Configure format, quality, dimensions, and advanced options
- Edit existing presets (custom ones only)
- Duplicate presets as starting points
- One-click preset application

### 📊 History & Analytics
Comprehensive tracking and analysis of all compression activities.

**History Features:**
- Complete compression history with thumbnails
- Advanced search and filtering (by name, date, type)
- Detailed statistics and analytics
- Export history data (JSON/CSV formats)
- Quick actions (open image, show in folder, recompress)
- Automatic cleanup of corrupted entries

**Statistics Tracked:**
- Total images processed
- Total file size savings
- Average compression ratio
- Format breakdown (JPEG, PNG, WebP, etc.)
- Type breakdown (compression, conversion, batch)
- Daily processing summaries

### ⚙️ Settings & Configuration
Fine-tune compression parameters and application preferences.

**Compression Settings:**
- Output format selection
- Quality slider (1-100%)
- Resize options (max width/height)
- Advanced options (progressive, metadata, optimization level)
- Real-time preview updates

## 🔧 Configuration

### Compression Settings Schema

```javascript
{
  format: 'jpeg',           // 'same', 'jpeg', 'png', 'webp', 'gif'
  quality: 85,              // 1-100 quality percentage
  resize: {
    maxWidth: 1920,         // Maximum width in pixels (null = no limit)
    maxHeight: 1080,        // Maximum height in pixels (null = no limit)  
    maintainAspectRatio: true // Preserve aspect ratio when resizing
  },
  advanced: {
    progressive: true,       // Progressive JPEG encoding
    stripMetadata: true,     // Remove EXIF and other metadata
    optimizationLevel: 3     // PNG optimization level (1-6)
  }
}
```

### Preset Configuration

```javascript
{
  id: 'web-optimized',      // Unique identifier
  name: 'Web Optimized',    // Display name
  description: 'Best for website images...',
  icon: '🌐',               // Emoji icon
  isDefault: true,          // Built-in preset flag
  settings: {
    // ... compression settings schema above
  }
}
```

### Worker Pool Configuration

```javascript
{
  minWorkers: 1,                    // Minimum active workers
  maxWorkers: Math.max(1, os.cpus().length - 1), // CPU cores - 1
  idleTimeout: 60000,               // Worker idle timeout (ms)
  taskTimeout: 300000,              // Maximum task time (ms)
  memoryLimit: 512 * 1024 * 1024    // Memory limit per worker (bytes)
}
```

### Database Schema

The application uses SQLite with the following main tables:

- **history** - Compression history with metadata
- **settings** - Application configuration
- **presets** - User-defined compression presets  
- **batch_jobs** - Batch processing job tracking
- **batch_items** - Individual items within batch jobs

## 📦 Building & Distribution

### Development Build

```bash
# Start development environment
npm run dev

# Individual services
npm run dev:main      # Electron main process
npm run dev:renderer  # React frontend (Vite)
npm run dev:server    # Express backend
```

### Production Build

```bash
# Build all components
npm run build

# Platform-specific builds
npm run dist:win      # Windows (NSIS installer, portable)
npm run dist:mac      # macOS (DMG, App Store)
npm run dist:linux    # Linux (AppImage, deb, rpm, snap)
```

### Build Outputs

- **Windows**: `.exe` installer, portable `.exe`
- **macOS**: `.dmg` installer, `.app` bundle
- **Linux**: `.AppImage`, `.deb`, `.rpm`, `.snap`

### Code Signing

1. **Windows**: Configure `WINDOWS_CERT_FILE` and `WINDOWS_CERT_PASSWORD`
2. **macOS**: Set up Apple Developer certificates and notarization
3. **Linux**: No code signing required (uses checksums)

## 🧪 Testing

### Test Suites

```bash
# Run all tests
npm test

# Specific test types  
npm run test:unit         # Jest unit tests
npm run test:integration  # Integration tests
npm run test:e2e          # Playwright end-to-end tests
npm run test:e2e:ui       # E2E tests with UI
npm run test:e2e:debug    # Debug E2E tests
```

### Test Coverage

- **Unit Tests**: Component logic, store operations, utility functions
- **Integration Tests**: API endpoints, database operations, file handling
- **E2E Tests**: Complete user workflows, cross-platform compatibility

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Development Guidelines

- Follow the existing code style and patterns
- Add tests for new features
- Update documentation for significant changes
- Ensure cross-platform compatibility
- Test with various image formats and sizes

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Built with ❤️ by the Lossly team
- Special thanks to all contributors and beta testers
- Inspired by the need for beautiful, efficient image compression tools
- Powered by amazing open-source libraries and tools

## 📞 Support

- 📧 Email: support@lossly.app
- 🐛 Issues: [GitHub Issues](https://github.com/yourusername/lossly/issues)
- 💬 Discord: [Join our community](https://discord.gg/lossly)
- 📖 Documentation: [Full documentation](https://docs.lossly.app)

---

**Lossly v1.1.0** - Making image compression beautiful, intelligent, and efficient! 🚀

*New in v1.1.0: Enhanced history management, comprehensive presets system, advanced batch processing, data export capabilities, and shell integration for professional workflows.*
