console.log('Starting Electron debug test...');
console.log('Process versions:', process.versions);
console.log('Process type:', process.type);

try {
  const electron = require('electron');
  console.log('Electron loaded:', !!electron);
  console.log('Electron keys:', Object.keys(electron));
  console.log('App object:', electron.app);

  if (electron.app) {
    electron.app.whenReady().then(() => {
      console.log('App is ready!');
      process.exit(0);
    });
  } else {
    console.error('App object is not available!');
    console.log('Running in:', process.type, 'process');
  }
} catch (error) {
  console.error('Error loading Electron:', error);
}
