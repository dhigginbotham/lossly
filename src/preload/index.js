const { contextBridge, ipcRenderer } = require('electron');

// API exposed to renderer
contextBridge.exposeInMainWorld('api', {
  // Compression API
  compression: {
    compress: async (options) => {
      const backendUrl = await ipcRenderer.invoke('app:getBackendUrl');
      const response = await fetch(`${backendUrl}/api/compression/compress`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(options)
      });
      return response.json();
    },

    saveAs: async (options) => {
      const targetPath = await ipcRenderer.invoke('dialog:saveFile', options.defaultName);
      if (!targetPath) return { success: false, cancelled: true };

      const backendUrl = await ipcRenderer.invoke('app:getBackendUrl');
      const response = await fetch(`${backendUrl}/api/compression/save-as`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sourcePath: options.sourcePath,
          targetPath
        })
      });
      return response.json();
    },

    getFileStats: async (filePath) => {
      return ipcRenderer.invoke('file:getStats', filePath);
    }
  },

  // Batch API
  batch: {
    create: async (options) => {
      const backendUrl = await ipcRenderer.invoke('app:getBackendUrl');
      const response = await fetch(`${backendUrl}/api/batch/create`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(options)
      });
      return response.json();
    },

    startBatch: async (options) => {
      const backendUrl = await ipcRenderer.invoke('app:getBackendUrl');
      const response = await fetch(`${backendUrl}/api/batch/start`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(options)
      });
      return response.json();
    },

    pause: async (batchId) => {
      const backendUrl = await ipcRenderer.invoke('app:getBackendUrl');
      const response = await fetch(`${backendUrl}/api/batch/pause/${batchId}`, {
        method: 'POST'
      });
      return response.json();
    },

    resume: async (batchId) => {
      const backendUrl = await ipcRenderer.invoke('app:getBackendUrl');
      const response = await fetch(`${backendUrl}/api/batch/resume/${batchId}`, {
        method: 'POST'
      });
      return response.json();
    },

    cancel: async (batchId) => {
      const backendUrl = await ipcRenderer.invoke('app:getBackendUrl');
      const response = await fetch(`${backendUrl}/api/batch/cancel/${batchId}`, {
        method: 'POST'
      });
      return response.json();
    },

    downloadAll: async (options) => {
      const backendUrl = await ipcRenderer.invoke('app:getBackendUrl');
      const response = await fetch(`${backendUrl}/api/batch/download-all`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(options)
      });
      return response.json();
    }
  },

  // History API
  history: {
    get: async (options = {}) => {
      const backendUrl = await ipcRenderer.invoke('app:getBackendUrl');
      const queryParams = new URLSearchParams(options).toString();
      const response = await fetch(`${backendUrl}/api/history?${queryParams}`);
      return response.json();
    },

    delete: async (id) => {
      const backendUrl = await ipcRenderer.invoke('app:getBackendUrl');
      const response = await fetch(`${backendUrl}/api/history/${id}`, {
        method: 'DELETE'
      });
      return response.json();
    },

    clear: async () => {
      const backendUrl = await ipcRenderer.invoke('app:getBackendUrl');
      const response = await fetch(`${backendUrl}/api/history`, {
        method: 'DELETE'
      });
      return response.json();
    },

    fixCorrupted: async () => {
      const backendUrl = await ipcRenderer.invoke('app:getBackendUrl');
      const response = await fetch(`${backendUrl}/api/history/fix-corrupted`, {
        method: 'POST'
      });
      return response.json();
    }
  },

  // Settings API
  settings: {
    get: async () => {
      const backendUrl = await ipcRenderer.invoke('app:getBackendUrl');
      const response = await fetch(`${backendUrl}/api/settings`);
      return response.json();
    },

    save: async (settings) => {
      const backendUrl = await ipcRenderer.invoke('app:getBackendUrl');
      const response = await fetch(`${backendUrl}/api/settings`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings)
      });
      return response.json();
    }
  },

  // File dialogs
  dialog: {
    openFile: () => ipcRenderer.invoke('dialog:openFile'),
    saveFile: (defaultName) => ipcRenderer.invoke('dialog:saveFile', defaultName),
    showOpenDialog: (options) => ipcRenderer.invoke('dialog:showOpenDialog', options)
  },

  // App info
  app: {
    getVersion: () => ipcRenderer.invoke('app:getVersion'),
    getBackendUrl: () => ipcRenderer.invoke('app:getBackendUrl'),
    platform: process.platform
  },

  // Shell operations
  shell: {
    openPath: (path) => ipcRenderer.invoke('shell:openPath', path),
    showItemInFolder: (path) => ipcRenderer.invoke('shell:showItemInFolder', path)
  }
});

// Expose versions
contextBridge.exposeInMainWorld('versions', {
  node: process.versions.node,
  chrome: process.versions.chrome,
  electron: process.versions.electron
});
