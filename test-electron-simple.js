const { app, BrowserWindow } = require('electron');

console.log('Electron test starting...');
console.log('app object:', app);
console.log('process.type:', process.type);

if (!app) {
  console.error('ERROR: app is undefined!');
  process.exit(1);
}

app.whenReady().then(() => {
  console.log('App is ready!');

  const win = new BrowserWindow({
    width: 800,
    height: 600
  });

  win.loadURL('https://www.google.com');

  setTimeout(() => {
    console.log('Test completed successfully!');
    app.quit();
  }, 3000);
});

app.on('window-all-closed', () => {
  app.quit();
});
