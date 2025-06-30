# 🧪 Testing Strategy & Development Workflow

## 📋 Overview

This document outlines the comprehensive testing strategy and development workflow for the Lossly application, ensuring code quality, reliability, and maintainability across all components.

## 🎯 Testing Philosophy

- **Test Pyramid**: Unit > Integration > E2E tests
- **Coverage Target**: 80% minimum for critical paths
- **TDD Approach**: Write tests first for new features
- **Continuous Testing**: Tests run on every commit
- **Performance Testing**: Benchmark critical operations

## 🔬 Testing Strategy

### 1. Unit Testing

**Tools**: Jest, React Testing Library, Sinon

**Coverage Areas**:
- React components
- Utility functions
- Worker thread logic
- API endpoints
- State management

```javascript
// Example: Component Test
// src/renderer/components/__tests__/ImageComparator.test.jsx
import { render, screen, fireEvent } from '@testing-library/react';
import { ImageComparator } from '../ImageComparator';

describe('ImageComparator', () => {
  const mockImages = {
    original: { src: 'original.jpg', size: 5242880 },
    compressed: { src: 'compressed.jpg', size: 1048576 }
  };

  test('renders both images', () => {
    render(<ImageComparator {...mockImages} />);
    
    expect(screen.getByAltText('Original image')).toBeInTheDocument();
    expect(screen.getByAltText('Compressed image')).toBeInTheDocument();
  });

  test('draggable divider changes view ratio', () => {
    const { container } = render(<ImageComparator {...mockImages} />);
    const divider = container.querySelector('.divider-handle');
    
    fireEvent.mouseDown(divider);
    fireEvent.mouseMove(divider, { clientX: 100 });
    fireEvent.mouseUp(divider);
    
    expect(divider).toHaveStyle({ left: '100px' });
  });
});

// Example: Worker Thread Test
// src/backend/workers/__tests__/compressionWorker.test.js
import { Worker } from 'worker_threads';
import path from 'path';

describe('CompressionWorker', () => {
  let worker;

  beforeEach(() => {
    worker = new Worker(path.join(__dirname, '../compressionWorker.js'));
  });

  afterEach(() => {
    worker.terminate();
  });

  test('compresses JPEG with correct settings', (done) => {
    worker.on('message', (message) => {
      if (message.type === 'TASK_COMPLETE') {
        expect(message.result.compressionRatio).toBeLessThan(1);
        expect(message.result.outputPath).toMatch(/\.jpg$/);
        done();
      }
    });

    worker.postMessage({
      type: 'COMPRESS_IMAGE',
      task: {
        id: 'test-1',
        inputPath: 'test/fixtures/sample.jpg',
        outputPath: 'test/output/compressed.jpg',
        settings: { quality: 85, format: 'jpeg' }
      }
    });
  });
});
```

### 2. Integration Testing

**Tools**: Supertest, Jest, SQLite in-memory

**Coverage Areas**:
- API endpoint interactions
- Database operations
- Worker pool management
- File system operations

```javascript
// Example: API Integration Test
// src/backend/__tests__/compression.integration.test.js
import request from 'supertest';
import app from '../server';
import fs from 'fs-extra';

describe('Compression API Integration', () => {
  test('POST /api/compress handles file upload', async () => {
    const response = await request(app)
      .post('/api/compress')
      .attach('image', 'test/fixtures/sample.jpg')
      .field('settings', JSON.stringify({
        quality: 85,
        format: 'jpeg'
      }));

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.data.compressionRatio).toBeLessThan(1);
    
    // Verify output file exists
    const outputExists = await fs.pathExists(response.body.data.outputPath);
    expect(outputExists).toBe(true);
  });

  test('Batch processing completes successfully', async () => {
    // Create batch
    const createResponse = await request(app)
      .post('/api/batch/create')
      .send({
        name: 'Test Batch',
        settings: { quality: 80, format: 'jpeg' }
      });

    const batchId = createResponse.body.data.batchId;

    // Add files
    await request(app)
      .post(`/api/batch/${batchId}/add-files`)
      .attach('files', 'test/fixtures/image1.jpg')
      .attach('files', 'test/fixtures/image2.jpg');

    // Start processing
    await request(app)
      .post(`/api/batch/${batchId}/process`)
      .send({ concurrency: 2 });

    // Poll for completion
    let status;
    do {
      const statusResponse = await request(app)
        .get(`/api/batch/${batchId}/status`);
      status = statusResponse.body.data.status;
      await new Promise(resolve => setTimeout(resolve, 100));
    } while (status === 'processing');

    expect(status).toBe('completed');
  });
});
```

### 3. End-to-End Testing

**Tools**: Playwright, Spectron (Electron-specific)

**Coverage Areas**:
- Complete user workflows
- Electron main/renderer interaction
- Native dialog interactions
- Performance under load

```javascript
// Example: E2E Test
// test/e2e/imageCompression.e2e.test.js
import { test, expect } from '@playwright/test';
import { ElectronApplication, _electron } from 'playwright';

let electronApp;

test.beforeAll(async () => {
  electronApp = await _electron.launch({
    args: ['main.js'],
    env: { NODE_ENV: 'test' }
  });
});

test.afterAll(async () => {
  await electronApp.close();
});

test('complete image compression workflow', async () => {
  const window = await electronApp.firstWindow();
  
  // Wait for app to load
  await window.waitForSelector('.drop-zone');
  
  // Drag and drop image
  await window.locator('.drop-zone').hover();
  await window.mouse.down();
  await window.mouse.move(100, 100);
  await window.mouse.up();
  
  // Select file through dialog (mocked in test env)
  await electronApp.evaluate(async ({ dialog }) => {
    dialog.showOpenDialog = async () => ({
      filePaths: ['test/fixtures/large-photo.jpg'],
      canceled: false
    });
  });
  
  await window.click('button:has-text("Browse")');
  
  // Wait for image to load
  await window.waitForSelector('.image-preview');
  
  // Adjust settings
  await window.fill('input[name="quality"]', '75');
  await window.selectOption('select[name="format"]', 'webp');
  
  // Start compression
  await window.click('button:has-text("Compress")');
  
  // Wait for completion
  await window.waitForSelector('.compression-complete', { timeout: 10000 });
  
  // Verify results
  const ratio = await window.textContent('.compression-ratio');
  expect(parseFloat(ratio)).toBeLessThan(1);
  
  // Test comparison view
  await window.click('button:has-text("Compare")');
  await window.waitForSelector('.image-comparator');
  
  // Test divider drag
  const divider = await window.locator('.divider-handle');
  await divider.dragTo(window.locator('.image-comparator'), {
    targetPosition: { x: 200, y: 0 }
  });
});
```

### 4. Performance Testing

**Tools**: Artillery, k6, custom benchmarks

```javascript
// Example: Performance Benchmark
// test/performance/compression.benchmark.js
import { performance } from 'perf_hooks';
import { compressImage } from '../src/backend/services/compressionService';

describe('Compression Performance', () => {
  const testCases = [
    { name: 'Small JPEG (1MB)', file: 'small.jpg', expectedTime: 100 },
    { name: 'Medium PNG (5MB)', file: 'medium.png', expectedTime: 500 },
    { name: 'Large JPEG (20MB)', file: 'large.jpg', expectedTime: 2000 }
  ];

  testCases.forEach(({ name, file, expectedTime }) => {
    test(`${name} completes within ${expectedTime}ms`, async () => {
      const start = performance.now();
      
      await compressImage({
        inputPath: `test/fixtures/${file}`,
        outputPath: `test/output/${file}`,
        settings: { quality: 85 }
      });
      
      const duration = performance.now() - start;
      expect(duration).toBeLessThan(expectedTime);
    });
  });
});
```

## 🔄 Development Workflow

### 1. Git Workflow

**Branch Strategy**: Git Flow

```
main
  └── develop
       ├── feature/add-webp-support
       ├── feature/batch-processing
       └── bugfix/memory-leak-fix
       
release/1.0.0
hotfix/critical-crash-fix
```

**Commit Convention**: Conventional Commits

```
feat(compression): add WebP format support
fix(worker): resolve memory leak in batch processing
docs(api): update compression endpoint documentation
test(e2e): add batch processing workflow tests
refactor(ui): optimize image comparator performance
```

### 2. Development Setup

```bash
# Clone repository
git clone https://github.com/yourusername/lossly.git
cd lossly

# Install dependencies
npm install

# Setup pre-commit hooks
npm run prepare

# Start development
npm run dev

# Run in different modes
npm run dev:main     # Electron main process only
npm run dev:renderer # React app only
npm run dev:server   # Express server only
```

### 3. Code Style & Linting

**ESLint Configuration**:
```javascript
// .eslintrc.js
module.exports = {
  extends: [
    'eslint:recommended',
    'plugin:react/recommended',
    'plugin:@typescript-eslint/recommended',
    'prettier'
  ],
  rules: {
    'no-console': ['error', { allow: ['warn', 'error'] }],
    'react/prop-types': 'off', // Using TypeScript
    '@typescript-eslint/explicit-module-boundary-types': 'off'
  }
};
```

**Prettier Configuration**:
```javascript
// .prettierrc
{
  "semi": true,
  "trailingComma": "es5",
  "singleQuote": true,
  "printWidth": 80,
  "tabWidth": 2
}
```

### 4. Pre-commit Hooks

```javascript
// .husky/pre-commit
#!/bin/sh
npm run lint
npm run test:unit
npm run build:check
```

### 5. CI/CD Pipeline

```yaml
# .github/workflows/ci.yml
name: CI

on: [push, pull_request]

jobs:
  test:
    runs-on: ${{ matrix.os }}
    strategy:
      matrix:
        os: [ubuntu-latest, windows-latest, macos-latest]
        node: [18, 20]
    
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: ${{ matrix.node }}
      
      - name: Install dependencies
        run: npm ci
      
      - name: Lint
        run: npm run lint
      
      - name: Unit tests
        run: npm run test:unit
      
      - name: Integration tests
        run: npm run test:integration
      
      - name: Build
        run: npm run build
      
      - name: E2E tests
        if: matrix.os == 'ubuntu-latest'
        run: |
          npm run build:test
          xvfb-run npm run test:e2e
      
      - name: Upload coverage
        uses: codecov/codecov-action@v3
```

### 6. Release Process

```bash
# 1. Create release branch
git checkout -b release/1.0.0 develop

# 2. Bump version
npm version minor

# 3. Run release tests
npm run test:release

# 4. Build distributables
npm run dist

# 5. Create changelog
npm run changelog

# 6. Merge to main
git checkout main
git merge --no-ff release/1.0.0

# 7. Tag release
git tag -a v1.0.0 -m "Release version 1.0.0"

# 8. Merge back to develop
git checkout develop
git merge --no-ff release/1.0.0
```

## 🐛 Debugging Guide

### 1. Electron Debugging

```javascript
// Launch with debugging
npm run dev -- --inspect=9229

// In VS Code launch.json
{
  "type": "node",
  "request": "launch",
  "name": "Debug Main Process",
  "runtimeExecutable": "${workspaceFolder}/node_modules/.bin/electron",
  "args": [".", "--inspect=9229"],
  "env": {
    "NODE_ENV": "development"
  }
}
```

### 2. Worker Thread Debugging

```javascript
// Enable worker debugging
const worker = new Worker('./worker.js', {
  execArgv: ['--inspect-brk=9230']
});

// Debug logging
if (process.env.DEBUG_WORKERS) {
  worker.on('message', msg => {
    console.log(`[Worker ${worker.threadId}]`, msg);
  });
}
```

### 3. React DevTools

```javascript
// Enable React DevTools in Electron
if (process.env.NODE_ENV === 'development') {
  const {
    default: installExtension,
    REACT_DEVELOPER_TOOLS
  } = require('electron-devtools-installer');
  
  app.whenReady().then(() => {
    installExtension(REACT_DEVELOPER_TOOLS);
  });
}
```

## 📊 Test Coverage Requirements

| Component           | Minimum Coverage | Priority |
| ------------------- | ---------------- | -------- |
| Compression Logic   | 90%              | Critical |
| Worker Management   | 85%              | Critical |
| API Endpoints       | 80%              | High     |
| React Components    | 75%              | High     |
| Utility Functions   | 90%              | Medium   |
| Database Operations | 85%              | High     |

## 🚀 Performance Benchmarks

Performance tests must pass these thresholds:

- Image load time: < 100ms
- Compression start: < 50ms after settings change
- UI responsiveness: 60 FPS during interactions
- Worker spawn time: < 200ms
- Memory usage: < 500MB for typical usage
- Batch processing: > 5 images/second

---

This comprehensive testing and development workflow ensures high-quality, maintainable code throughout the Lossly application lifecycle.
