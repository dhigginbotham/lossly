// Simple development launcher for Electron app
const { spawn } = require('child_process');
const path = require('path');

// First, ensure the backend is running
console.log('Starting backend server...');
const backend = spawn('node', ['src/backend/index.js'], {
  stdio: 'inherit',
  shell: true
});

// Wait a bit for backend to start
setTimeout(() => {
  console.log('Starting Vite dev server...');

  // Start Vite for the renderer
  const vite = spawn('npx', ['vite', '--port', '5173'], {
    stdio: 'inherit',
    shell: true,
    cwd: __dirname
  });

  // Wait for Vite to start
  setTimeout(() => {
    console.log('Building main process...');

    // Build the main process first
    const buildMain = spawn('npx', ['electron-vite', 'build', '--mode', 'development', '--config', 'electron.vite.config.js'], {
      stdio: 'inherit',
      shell: true
    });

    buildMain.on('close', (code) => {
      if (code !== 0) {
        console.error('Failed to build main process');
        process.exit(1);
      }

      console.log('Starting Electron app...');

      // Set environment variables
      process.env.NODE_ENV = 'development';
      process.env.ELECTRON_RENDERER_URL = 'http://localhost:5173';

      // Start Electron with the built file
      const electronPath = path.join(__dirname, 'node_modules', 'electron', 'dist', 'electron.exe');
      const electron = spawn(electronPath, ['dist/main/index.js'], {
        stdio: 'inherit',
        shell: false,
        env: process.env
      });

      // Handle process cleanup
      const cleanup = () => {
        console.log('Cleaning up processes...');
        electron.kill();
        vite.kill();
        backend.kill();
        process.exit();
      };

      process.on('SIGINT', cleanup);
      process.on('SIGTERM', cleanup);

      electron.on('close', (code) => {
        console.log(`Electron exited with code ${code}`);
        cleanup();
      });
    });

  }, 3000); // Wait 3 seconds for Vite to start

}, 2000); // Wait 2 seconds for backend to start
