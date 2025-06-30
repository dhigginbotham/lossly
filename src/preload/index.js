import { contextBridge, ipcRenderer } from 'electron';

// Type-safe IPC bridge
contextBridge.exposeInMainWorld('electron', {
  // Image operations
  compressImage: (path, settings, onProgress) => {
    const channel = `compress-${Date.now()}`;

    if (onProgress) {
      const progressHandler = (_, progress) => onProgress(progress);
      ipcRenderer.on(`${channel}-progress`, progressHandler);

      // Cleanup listener after completion
      ipcRenderer.once(`${channel}-complete`, () => {
        ipcRenderer.removeListener(`${channel}-progress`, progressHandler);
      });
    }

    return ipcRenderer.invoke('compress-image', { path, settings, channel });
  },

  cancelCompression: () => ipcRenderer.send('cancel-compression'),

  estimateCompressedSize: (path, settings) =>
    ipcRenderer.invoke('estimate-size', { path, settings }),

  // Batch operations
  createBatch: (options) =>
    ipcRenderer.invoke('create-batch', options),

  pauseBatch: (batchId) =>
    ipcRenderer.send('pause-batch', batchId),

  resumeBatch: (batchId) =>
    ipcRenderer.send('resume-batch', batchId),

  cancelBatch: (batchId) =>
    ipcRenderer.send('cancel-batch', batchId),

  onBatchProgress: (batchId, callback) => {
    const handler = (_, progress) => callback(progress);
    ipcRenderer.on(`batch-progress-${batchId}`, handler);

    // Return cleanup function
    return () => {
      ipcRenderer.removeListener(`batch-progress-${batchId}`, handler);
    };
  },

  onFileComplete: (batchId, callback) => {
    const handler = (_, result) => callback(result);
    ipcRenderer.on(`file-complete-${batchId}`, handler);

    // Return cleanup function
    return () => {
      ipcRenderer.removeListener(`file-complete-${batchId}`, handler);
    };
  },

  onBatchComplete: (batchId, callback) => {
    ipcRenderer.once(`batch-complete-${batchId}`, (_, summary) => callback(summary));
  },

  // History operations
  getCompressionHistory: (limit) =>
    ipcRenderer.invoke('get-history', limit),

  deleteHistoryItem: (id) =>
    ipcRenderer.invoke('delete-history-item', id),

  clearHistory: () =>
    ipcRenderer.invoke('clear-history'),

  // Settings
  setTheme: (theme) =>
    ipcRenderer.send('set-theme', theme),

  setHardwareAcceleration: (enabled) =>
    ipcRenderer.send('set-hardware-acceleration', enabled),

  // File dialogs
  showOpenDialog: () =>
    ipcRenderer.invoke('show-open-dialog'),

  showSaveDialog: (defaultPath) =>
    ipcRenderer.invoke('show-save-dialog', defaultPath),

  // System events
  onThemeChanged: (callback) => {
    ipcRenderer.on('theme-changed', (_, theme) => callback(theme));
  },

  onStoreUpdate: (callback) => {
    ipcRenderer.on('store-update', (_, update) => callback(update));
  },

  // Platform info
  platform: process.platform,
  arch: process.arch,
  version: process.versions.electron
});

// Expose versions
contextBridge.exposeInMainWorld('versions', {
  node: process.versions.node,
  chrome: process.versions.chrome,
  electron: process.versions.electron
});
