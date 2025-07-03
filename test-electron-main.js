// This script should be run by Electron, not Node.js
console.log('Process type:', process.type);
console.log('Electron version:', process.versions.electron);

if (process.type === 'browser' || !process.type) {
  // We're in the main process
  const { app, BrowserWindow } = require('electron');
  const path = require('path');

  console.log('Main process - app available:', !!app);

  app.on('ready', () => {
    console.log('App is ready!');

    const win = new BrowserWindow({
      width: 1200,
      height: 800,
      webPreferences: {
        preload: path.join(__dirname, 'dist', 'preload', 'index.js'),
        contextIsolation: true,
        nodeIntegration: false
      }
    });

    // Try to load the built renderer
    const rendererPath = path.join(__dirname, 'out', 'renderer', 'index.html');
    console.log('Loading renderer from:', rendererPath);

    win.loadFile(rendererPath);
    win.webContents.openDevTools();

    win.webContents.on('did-finish-load', () => {
      console.log('Window loaded successfully!');
      // Check if window.api is available
      win.webContents.executeJavaScript('window.api').then(result => {
        console.log('window.api available:', !!result);
      });
    });

    win.webContents.on('did-fail-load', (event, errorCode, errorDescription) => {
      console.error('Failed to load:', errorCode, errorDescription);
    });
  });

  app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
      app.quit();
    }
  });
} else {
  console.error('This script should be run in the main process!');
}
