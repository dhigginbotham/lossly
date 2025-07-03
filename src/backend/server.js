const express = require('express');
const cors = require('cors');
const path = require('path');
const { initializeDatabase } = require('./services/databaseService');
const { initializeWorkerPool } = require('./services/workerPoolService');
const compressionRoutes = require('./routes/compression');
const batchRoutes = require('./routes/batch');
const conversionRoutes = require('./routes/conversion');
const historyRoutes = require('./routes/history');
const settingsRoutes = require('./routes/settings');

class BackendServer {
  constructor() {
    this.app = express();
    this.server = null;
    this.port = process.env.BACKEND_PORT || 3001;
  }

  async initialize () {
    // Initialize database
    await initializeDatabase();

    // Initialize worker pool
    await initializeWorkerPool();

    // Middleware
    this.app.use(cors());
    this.app.use(express.json({ limit: '50mb' }));
    this.app.use(express.urlencoded({ extended: true, limit: '50mb' }));

    // Static files for compressed images
    this.app.use('/output', express.static(path.join(__dirname, '../../output')));

    // API Routes
    this.app.use('/api/compression', compressionRoutes);
    this.app.use('/api/batch', batchRoutes);
    this.app.use('/api/conversion', conversionRoutes);
    this.app.use('/api/history', historyRoutes);
    this.app.use('/api/settings', settingsRoutes);

    // Health check
    this.app.get('/api/health', (req, res) => {
      res.json({ status: 'ok', timestamp: new Date().toISOString() });
    });

    // Error handling middleware
    this.app.use((err, req, res, next) => {
      console.error('Server error:', err);
      res.status(500).json({
        success: false,
        error: err.message || 'Internal server error',
      });
    });
  }

  start () {
    return new Promise((resolve, reject) => {
      try {
        this.server = this.app.listen(this.port, '127.0.0.1', () => {
          console.log(`Backend server running on http://127.0.0.1:${this.port}`);
          resolve(this.port);
        });

        this.server.on('error', (error) => {
          if (error.code === 'EADDRINUSE') {
            console.log(`Port ${this.port} is busy, trying ${this.port + 1}`);
            this.port++;
            this.server.close();
            this.start().then(resolve).catch(reject);
          } else {
            reject(error);
          }
        });
      } catch (error) {
        reject(error);
      }
    });
  }

  stop () {
    return new Promise((resolve) => {
      if (this.server) {
        this.server.close(() => {
          console.log('Backend server stopped');
          resolve();
        });
      } else {
        resolve();
      }
    });
  }
}

module.exports = BackendServer;
