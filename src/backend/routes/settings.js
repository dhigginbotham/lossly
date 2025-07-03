const express = require('express');
const router = express.Router();
const { databaseService } = require('../services/databaseService');
const { workerPool } = require('../services/workerPoolService');

// Get all settings
router.get('/', async (req, res) => {
  try {
    const settings = await databaseService.getAllSettings();

    // Get presets
    const presets = await databaseService.getPresets();

    // Combine all settings
    const allSettings = {
      app: settings.app || getDefaultAppSettings(),
      compression: settings.compression || getDefaultCompressionSettings(),
      presets,
    };

    res.json({
      success: true,
      data: allSettings,
    });
  } catch (error) {
    console.error('Settings fetch error:', error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

// Update settings
router.post('/', async (req, res) => {
  try {
    const { app, compression, presets } = req.body;

    // Save app settings
    if (app) {
      await databaseService.setSetting('app', app);

      // Apply worker pool settings if changed
      if (app.workerThreads || app.memoryLimit) {
        await workerPool.shutdown();
        await workerPool.initialize({
          minWorkers: 1,
          maxWorkers: app.workerThreads || workerPool.maxWorkers,
          memoryLimit: app.memoryLimit || workerPool.memoryLimit,
        });
      }
    }

    // Save compression settings
    if (compression) {
      await databaseService.setSetting('compression', compression);
    }

    // Save presets if provided
    if (presets && Array.isArray(presets)) {
      // Clear existing presets and add new ones
      const existingPresets = await databaseService.getPresets();
      for (const preset of existingPresets) {
        await databaseService.deletePreset(preset.id);
      }
      for (const preset of presets) {
        await databaseService.addPreset(preset);
      }
    }

    res.json({
      success: true,
      data: { message: 'Settings saved successfully' },
    });
  } catch (error) {
    console.error('Settings save error:', error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

// Reset settings to defaults
router.post('/reset', async (req, res) => {
  try {
    const defaultApp = getDefaultAppSettings();
    const defaultCompression = getDefaultCompressionSettings();

    await databaseService.setSetting('app', defaultApp);
    await databaseService.setSetting('compression', defaultCompression);

    // Reinitialize worker pool with default settings
    await workerPool.shutdown();
    await workerPool.initialize({
      minWorkers: 1,
      maxWorkers: defaultApp.workerThreads,
      memoryLimit: defaultApp.memoryLimit,
    });

    res.json({
      success: true,
      data: {
        app: defaultApp,
        compression: defaultCompression,
      },
    });
  } catch (error) {
    console.error('Settings reset error:', error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

// Get presets
router.get('/presets', async (req, res) => {
  try {
    const presets = await databaseService.getPresets();

    res.json({
      success: true,
      data: presets,
    });
  } catch (error) {
    console.error('Presets fetch error:', error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

// Add preset
router.post('/presets', async (req, res) => {
  try {
    const { name, settings } = req.body;

    if (!name || !settings) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields',
      });
    }

    const preset = {
      id: Date.now().toString(),
      name,
      settings,
    };

    await databaseService.addPreset(preset);

    res.json({
      success: true,
      data: preset,
    });
  } catch (error) {
    console.error('Preset add error:', error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

// Update preset
router.put('/presets/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { name, settings } = req.body;

    // Get existing preset
    const presets = await databaseService.getPresets();
    const preset = presets.find((p) => p.id === id);

    if (!preset) {
      return res.status(404).json({
        success: false,
        error: 'Preset not found',
      });
    }

    // Delete old preset
    await databaseService.deletePreset(id);

    // Add updated preset
    const updatedPreset = {
      id,
      name: name || preset.name,
      settings: settings || preset.settings,
    };

    await databaseService.addPreset(updatedPreset);

    res.json({
      success: true,
      data: updatedPreset,
    });
  } catch (error) {
    console.error('Preset update error:', error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

// Delete preset
router.delete('/presets/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await databaseService.deletePreset(id);

    res.json({
      success: true,
      data: { id },
    });
  } catch (error) {
    console.error('Preset delete error:', error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

// Export settings
router.get('/export', async (req, res) => {
  try {
    const settings = await databaseService.getAllSettings();
    const presets = await databaseService.getPresets();

    const exportData = {
      app: settings.app || getDefaultAppSettings(),
      compression: settings.compression || getDefaultCompressionSettings(),
      presets,
      exportedAt: new Date().toISOString(),
      version: '1.0.0',
    };

    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Content-Disposition', 'attachment; filename=lossly-settings.json');
    res.json(exportData);
  } catch (error) {
    console.error('Settings export error:', error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

// Import settings
router.post('/import', async (req, res) => {
  try {
    const { app, compression, presets } = req.body;

    if (!app && !compression && !presets) {
      return res.status(400).json({
        success: false,
        error: 'No settings to import',
      });
    }

    // Import app settings
    if (app) {
      await databaseService.setSetting('app', app);
    }

    // Import compression settings
    if (compression) {
      await databaseService.setSetting('compression', compression);
    }

    // Import presets
    if (presets && Array.isArray(presets)) {
      for (const preset of presets) {
        await databaseService.addPreset(preset);
      }
    }

    res.json({
      success: true,
      data: { message: 'Settings imported successfully' },
    });
  } catch (error) {
    console.error('Settings import error:', error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

// Helper functions
function getDefaultCompressionSettings () {
  return {
    format: 'same',
    quality: 85,
    resize: {
      maxWidth: null,
      maxHeight: null,
      maintainAspectRatio: true,
    },
    advanced: {
      progressive: true,
      stripMetadata: true,
      optimizationLevel: 3,
      colors: 256,
      dithering: true,
    },
  };
}

function getDefaultAppSettings () {
  const cpuCount = require('os').cpus().length;
  return {
    theme: 'dark',
    language: 'en',
    autoStart: false,
    minimizeToTray: true,
    showNotifications: true,
    workerThreads: Math.max(1, cpuCount - 1),
    memoryLimit: 512,
    hardwareAcceleration: true,
    tempDirectory: null,
    defaultOutputDirectory: null,
    keepOriginals: true,
    historyLimit: 30,
  };
}

module.exports = router;
