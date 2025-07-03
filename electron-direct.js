// Direct Electron app to test batch processing
const { app, BrowserWindow, ipcMain, dialog } = require('electron');
const path = require('path');
const fs = require('fs').promises;

let mainWindow;

function createWindow () {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      preload: path.join(__dirname, 'src/preload/index.js'),
      nodeIntegration: false,
      contextIsolation: true
    }
  });

  // Load the Vite dev server URL
  mainWindow.loadURL('http://localhost:5176');

  // Open DevTools
  mainWindow.webContents.openDevTools();
}

app.whenReady().then(() => {
  console.log('Electron app is ready');

  // IPC handlers
  ipcMain.handle('dialog:openFile', async () => {
    const { canceled, filePaths } = await dialog.showOpenDialog({
      properties: ['openFile'],
      filters: [
        { name: 'Images', extensions: ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg'] },
        { name: 'All Files', extensions: ['*'] }
      ]
    });
    if (!canceled) {
      return filePaths[0];
    }
    return null;
  });

  ipcMain.handle('dialog:saveFile', async (event, defaultName) => {
    const { canceled, filePath } = await dialog.showSaveDialog({
      defaultPath: defaultName,
      filters: [
        { name: 'Images', extensions: ['jpg', 'jpeg', 'png', 'gif', 'webp'] },
        { name: 'All Files', extensions: ['*'] }
      ]
    });
    if (!canceled) {
      return filePath;
    }
    return null;
  });

  ipcMain.handle('dialog:showOpenDialog', async (event, options) => {
    const result = await dialog.showOpenDialog(options);
    return result;
  });

  ipcMain.handle('file:getStats', async (event, filePath) => {
    try {
      const stats = await fs.stat(filePath);
      return {
        size: stats.size,
        isFile: stats.isFile(),
        isDirectory: stats.isDirectory(),
        mtime: stats.mtime,
        ctime: stats.ctime
      };
    } catch (error) {
      throw new Error(`Failed to get file stats: ${error.message}`);
    }
  });

  ipcMain.handle('app:getVersion', () => '1.0.0');
  ipcMain.handle('app:getBackendUrl', () => 'http://localhost:3001');

  createWindow();
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

console.log('Starting Electron app directly...');
