const express = require('express');
const router = express.Router();
const { databaseService } = require('../services/databaseService');

// Get history items
router.get('/', async (req, res) => {
  try {
    const { limit = 100, offset = 0 } = req.query;
    const history = await databaseService.getHistory(
      parseInt(limit),
      parseInt(offset)
    );

    res.json({
      success: true,
      data: history,
    });
  } catch (error) {
    console.error('History fetch error:', error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

// Get history statistics
router.get('/stats', async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    let history = await databaseService.getHistory(1000, 0);

    // Filter by date range if provided
    if (startDate || endDate) {
      history = history.filter((item) => {
        const itemDate = new Date(item.timestamp);
        if (startDate && itemDate < new Date(startDate)) return false;
        if (endDate && itemDate > new Date(endDate)) return false;
        return true;
      });
    }

    // Calculate statistics
    const stats = {
      totalImages: history.length,
      totalOriginalSize: 0,
      totalCompressedSize: 0,
      totalSaved: 0,
      averageReduction: 0,
      formatBreakdown: {},
      typeBreakdown: {
        compression: 0,
        conversion: 0,
        'batch-compression': 0,
      },
      dailyBreakdown: {},
    };

    history.forEach((item) => {
      stats.totalOriginalSize += item.original_size || 0;
      stats.totalCompressedSize += item.compressed_size || item.output_size || 0;
      stats.totalSaved += item.saved_bytes || 0;

      // Format breakdown
      const format = item.output_format || item.original_format;
      stats.formatBreakdown[format] = (stats.formatBreakdown[format] || 0) + 1;

      // Type breakdown
      if (item.type) {
        stats.typeBreakdown[item.type] = (stats.typeBreakdown[item.type] || 0) + 1;
      }

      // Daily breakdown
      const date = new Date(item.timestamp).toISOString().split('T')[0];
      if (!stats.dailyBreakdown[date]) {
        stats.dailyBreakdown[date] = {
          count: 0,
          saved: 0,
        };
      }
      stats.dailyBreakdown[date].count++;
      stats.dailyBreakdown[date].saved += item.saved_bytes || 0;
    });

    // Calculate average reduction
    if (history.length > 0) {
      const totalReduction = history.reduce(
        (sum, item) => sum + (item.reduction_percentage || 0),
        0
      );
      stats.averageReduction = Math.round(totalReduction / history.length);
    }

    res.json({
      success: true,
      data: stats,
    });
  } catch (error) {
    console.error('History stats error:', error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

// Get single history item
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const history = await databaseService.getHistory(1000, 0);
    const item = history.find((h) => h.id === id);

    if (!item) {
      return res.status(404).json({
        success: false,
        error: 'History item not found',
      });
    }

    res.json({
      success: true,
      data: item,
    });
  } catch (error) {
    console.error('History item fetch error:', error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

// Delete history item
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await databaseService.deleteHistoryItem(id);

    res.json({
      success: true,
      data: { id },
    });
  } catch (error) {
    console.error('History delete error:', error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

// Clear all history
router.delete('/', async (req, res) => {
  try {
    await databaseService.clearHistory();

    res.json({
      success: true,
      data: { message: 'History cleared' },
    });
  } catch (error) {
    console.error('History clear error:', error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

// Clean old history
router.post('/clean', async (req, res) => {
  try {
    const { daysToKeep = 30 } = req.body;
    const result = await databaseService.cleanOldHistory(daysToKeep);

    res.json({
      success: true,
      data: {
        message: `Cleaned history older than ${daysToKeep} days`,
        deletedCount: result.changes,
      },
    });
  } catch (error) {
    console.error('History clean error:', error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

// Export history data
router.get('/export/:format', async (req, res) => {
  try {
    const { format } = req.params;
    const { startDate, endDate } = req.query;

    let history = await databaseService.getHistory(10000, 0);

    // Filter by date range if provided
    if (startDate || endDate) {
      history = history.filter((item) => {
        const itemDate = new Date(item.timestamp);
        if (startDate && itemDate < new Date(startDate)) return false;
        if (endDate && itemDate > new Date(endDate)) return false;
        return true;
      });
    }

    switch (format) {
      case 'json': {
        res.json({
          success: true,
          data: history,
        });
        break;
      }

      case 'csv': {
        // Generate CSV
        const csvHeaders = [
          'ID', 'Original Name', 'Original Size', 'Compressed Size',
          'Reduction %', 'Type', 'Timestamp'
        ].join(',');

        const csvRows = history.map((item) => [
          item.id,
          `"${item.original_name}"`,
          item.original_size,
          item.compressed_size || item.output_size,
          item.reduction_percentage || 0,
          item.type,
          item.timestamp,
        ].join(','));

        const csv = [csvHeaders, ...csvRows].join('\n');

        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', 'attachment; filename=lossly-history.csv');
        res.send(csv);
        break;
      }

      default: {
        res.status(400).json({
          success: false,
          error: 'Unsupported export format',
        });
      }
    }
  } catch (error) {
    console.error('History export error:', error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

module.exports = router;
