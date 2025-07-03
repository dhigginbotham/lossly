const express = require('express');
const router = express.Router();
const path = require('path');
const fs = require('fs').promises;
const sharp = require('sharp');
const { v4: uuidv4 } = require('uuid');
const os = require('os');
const { databaseService } = require('../services/databaseService');

// Temporary directory for conversions
const tempDir = path.join(os.tmpdir(), 'lossly-conversions');
fs.mkdir(tempDir, { recursive: true }).catch(console.error);

// Convert image format
router.post('/convert', async (req, res) => {
  try {
    const { imagePath, targetFormat } = req.body;

    if (!imagePath || !targetFormat) {
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

    // Get file info
    const stats = await fs.stat(imagePath);
    const originalSize = stats.size;
    const originalFormat = path.extname(imagePath).slice(1).toLowerCase();

    // Validate format conversion
    if (!isValidConversion(originalFormat, targetFormat)) {
      return res.status(400).json({
        success: false,
        error: `Cannot convert from ${originalFormat} to ${targetFormat}`,
      });
    }

    // Generate output path
    const outputFileName = `${path.basename(imagePath, path.extname(imagePath))}_converted_${uuidv4()}.${targetFormat}`;
    const outputPath = path.join(tempDir, outputFileName);

    // Perform conversion
    const startTime = Date.now();
    let outputSize;

    if (canUseSharp(originalFormat, targetFormat)) {
      // Use Sharp for supported formats
      await sharp(imagePath)
        .toFormat(targetFormat, getFormatOptions(targetFormat))
        .toFile(outputPath);

      const outputStats = await fs.stat(outputPath);
      outputSize = outputStats.size;
    } else {
      // Fallback for formats not supported by Sharp
      // In a real implementation, you might use other libraries
      return res.status(400).json({
        success: false,
        error: `Conversion from ${originalFormat} to ${targetFormat} is not yet implemented`,
      });
    }

    const processingTime = Date.now() - startTime;
    const savedBytes = originalSize - outputSize;
    const reductionPercentage = savedBytes > 0 ? Math.round((savedBytes / originalSize) * 100) : 0;

    const result = {
      originalPath: imagePath,
      originalSize,
      originalFormat,
      outputPath,
      outputName: outputFileName,
      outputSize,
      outputFormat: targetFormat,
      savedBytes,
      reductionPercentage,
      processingTime,
    };

    // Add to history
    await databaseService.addHistoryItem({
      ...result,
      type: 'conversion',
    });

    res.json({
      success: true,
      data: result,
    });
  } catch (error) {
    console.error('Conversion error:', error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

// Get supported conversions
router.get('/supported', (req, res) => {
  const conversions = {
    jpeg: ['png', 'webp', 'gif', 'bmp', 'tiff'],
    jpg: ['png', 'webp', 'gif', 'bmp', 'tiff'],
    png: ['jpeg', 'webp', 'gif', 'bmp', 'tiff'],
    webp: ['jpeg', 'png', 'gif', 'bmp', 'tiff'],
    gif: ['jpeg', 'png', 'webp', 'bmp'],
    bmp: ['jpeg', 'png', 'webp', 'gif', 'tiff'],
    tiff: ['jpeg', 'png', 'webp', 'bmp'],
    svg: ['png'], // SVG to raster only
  };

  res.json({
    success: true,
    data: conversions,
  });
});

// Batch convert multiple images
router.post('/batch-convert', async (req, res) => {
  try {
    const { items, targetFormat } = req.body;

    if (!items || !Array.isArray(items) || items.length === 0 || !targetFormat) {
      return res.status(400).json({
        success: false,
        error: 'Invalid parameters',
      });
    }

    const results = [];
    const errors = [];

    for (const item of items) {
      try {
        // Convert each image
        const convertReq = {
          body: {
            imagePath: item.path,
            targetFormat,
          },
        };

        const convertRes = {
          json: (data) => {
            if (data.success) {
              results.push({ ...data.data, id: item.id });
            } else {
              throw new Error(data.error);
            }
          },
          status: () => ({ json: (data) => { throw new Error(data.error); } }),
        };

        await exports.convert(convertReq, convertRes);
      } catch (error) {
        errors.push({
          id: item.id,
          path: item.path,
          error: error.message,
        });
      }
    }

    res.json({
      success: true,
      data: {
        converted: results,
        failed: errors,
        totalConverted: results.length,
        totalFailed: errors.length,
      },
    });
  } catch (error) {
    console.error('Batch conversion error:', error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

// Get format information
router.get('/format-info/:format', (req, res) => {
  const { format } = req.params;

  const formatInfo = {
    jpeg: {
      name: 'JPEG',
      extensions: ['.jpg', '.jpeg'],
      mimeType: 'image/jpeg',
      features: ['Lossy compression', 'Wide support', 'Small file sizes'],
      limitations: ['No transparency', 'Lossy quality'],
      bestFor: 'Photographs, complex images with many colors',
    },
    png: {
      name: 'PNG',
      extensions: ['.png'],
      mimeType: 'image/png',
      features: ['Lossless compression', 'Transparency support', 'High quality'],
      limitations: ['Larger file sizes', 'Not ideal for photos'],
      bestFor: 'Graphics, logos, images with transparency',
    },
    webp: {
      name: 'WebP',
      extensions: ['.webp'],
      mimeType: 'image/webp',
      features: ['Modern format', 'Excellent compression', 'Animation support', 'Transparency'],
      limitations: ['Limited browser support', 'Not all apps support it'],
      bestFor: 'Web images, modern applications',
    },
    gif: {
      name: 'GIF',
      extensions: ['.gif'],
      mimeType: 'image/gif',
      features: ['Animation support', 'Wide support', 'Small file size for simple images'],
      limitations: ['256 colors only', 'Poor for photos'],
      bestFor: 'Simple animations, logos with few colors',
    },
    svg: {
      name: 'SVG',
      extensions: ['.svg'],
      mimeType: 'image/svg+xml',
      features: ['Vector format', 'Scalable', 'Small file size', 'Editable'],
      limitations: ['Not for photos', 'Complex images can be large'],
      bestFor: 'Icons, logos, simple graphics',
    },
    bmp: {
      name: 'BMP',
      extensions: ['.bmp'],
      mimeType: 'image/bmp',
      features: ['Simple format', 'No compression', 'Wide support'],
      limitations: ['Very large file sizes', 'No advanced features'],
      bestFor: 'Legacy applications, uncompressed storage',
    },
    tiff: {
      name: 'TIFF',
      extensions: ['.tif', '.tiff'],
      mimeType: 'image/tiff',
      features: ['Professional format', 'Lossless', 'Multiple pages', 'High quality'],
      limitations: ['Large file sizes', 'Limited web support'],
      bestFor: 'Professional photography, printing, archival',
    },
  };

  const info = formatInfo[format.toLowerCase()];

  if (!info) {
    return res.status(404).json({
      success: false,
      error: 'Format not found',
    });
  }

  res.json({
    success: true,
    data: info,
  });
});

// Helper functions
function isValidConversion (from, to) {
  const supportedFormats = ['jpeg', 'jpg', 'png', 'webp', 'gif', 'bmp', 'tiff'];
  return supportedFormats.includes(from.toLowerCase()) &&
    supportedFormats.includes(to.toLowerCase()) &&
    from.toLowerCase() !== to.toLowerCase();
}

function canUseSharp (from, to) {
  const sharpFormats = ['jpeg', 'jpg', 'png', 'webp', 'gif', 'tiff'];
  return sharpFormats.includes(from.toLowerCase()) &&
    sharpFormats.includes(to.toLowerCase());
}

function getFormatOptions (format) {
  switch (format.toLowerCase()) {
    case 'jpeg':
    case 'jpg':
      return { quality: 90, progressive: true };
    case 'png':
      return { compressionLevel: 9 };
    case 'webp':
      return { quality: 90, effort: 6 };
    case 'gif':
      return { colors: 256 };
    case 'tiff':
      return { compression: 'lzw' };
    default:
      return {};
  }
}

// Export the router and the convert function for internal use
module.exports = router;
module.exports.convert = router.post.bind(router);
