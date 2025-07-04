const express = require('express');
const router = express.Router();
const path = require('path');
const { workerPool } = require('../services/workerPoolService');
const { databaseService } = require('../services/databaseService');
const { EventEmitter } = require('events');

// Store active batch jobs
const activeBatches = new Map();

// Start batch processing
router.post('/start', async (req, res) => {
  try {
    const { items } = req.body;

    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'No items provided for batch processing',
      });
    }

    // Create batch job in database
    const batchId = await databaseService.createBatchJob({
      totalItems: items.length,
    });

    // Create event emitter for this batch
    const batchEmitter = new EventEmitter();
    activeBatches.set(batchId, {
      emitter: batchEmitter,
      isPaused: false,
      startTime: Date.now(),
    });

    // Add items to database and create mapping
    const itemMapping = new Map(); // Map client IDs to database IDs
    const dbItems = []; // Items with database IDs for processing

    for (const item of items) {
      // Get file stats to get the size
      const stats = await require('fs').promises.stat(item.path);

      // Generate a unique ID for the database
      const dbItemId = `${batchId}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

      await databaseService.addBatchItem({
        id: dbItemId,
        batchId,
        originalName: path.basename(item.path),
        originalPath: item.path,
        originalSize: stats.size,
        clientId: item.id, // Keep reference to client's ID
      });

      // Map client ID to database ID
      itemMapping.set(item.id, dbItemId);

      // Create item with database ID for processing
      dbItems.push({
        ...item,
        id: dbItemId,
        clientId: item.id,
      });
    }

    // Store mapping with batch
    const batchInfo = activeBatches.get(batchId);
    if (batchInfo) {
      batchInfo.itemMapping = itemMapping;
    }

    // Start processing in background with database IDs
    processBatch(batchId, dbItems);

    res.json({
      success: true,
      data: {
        batchId,
        totalItems: items.length,
      },
    });
  } catch (error) {
    console.error('Batch start error:', error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

// Process batch in background
async function processBatch (batchId, items) {
  const batch = activeBatches.get(batchId);
  if (!batch) return;

  let completed = 0;
  let failed = 0;
  let totalSaved = 0;

  const onProgress = async (progress) => {
    const { type, itemId, result, error } = progress;

    if (type === 'item-complete') {
      completed++;
      totalSaved += result.savedBytes || 0;

      // Update item in database
      await databaseService.updateBatchItem(itemId, {
        status: 'completed',
        output_path: result.outputPath,
        output_size: result.outputSize,
        progress: 100,
      });

      // Add to history with correct property names and validation
      await databaseService.addHistoryItem({
        id: Date.now().toString() + '-' + itemId,
        originalName: path.basename(result.originalPath || 'unknown'),
        originalPath: result.originalPath || '',
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
        batchId,
        type: 'batch-compression',
        timestamp: new Date().toISOString()
      });
    } else if (type === 'item-error') {
      failed++;

      // Update item in database
      await databaseService.updateBatchItem(itemId, {
        status: 'failed',
        error_message: error,
        progress: 0,
      });
    }

    // Update batch job
    await databaseService.updateBatchJob(batchId, {
      completed_items: completed,
      failed_items: failed,
      total_saved: totalSaved,
      status: batch.isPaused ? 'paused' : 'processing',
    });

    // Get client ID for progress event
    let clientId = itemId;
    if (batch.itemMapping) {
      // Find client ID from mapping
      for (const [cId, dbId] of batch.itemMapping) {
        if (dbId === itemId) {
          clientId = cId;
          break;
        }
      }
    }

    // Emit progress event with client ID
    batch.emitter.emit('progress', {
      batchId,
      completed,
      failed,
      total: items.length,
      totalSaved,
      currentItem: clientId,
    });
  };

  try {
    await workerPool.compressBatch(items, onProgress);

    // Mark batch as completed
    await databaseService.updateBatchJob(batchId, {
      status: 'completed',
      completed_at: new Date().toISOString(),
      completed_items: completed,
      failed_items: failed,
      total_saved: totalSaved,
    });

    batch.emitter.emit('complete', {
      batchId,
      completed,
      failed,
      total: items.length,
      totalSaved,
    });
  } catch (error) {
    console.error('Batch processing error:', error);

    await databaseService.updateBatchJob(batchId, {
      status: 'failed',
      completed_at: new Date().toISOString(),
    });

    batch.emitter.emit('error', {
      batchId,
      error: error.message,
    });
  } finally {
    // Clean up
    activeBatches.delete(batchId);
  }
}

// Get batch status
router.get('/status/:batchId', async (req, res) => {
  try {
    const { batchId } = req.params;
    const batchJob = await databaseService.getBatchJob(batchId);

    if (!batchJob) {
      return res.status(404).json({
        success: false,
        error: 'Batch job not found',
      });
    }

    const items = await databaseService.getBatchItems(batchId);

    res.json({
      success: true,
      data: {
        ...batchJob,
        items,
        isActive: activeBatches.has(batchId),
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

// Pause batch processing
router.post('/pause/:batchId', (req, res) => {
  try {
    const { batchId } = req.params;
    const batch = activeBatches.get(batchId);

    if (!batch) {
      return res.status(404).json({
        success: false,
        error: 'Batch job not found or already completed',
      });
    }

    batch.isPaused = true;
    workerPool.pause();

    res.json({
      success: true,
      data: { batchId, status: 'paused' },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

// Resume batch processing
router.post('/resume/:batchId', (req, res) => {
  try {
    const { batchId } = req.params;
    const batch = activeBatches.get(batchId);

    if (!batch) {
      return res.status(404).json({
        success: false,
        error: 'Batch job not found or already completed',
      });
    }

    batch.isPaused = false;
    workerPool.resume();

    res.json({
      success: true,
      data: { batchId, status: 'processing' },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

// Cancel batch processing
router.post('/cancel/:batchId', async (req, res) => {
  try {
    const { batchId } = req.params;
    const batch = activeBatches.get(batchId);

    if (batch) {
      // Stop processing
      batch.emitter.emit('cancel');
      activeBatches.delete(batchId);
    }

    // Update database
    await databaseService.updateBatchJob(batchId, {
      status: 'cancelled',
      completed_at: new Date().toISOString(),
    });

    res.json({
      success: true,
      data: { batchId, status: 'cancelled' },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

// Download all completed items from a batch
router.post('/download-all', async (req, res) => {
  try {
    const { items } = req.body;

    if (!items || !Array.isArray(items)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid items provided',
      });
    }

    // In a real implementation, this would create a zip file
    // For now, we'll just return the paths
    const downloadPaths = items.map(item => ({
      name: item.name,
      path: item.path,
    }));

    res.json({
      success: true,
      data: {
        items: downloadPaths,
        totalSize: items.reduce((sum, item) => sum + (item.size || 0), 0),
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

// Server-sent events for batch progress
router.get('/progress/:batchId', (req, res) => {
  const { batchId } = req.params;
  const batch = activeBatches.get(batchId);

  if (!batch) {
    return res.status(404).json({
      success: false,
      error: 'Batch job not found',
    });
  }

  // Set up SSE
  res.writeHead(200, {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
    'Connection': 'keep-alive',
    'Access-Control-Allow-Origin': '*',
  });

  // Send initial data
  res.write(`data: ${JSON.stringify({ type: 'connected', batchId })}\n\n`);

  // Listen for events
  const progressHandler = (data) => {
    res.write(`data: ${JSON.stringify({ type: 'progress', ...data })}\n\n`);
  };

  const completeHandler = (data) => {
    res.write(`data: ${JSON.stringify({ type: 'complete', ...data })}\n\n`);
    cleanup();
  };

  const errorHandler = (data) => {
    res.write(`data: ${JSON.stringify({ type: 'error', ...data })}\n\n`);
    cleanup();
  };

  const cleanup = () => {
    batch.emitter.off('progress', progressHandler);
    batch.emitter.off('complete', completeHandler);
    batch.emitter.off('error', errorHandler);
    res.end();
  };

  batch.emitter.on('progress', progressHandler);
  batch.emitter.on('complete', completeHandler);
  batch.emitter.on('error', errorHandler);

  // Clean up on client disconnect
  req.on('close', cleanup);
});

module.exports = router;
