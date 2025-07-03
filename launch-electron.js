const { spawn } = require('child_process');
const path = require('path');

// Set environment variables
process.env.NODE_ENV = 'development';
process.env.ELECTRON_RENDERER_URL = 'http://localhost:5173';

// Path to electron executable
const electronPath = path.join(__dirname, 'node_modules', '.bin', 'electron.cmd');

// Launch Electron
const electron = spawn(electronPath, ['.'], {
  stdio: 'inherit',
  shell: true,
  cwd: __dirname
});

electron.on('close', (code) => {
  console.log(`Electron exited with code ${code}`);
});
