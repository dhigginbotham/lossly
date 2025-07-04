const express = require('express');
const router = express.Router();
const path = require('path');
const fs = require('fs').promises;
const { workerPool } = require('../services/workerPoolService');
const { databaseService } = require('../services/databaseService');

// Single image compression
router.post('/compress', async (req, res) => {
  try {
    const { imagePath, settings } = req.body;

    if (!imagePath || !settings) {
      return res.status(400).json({
        success: false,
        error: 'Missing required parameters',
      });
    }

    // Verify file exists
    try {
      await fs.access(imagePath);
    } catch (error) {
      return res.status(404).json({
        success: false,
        error: 'Image file not found',
      });
    }

    // Compress image using worker pool
    const result = await workerPool.compress(imagePath, settings);

    // Add to history with correct property names and validation
    await databaseService.addHistoryItem({
      id: Date.now().toString(),
      originalName: path.basename(result.originalPath || imagePath),
      originalPath: result.originalPath || imagePath,
      originalSize: Number(result.originalSize) || 0,
      originalFormat: result.originalFormat || 'unknown',
      outputName: result.outputName || '',
      outputPath: result.outputPath || '',
      outputSize: Number(result.outputSize) || Number(result.compressedSize) || 0,
      outputFormat: result.outputFormat || result.originalFormat || 'unknown',
      compressedSize: Number(result.compressedSize) || Number(result.outputSize) || 0,
      savedBytes: Number(result.savedBytes) || 0,
      reductionPercentage: Number(result.reductionPercentage) || 0,
      processingTime: Number(result.processingTime) || 0,
      settings,
      type: 'compression',
      timestamp: new Date().toISOString()
    });

    res.json({
      success: true,
      data: result,
    });
  } catch (error) {
    console.error('Compression error:', error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

// Get compression progress (for WebSocket in the future)
router.get('/progress/:taskId', async (req, res) => {
  try {
    const { taskId } = req.params;

    // This would be connected to a WebSocket or SSE in a real implementation
    res.json({
      success: true,
      data: {
        taskId,
        progress: 0,
        status: 'processing',
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

// Save compressed image to a different location
router.post('/save-as', async (req, res) => {
  try {
    const { sourcePath, targetPath } = req.body;

    if (!sourcePath || !targetPath) {
      return res.status(400).json({
        success: false,
        error: 'Missing required parameters',
      });
    }

    // Copy file to target location
    await fs.copyFile(sourcePath, targetPath);

    res.json({
      success: true,
      data: {
        path: targetPath,
      },
    });
  } catch (error) {
    console.error('Save error:', error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

// Get worker pool stats
router.get('/stats', (req, res) => {
  try {
    const stats = workerPool.getStats();
    res.json({
      success: true,
      data: stats,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

module.exports = router;
