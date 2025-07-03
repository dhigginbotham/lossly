/**
 * Format bytes to human readable string
 * @param {number} bytes - Number of bytes
 * @param {number} decimals - Number of decimal places
 * @returns {string} Formatted string
 */
export function formatBytes (bytes, decimals = 2) {
  if (bytes === 0) return '0 Bytes';

  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB'];

  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}

/**
 * Format number to percentage
 * @param {number} value - Value between 0 and 1
 * @param {number} decimals - Number of decimal places
 * @returns {string} Formatted percentage
 */
export function formatPercentage (value, decimals = 1) {
  return `${(value * 100).toFixed(decimals)}%`;
}

/**
 * Format duration in milliseconds to human readable string
 * @param {number} ms - Duration in milliseconds
 * @returns {string} Formatted duration
 */
export function formatDuration (ms) {
  if (ms < 1000) return `${ms}ms`;

  const seconds = Math.floor(ms / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);

  if (hours > 0) {
    return `${hours}h ${minutes % 60}m`;
  } else if (minutes > 0) {
    return `${minutes}m ${seconds % 60}s`;
  } else {
    return `${seconds}s`;
  }
}

/**
 * Format file name with pattern
 * @param {string} pattern - Pattern string
 * @param {string} originalName - Original file name
 * @param {object} options - Additional options
 * @returns {string} Formatted file name
 */
export function formatFileName (pattern, originalName, options = {}) {
  const parts = originalName.split('.');
  const name = parts.slice(0, -1).join('.');
  const ext = parts[parts.length - 1];

  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const date = new Date().toISOString().split('T')[0];

  return pattern
    .replace('{name}', name)
    .replace('{original}', name)
    .replace('{ext}', ext)
    .replace('{timestamp}', timestamp)
    .replace('{date}', date)
    .replace('{quality}', options.quality || '')
    .replace('{format}', options.format || ext)
    .replace('{width}', options.width || '')
    .replace('{height}', options.height || '');
}

/**
 * Format compression ratio to percentage saved
 * @param {number} originalSize - Original file size
 * @param {number} compressedSize - Compressed file size
 * @returns {string} Percentage saved
 */
export function formatCompressionSaving (originalSize, compressedSize) {
  if (originalSize === 0) return '0%';
  const saved = ((originalSize - compressedSize) / originalSize) * 100;
  return `${saved.toFixed(1)}%`;
}

/**
 * Format timestamp to relative time
 * @param {number} timestamp - Unix timestamp
 * @returns {string} Relative time string
 */
export function formatRelativeTime (timestamp) {
  const now = Date.now();
  const diff = now - timestamp;

  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (days > 7) {
    return new Date(timestamp).toLocaleDateString();
  } else if (days > 0) {
    return `${days} day${days > 1 ? 's' : ''} ago`;
  } else if (hours > 0) {
    return `${hours} hour${hours > 1 ? 's' : ''} ago`;
  } else if (minutes > 0) {
    return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
  } else if (seconds > 0) {
    return `${seconds} second${seconds > 1 ? 's' : ''} ago`;
  } else {
    return 'just now';
  }
}

/**
 * Format ETA based on progress
 * @param {number} processed - Number of items processed
 * @param {number} total - Total number of items
 * @param {number} startTime - Processing start timestamp
 * @returns {string} Estimated time remaining
 */
export function formatETA (processed, total, startTime) {
  if (processed === 0 || total === 0) return 'Calculating...';

  const elapsed = Date.now() - startTime;
  const rate = processed / elapsed;
  const remaining = total - processed;
  const eta = remaining / rate;

  return formatDuration(eta);
}

/**
 * Truncate text with ellipsis
 * @param {string} text - Text to truncate
 * @param {number} maxLength - Maximum length
 * @returns {string} Truncated text
 */
export function truncateText (text, maxLength) {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength - 3) + '...';
}

/**
 * Get file extension from filename
 * @param {string} filename - File name
 * @returns {string} File extension
 */
export function getFileExtension (filename) {
  const parts = filename.split('.');
  return parts.length > 1 ? parts[parts.length - 1].toLowerCase() : '';
}

/**
 * Check if file is an image
 * @param {File|string} file - File object or filename
 * @returns {boolean} True if image
 */
export function isImageFile (file) {
  const imageExtensions = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg'];
  const filename = typeof file === 'string' ? file : file.name;
  const ext = getFileExtension(filename);
  return imageExtensions.includes(ext);
}
