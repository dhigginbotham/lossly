// Test if electron loads properly
console.log('Testing electron module loading...');

try {
  const electron = require('electron');
  console.log('Electron loaded successfully');
  console.log('Type of electron:', typeof electron);
  console.log('electron keys:', Object.keys(electron));
  console.log('electron.app:', electron.app);

  // Check if we're in main process
  if (electron.app) {
    console.log('Running in Electron main process');
    electron.app.quit();
  } else {
    console.log('NOT running in Electron main process - this is the issue!');
  }
} catch (error) {
  console.error('Failed to load electron:', error);
}
