import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';

const defaultCompressionSettings = {
  format: 'same', // 'jpeg', 'png', 'webp', 'gif', 'same'
  quality: 85,
  resize: {
    maxWidth: null,
    maxHeight: null,
    maintainAspectRatio: true,
  },
  advanced: {
    progressive: true,
    stripMetadata: true,
    optimizationLevel: 3, // For PNG (0-7)
    colors: 256, // For GIF
    dithering: true, // For GIF
  },
};

const defaultAppSettings = {
  theme: 'dark',
  language: 'en',
  autoStart: false,
  minimizeToTray: true,
  showNotifications: true,
  workerThreads: Math.max(1, (navigator.hardwareConcurrency || 4) - 1),
  memoryLimit: 512, // MB per worker
  hardwareAcceleration: true,
  tempDirectory: null, // Use system temp
  defaultOutputDirectory: null, // Same as source
  keepOriginals: true,
  historyLimit: 30, // Days, 0 = forever
};

const useSettingsStore = create(
  devtools(
    persist(
      (set, get) => ({
        // Settings
        compressionSettings: defaultCompressionSettings,
        appSettings: defaultAppSettings,
        presets: [],

        // Actions
        updateCompressionSettings: (updates) =>
          set((state) => ({
            compressionSettings: { ...state.compressionSettings, ...updates },
          })),

        updateAppSettings: (updates) =>
          set((state) => ({
            appSettings: { ...state.appSettings, ...updates },
          })),

        resetSettings: () =>
          set(() => ({
            compressionSettings: defaultCompressionSettings,
            appSettings: defaultAppSettings,
          })),

        // Presets management
        addPreset: (preset) =>
          set((state) => ({
            presets: [
              ...state.presets,
              {
                id: Date.now().toString(),
                name: preset.name,
                settings: preset.settings,
                createdAt: new Date().toISOString(),
              },
            ],
          })),

        removePreset: (id) =>
          set((state) => ({
            presets: state.presets.filter((preset) => preset.id !== id),
          })),

        updatePreset: (id, updates) =>
          set((state) => ({
            presets: state.presets.map((preset) =>
              preset.id === id ? { ...preset, ...updates } : preset
            ),
          })),

        applyPreset: (id) => {
          const { presets } = get();
          const preset = presets.find((p) => p.id === id);
          if (preset) {
            set({ compressionSettings: preset.settings });
          }
        },

        // Load settings from backend
        loadSettings: async () => {
          try {
            const response = await window.api.settings.get();
            if (response.success) {
              set({
                compressionSettings: {
                  ...defaultCompressionSettings,
                  ...response.data.compression,
                },
                appSettings: {
                  ...defaultAppSettings,
                  ...response.data.app,
                },
                presets: response.data.presets || [],
              });
            }
          } catch (error) {
            console.error('Failed to load settings:', error);
          }
        },

        // Save settings to backend
        saveSettings: async () => {
          const { compressionSettings, appSettings, presets } = get();
          try {
            await window.api.settings.save({
              compression: compressionSettings,
              app: appSettings,
              presets,
            });
          } catch (error) {
            console.error('Failed to save settings:', error);
            throw error;
          }
        },

        // Get format-specific settings
        getFormatSettings: (format) => {
          const { compressionSettings } = get();
          const baseSettings = {
            format,
            quality: compressionSettings.quality,
            resize: compressionSettings.resize,
          };

          switch (format) {
            case 'jpeg':
              return {
                ...baseSettings,
                progressive: compressionSettings.advanced.progressive,
                stripMetadata: compressionSettings.advanced.stripMetadata,
              };
            case 'png':
              return {
                ...baseSettings,
                optimizationLevel: compressionSettings.advanced.optimizationLevel,
                stripMetadata: compressionSettings.advanced.stripMetadata,
              };
            case 'webp':
              return {
                ...baseSettings,
                lossless: compressionSettings.quality === 100,
                stripMetadata: compressionSettings.advanced.stripMetadata,
              };
            case 'gif':
              return {
                ...baseSettings,
                colors: compressionSettings.advanced.colors,
                dithering: compressionSettings.advanced.dithering,
              };
            default:
              return baseSettings;
          }
        },
      }),
      {
        name: 'settings-store',
        partialize: (state) => ({
          compressionSettings: state.compressionSettings,
          appSettings: state.appSettings,
          presets: state.presets,
        }),
      }
    ),
    {
      name: 'settings-store',
    }
  )
);

export { useSettingsStore };
