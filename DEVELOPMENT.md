# Lossly Development Guide

## 🚀 Quick Start

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# This will:
# 1. Start the Vite dev server for React
# 2. Start the Electron app
# 3. Start the backend Express server
```

## 📁 Project Structure

```
lossly/
├── src/
│   ├── main/              # Electron main process
│   │   └── index.js       # App entry point, window management
│   ├── preload/           # Preload scripts
│   │   └── index.js       # Secure IPC bridge
│   ├── renderer/          # React frontend
│   │   ├── components/    # UI components
│   │   ├── stores/        # Zustand state stores
│   │   ├── theme/         # Chakra UI theme
│   │   ├── App.jsx        # Main React component
│   │   └── main.jsx       # React entry point
│   └── backend/           # Express backend
│       ├── server.js      # Express server setup
│       ├── routes/        # API endpoints
│       ├── services/      # Business logic
│       └── workers/       # Worker threads
├── public/                # Static assets
├── docs/                  # Documentation
└── dist/                  # Build output
```

## 🛠️ Development Commands

```bash
# Development
npm run dev              # Start in development mode
npm run dev:renderer     # Start only the renderer (React)
npm run dev:main         # Start only the main process
npm run dev:backend      # Start only the backend server

# Building
npm run build            # Build for production
npm run build:renderer   # Build renderer only
npm run build:main       # Build main process only

# Testing
npm test                 # Run all tests
npm run test:unit        # Run unit tests
npm run test:e2e         # Run E2E tests

# Linting & Formatting
npm run lint             # Run ESLint
npm run lint:fix         # Fix ESLint issues
npm run format           # Format with Prettier

# Distribution
npm run dist             # Build distributables
npm run dist:win         # Windows only
npm run dist:mac         # macOS only
npm run dist:linux       # Linux only
```

## 🔧 Key Technologies

### Frontend
- **React 18** - UI framework
- **Chakra UI** - Component library
- **Zustand** - State management
- **Vite** - Build tool
- **Framer Motion** - Animations

### Backend
- **Electron** - Desktop framework
- **Express** - API server
- **SQLite** - Local database
- **Worker Threads** - Parallel processing
- **Sharp** - Image processing
- **compress-images** - Image compression

## 🎯 Core Features

### 1. Image Compression
- Single image compression with real-time preview
- Draggable before/after comparison
- Multiple format support (JPEG, PNG, WebP, GIF, SVG)
- Advanced settings (quality, resize, metadata)

### 2. Batch Processing
- Process multiple images simultaneously
- Worker thread pool for parallel processing
- Progress tracking and pause/resume
- Batch download functionality

### 3. Format Conversion
- Convert between supported formats
- Visual before/after comparison
- Batch conversion support

### 4. History & Analytics
- Track all compressions
- View statistics and savings
- Export history data
- Filter and search functionality

### 5. Settings & Presets
- Customizable compression settings
- Save and load presets
- Application preferences
- Performance tuning

## 🔌 API Endpoints

### Compression
- `POST /api/compression/compress` - Compress single image
- `GET /api/compression/stats` - Get worker pool stats

### Batch
- `POST /api/batch/start` - Start batch processing
- `GET /api/batch/status/:id` - Get batch status
- `POST /api/batch/pause/:id` - Pause batch
- `POST /api/batch/resume/:id` - Resume batch

### Conversion
- `POST /api/conversion/convert` - Convert image format
- `GET /api/conversion/supported` - Get supported conversions

### History
- `GET /api/history` - Get history items
- `DELETE /api/history/:id` - Delete history item
- `GET /api/history/export/:format` - Export history

### Settings
- `GET /api/settings` - Get all settings
- `POST /api/settings` - Update settings
- `GET /api/settings/presets` - Get presets

## 🎨 UI Components

### Layout
- `Sidebar` - Navigation and quick actions
- `MainContent` - Main view container

### Views
- `CompressionView` - Single image compression
- `BatchView` - Batch processing
- `ConversionView` - Format conversion
- `HistoryView` - Compression history
- `SettingsView` - Application settings

### Common Components
- `DraggableDivider` - Before/after comparison
- `CompressionSettings` - Settings panel

## 🗄️ State Management

### Stores (Zustand)
- `appStore` - Application state (view, sidebar)
- `imageStore` - Current image data
- `batchStore` - Batch processing state
- `historyStore` - Compression history
- `settingsStore` - Application settings

## 🔐 Security

### Electron Security
- Context isolation enabled
- Node integration disabled
- Secure IPC communication via preload
- Content Security Policy

### API Security
- CORS configured
- Input validation
- Error handling
- Rate limiting (to be implemented)

## 🐛 Debugging

### Chrome DevTools
- Press `Ctrl+Shift+I` (Windows/Linux) or `Cmd+Option+I` (macOS)
- Available in development mode

### Logging
- Main process: Console logs appear in terminal
- Renderer process: Console logs in DevTools
- Backend: Logs in terminal with timestamps

### Environment Variables
```bash
# .env.development
VITE_API_URL=http://localhost:3001
BACKEND_PORT=3001
NODE_ENV=development
```

## 📦 Building for Production

1. **Update version** in `package.json`
2. **Build the app**: `npm run build`
3. **Test locally**: `npm run preview`
4. **Create distributables**: `npm run dist`

### Platform-specific Notes

#### Windows
- Requires code signing certificate
- Set `WINDOWS_CERT_FILE` and `WINDOWS_CERT_PASSWORD`

#### macOS
- Requires Apple Developer certificate
- Configure notarization in electron-builder.yml

#### Linux
- Builds AppImage, deb, rpm, and snap formats
- No code signing required

## 🧪 Testing Strategy

### Unit Tests
- Components: React Testing Library
- Stores: Zustand testing utilities
- Workers: Worker thread mocks

### Integration Tests
- API endpoints: Supertest
- Database operations: In-memory SQLite

### E2E Tests
- Electron app: Playwright
- User workflows: Automated scenarios

## 🚧 Known Issues

1. **Hot reload**: May require manual refresh for some changes
2. **Worker threads**: Debugging can be challenging
3. **File paths**: Ensure cross-platform compatibility

## 📝 Contributing

1. Create a feature branch
2. Make your changes
3. Run tests and linting
4. Submit a pull request

## 📞 Need Help?

- Check the [Architecture Plan](docs/ARCHITECTURE_PLAN.md)
- Review the [API Specification](docs/API_SPECIFICATION.md)
- See [UI Mockups](docs/UI_MOCKUPS.md)
- Read [Testing Workflow](docs/TESTING_AND_DEVELOPMENT_WORKFLOW.md)
