import { app, BrowserWindow, ipcMain, dialog, shell } from 'electron';
import { join } from 'path';
import { electronApp, optimizer, is } from '@electron-toolkit/utils';
import { autoUpdater } from 'electron-updater';
import log from 'electron-log';
import { initializeDatabase } from '../backend/services/databaseService.js';
import { startExpressServer } from '../backend/server.js';
import { WorkerPoolManager } from '../backend/services/workerPoolService.js';

// Configure logging
log.transports.file.level = 'info';
autoUpdater.logger = log;

// Global reference to prevent garbage collection
let mainWindow = null;
let expressServer = null;
let workerPool = null;

// Enable sandboxing for all renderers
app.enableSandbox();

function createWindow () {
  // Create the browser window
  mainWindow = new BrowserWindow({
    width: 1400,
    height: 900,
    minWidth: 1000,
    minHeight: 700,
    show: false,
    autoHideMenuBar: true,
    titleBarStyle: process.platform === 'darwin' ? 'hiddenInset' : 'default',
    backgroundColor: '#1A202C',
    icon: join(__dirname, '../../public/icon.png'),
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      sandbox: true,
      contextIsolation: true,
      nodeIntegration: false,
      webSecurity: true
    }
  });

  mainWindow.on('ready-to-show', () => {
    mainWindow.show();
  });

  mainWindow.webContents.setWindowOpenHandler((details) => {
    shell.openExternal(details.url);
    return { action: 'deny' };
  });

  // Load the app
  if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
    mainWindow.loadURL(process.env['ELECTRON_RENDERER_URL']);
  } else {
    mainWindow.loadFile(join(__dirname, '../renderer/index.html'));
  }

  // Open DevTools in development
  if (is.dev) {
    mainWindow.webContents.openDevTools();
  }
}

// App event handlers
app.whenReady().then(async () => {
  // Set app user model ID for Windows
  electronApp.setAppUserModelId('com.lossly.app');

  // Default open or close DevTools by F12 in development
  // and ignore CommandOrControl + R in production
  app.on('browser-window-created', (_, window) => {
    optimizer.watchWindowShortcuts(window);
  });

  // Initialize services
  try {
    // Initialize database
    await initializeDatabase();
    log.info('Database initialized');

    // Start Express server
    expressServer = await startExpressServer();
    log.info('Express server started on port 3001');

    // Initialize worker pool
    workerPool = new WorkerPoolManager({
      minWorkers: 1,
      maxWorkers: Math.max(1, require('os').cpus().length - 1),
      idleTimeout: 60000,
      taskTimeout: 300000
    });
    log.info('Worker pool initialized');

    // Create main window
    createWindow();

    // Check for updates
    if (!is.dev) {
      autoUpdater.checkForUpdatesAndNotify();
    }
  } catch (error) {
    log.error('Failed to initialize app:', error);
    dialog.showErrorBox('Initialization Error',
      'Failed to start Lossly. Please try reinstalling the application.');
    app.quit();
  }
});

// Handle app activation (macOS)
app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

// Prevent multiple instances
const gotTheLock = app.requestSingleInstanceLock();

if (!gotTheLock) {
  app.quit();
} else {
  app.on('second-instance', () => {
    // Someone tried to run a second instance, focus our window instead
    if (mainWindow) {
      if (mainWindow.isMinimized()) mainWindow.restore();
      mainWindow.focus();
    }
  });
}

// Handle window closed
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

// Cleanup on quit
app.on('before-quit', async () => {
  log.info('Application shutting down...');

  // Stop worker pool
  if (workerPool) {
    await workerPool.shutdown();
  }

  // Stop Express server
  if (expressServer) {
    expressServer.close();
  }
});

// IPC Handlers
ipcMain.handle('compress-image', async (event, { path, settings, channel }) => {
  try {
    const result = await workerPool.compressImage(path, settings, (progress) => {
      event.sender.send(`${channel}-progress`, progress);
    });
    return result;
  } catch (error) {
    log.error('Compression error:', error);
    throw error;
  }
});

ipcMain.on('cancel-compression', () => {
  workerPool.cancelCurrentTask();
});

ipcMain.handle('estimate-size', async (event, { path, settings }) => {
  return workerPool.estimateCompressedSize(path, settings);
});

// Batch operations
ipcMain.handle('create-batch', async (event, options) => {
  return workerPool.createBatch(options);
});

ipcMain.handle('get-history', async (event, limit) => {
  const db = require('../backend/services/databaseService.js');
  return db.getCompressionHistory(limit);
});

ipcMain.handle('delete-history-item', async (event, id) => {
  const db = require('../backend/services/databaseService.js');
  return db.deleteHistoryItem(id);
});

ipcMain.handle('clear-history', async () => {
  const db = require('../backend/services/databaseService.js');
  return db.clearHistory();
});

// Theme handling
ipcMain.on('set-theme', (event, theme) => {
  mainWindow.webContents.send('theme-changed', theme);
});

// Hardware acceleration
ipcMain.on('set-hardware-acceleration', (event, enabled) => {
  if (enabled) {
    app.enableSandbox();
  } else {
    app.disableDomainBlockingFor3DAPIs();
  }
});

// File dialog handlers
ipcMain.handle('show-open-dialog', async () => {
  const result = await dialog.showOpenDialog(mainWindow, {
    properties: ['openFile', 'multiSelections'],
    filters: [
      { name: 'Images', extensions: ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg'] },
      { name: 'All Files', extensions: ['*'] }
    ]
  });
  return result;
});

ipcMain.handle('show-save-dialog', async (event, defaultPath) => {
  const result = await dialog.showSaveDialog(mainWindow, {
    defaultPath,
    filters: [
      { name: 'Images', extensions: ['jpg', 'jpeg', 'png', 'gif', 'webp'] },
      { name: 'All Files', extensions: ['*'] }
    ]
  });
  return result;
});

// Export for testing
export { mainWindow };
