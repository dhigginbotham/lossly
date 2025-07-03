console.log('process.versions:', process.versions);
console.log('Running in Electron?', !!process.versions.electron);

const electronModule = require('electron');
console.log('Type of electronModule:', typeof electronModule);
console.log('electronModule:', electronModule);

if (typeof electronModule === 'string') {
  console.log('ERROR: electron module is returning a string path instead of the API');
  console.log('This happens when not running in Electron main process');
  process.exit(1);
}

// Try to destructure
try {
  const { app } = electronModule;
  console.log('app:', app);
  if (app) {
    console.log('SUCCESS: Electron loaded properly');
    app.quit();
  }
} catch (error) {
  console.error('Failed to destructure electron:', error);
}
