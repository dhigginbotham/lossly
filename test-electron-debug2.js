console.log('Starting Electron debug test 2...');

try {
  const electron = require('electron');
  console.log('Electron type:', typeof electron);
  console.log('Is Array?', Array.isArray(electron));

  // Try to access electron properties differently
  if (typeof electron === 'object' && electron !== null) {
    console.log('Trying to access electron.app:', electron.app);
    console.log('Trying to access electron["app"]:', electron["app"]);

    // Check if it's the browser process
    if (process.type === 'browser' || !process.type) {
      console.log('Attempting to destructure electron...');
      const { app, BrowserWindow } = require('electron');
      console.log('Destructured app:', app);
      console.log('Destructured BrowserWindow:', BrowserWindow);
    }
  }

  // Check the main electron module
  console.log('\nChecking electron module path:');
  console.log(require.resolve('electron'));

} catch (error) {
  console.error('Error:', error);
}
