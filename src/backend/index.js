const BackendServer = require('./server');

// Mark that we're running as a standalone backend
process.env.ELECTRON_MAIN_PROCESS = false;

// Create and start the server
const server = new BackendServer();

async function start () {
  try {
    await server.initialize();
    const port = await server.start();
    console.log(`Backend server is running on port ${port}`);
  } catch (error) {
    console.error('Failed to start backend server:', error);
    process.exit(1);
  }
}

// Handle graceful shutdown
process.on('SIGINT', async () => {
  console.log('\nShutting down backend server...');
  await server.stop();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  console.log('\nShutting down backend server...');
  await server.stop();
  process.exit(0);
});

// Start the server
start();
