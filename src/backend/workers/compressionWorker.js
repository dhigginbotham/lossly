const { parentPort } = require('worker_threads');
const path = require('path');
const fs = require('fs').promises;
const sharp = require('sharp');
const { v4: uuidv4 } = require('uuid');
const os = require('os');

// Worker configuration
const tempDir = path.join(os.tmpdir(), 'lossly-worker');

// Ensure temp directory exists
fs.mkdir(tempDir, { recursive: true }).catch(console.error);

// Handle messages from parent
parentPort.on('message', async (message) => {
  const { type, taskId, data } = message;

  switch (type) {
    case 'compress':
      await handleCompression(taskId, data);
      break;
    default:
      sendError(taskId, new Error(`Unknown message type: ${type}`));
  }
});

async function handleCompression (taskId, data) {
  const { imagePath, settings } = data;
  const startTime = Date.now();

  try {
    // Validate input
    if (!imagePath || !settings) {
      throw new Error('Missing required parameters');
    }

    // Check if file exists
    await fs.access(imagePath);

    // Get file info
    const stats = await fs.stat(imagePath);
    const originalSize = stats.size;
    const originalFormat = path.extname(imagePath).slice(1).toLowerCase();

    // Determine output format
    let outputFormat = settings.format;
    if (outputFormat === 'same') {
      outputFormat = originalFormat;
    }

    // Generate output path
    const outputFileName = `${path.basename(imagePath, path.extname(imagePath))}_compressed_${uuidv4()}.${outputFormat}`;
    const outputPath = path.join(tempDir, outputFileName);

    // Report progress
    sendProgress(taskId, 10);

    // Process image with Sharp
    let pipeline = sharp(imagePath);

    // Get metadata first
    const metadata = await sharp(imagePath).metadata();

    // Apply resize if needed
    if (settings.resize) {
      const { maxWidth, maxHeight, maintainAspectRatio } = settings.resize;
      if (maxWidth || maxHeight) {
        pipeline = pipeline.resize(maxWidth, maxHeight, {
          fit: maintainAspectRatio ? 'inside' : 'fill',
          withoutEnlargement: true,
        });
      }
    }

    sendProgress(taskId, 30);

    // Apply format-specific settings
    switch (outputFormat) {
      case 'jpeg':
      case 'jpg':
        pipeline = pipeline.jpeg({
          quality: settings.quality,
          progressive: settings.advanced?.progressive !== false,
          mozjpeg: true, // Use mozjpeg encoder for better compression
        });
        break;

      case 'png':
        // PNG compression in Sharp
        pipeline = pipeline.png({
          quality: settings.quality,
          compressionLevel: settings.advanced?.optimizationLevel || 6,
          progressive: settings.advanced?.progressive || false,
          palette: settings.quality < 100, // Use palette for lower quality
        });
        break;

      case 'webp':
        pipeline = pipeline.webp({
          quality: settings.quality,
          lossless: settings.quality === 100,
          effort: 6, // Higher effort = better compression
          smartSubsample: true,
        });
        break;

      case 'avif':
        pipeline = pipeline.avif({
          quality: settings.quality,
          effort: 6,
          chromaSubsampling: '4:2:0',
        });
        break;

      case 'gif':
        // Sharp doesn't support GIF well, so we'll convert to WebP instead
        pipeline = pipeline.webp({
          quality: settings.quality,
          animated: true,
          effort: 6,
        });
        outputFormat = 'webp';
        break;

      case 'tiff':
        pipeline = pipeline.tiff({
          quality: settings.quality,
          compression: 'lzw',
          predictor: 'horizontal',
        });
        break;

      default:
        // Default to JPEG for unknown formats
        pipeline = pipeline.jpeg({
          quality: settings.quality,
          progressive: true,
        });
        outputFormat = 'jpeg';
    }

    sendProgress(taskId, 60);

    // Handle metadata
    if (settings.advanced?.stripMetadata) {
      // Remove all metadata
      pipeline = pipeline.withMetadata({});
    } else {
      // Keep metadata but update orientation
      pipeline = pipeline.withMetadata({
        orientation: metadata.orientation || 1,
      });
    }

    sendProgress(taskId, 80);

    // Save the processed image
    await pipeline.toFile(outputPath);

    // Get output file size
    const outputStats = await fs.stat(outputPath);
    const compressedSize = outputStats.size;
    const savedBytes = originalSize - compressedSize;
    const reductionPercentage = Math.round((savedBytes / originalSize) * 100);

    sendProgress(taskId, 100);

    // Report completion
    const processingTime = Date.now() - startTime;
    sendComplete(taskId, {
      originalPath: imagePath,
      originalSize,
      originalFormat,
      outputPath,
      outputName: outputFileName,
      outputSize: compressedSize,
      outputFormat,
      compressedSize,
      savedBytes,
      reductionPercentage,
      processingTime,
      stats: {
        originalSize,
        compressedSize,
        savedBytes,
        reductionPercentage,
        processingTime,
      },
    });
  } catch (error) {
    console.error('Compression error:', error);
    sendError(taskId, error);
  }
}

// Helper functions to send messages to parent
function sendComplete (taskId, data) {
  parentPort.postMessage({
    type: 'task-complete',
    taskId,
    data,
  });
}

function sendError (taskId, error) {
  parentPort.postMessage({
    type: 'task-error',
    taskId,
    error: {
      message: error.message,
      stack: error.stack,
    },
  });
}

function sendProgress (taskId, progress) {
  parentPort.postMessage({
    type: 'progress',
    taskId,
    data: progress,
  });
}

function sendLog (message) {
  parentPort.postMessage({
    type: 'log',
    data: message,
  });
}

// Cleanup on exit
process.on('exit', async () => {
  try {
    // Clean up temp files older than 1 hour
    const files = await fs.readdir(tempDir);
    const oneHourAgo = Date.now() - (60 * 60 * 1000);

    for (const file of files) {
      const filePath = path.join(tempDir, file);
      try {
        const stats = await fs.stat(filePath);
        if (stats.mtimeMs < oneHourAgo) {
          await fs.unlink(filePath);
        }
      } catch (err) {
        // Ignore errors for individual files
      }
    }
  } catch (error) {
    // Ignore cleanup errors
  }
});
