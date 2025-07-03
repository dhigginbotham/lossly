const { spawn } = require('child_process');
const path = require('path');

console.log('Starting Electron app test...\n');

// Run the Electron app
const electron = spawn('npx', ['electron', '.'], {
  cwd: path.join(__dirname),
  stdio: 'inherit',
  shell: true,
  env: {
    ...process.env,
    ELECTRON_ENABLE_LOGGING: '1',
    NODE_ENV: 'development'
  }
});

console.log('Electron app starting...');
console.log('When the app opens:');
console.log('1. Go to Batch tab');
console.log('2. Press Ctrl+Shift+I to open DevTools');
console.log('3. In Console, check for errors');
console.log('4. Type: window.api');
console.log('5. Try dragging images to batch area\n');

electron.on('close', (code) => {
  console.log(`Electron app closed with code ${code}`);
});

electron.on('error', (err) => {
  console.error('Failed to start Electron app:', err);
});
