import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';

const useHistoryStore = create(
  devtools(
    persist(
      (set, get) => ({
        // History items array
        history: [],

        // Actions
        addToHistory: (item) =>
          set((state) => ({
            history: [
              {
                ...item,
                id: item.id || Date.now().toString(),
                timestamp: item.timestamp || new Date().toISOString(),
              },
              ...state.history,
            ].slice(0, 1000), // Limit to 1000 items
          })),

        removeFromHistory: (id) =>
          set((state) => ({
            history: state.history.filter((item) => item.id !== id),
          })),

        clearHistory: () =>
          set(() => ({
            history: [],
          })),

        // Load history from database
        loadHistory: async () => {
          try {
            // First, fix any corrupted data
            if (window.api.history.fixCorrupted) {
              try {
                await window.api.history.fixCorrupted();
                console.log('Fixed corrupted history data');
              } catch (error) {
                console.warn('Failed to fix corrupted history:', error);
              }
            }

            // Then load the clean history
            const response = await window.api.history.get();
            if (response.success) {
              set({ history: response.data });
            }
          } catch (error) {
            console.error('Failed to load history:', error);
          }
        },

        // Get history by date range
        getHistoryByDateRange: (startDate, endDate) => {
          const { history } = get();
          return history.filter((item) => {
            const itemDate = new Date(item.timestamp);
            return itemDate >= startDate && itemDate <= endDate;
          });
        },

        // Get history statistics
        getHistoryStats: () => {
          const { history } = get();
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
            },
          };

          history.forEach((item) => {
            stats.totalOriginalSize += item.originalSize || 0;
            stats.totalCompressedSize += item.compressedSize || item.outputSize || 0;
            stats.totalSaved += item.savedBytes || 0;

            // Format breakdown
            const format = item.outputFormat || item.originalFormat;
            stats.formatBreakdown[format] = (stats.formatBreakdown[format] || 0) + 1;

            // Type breakdown
            if (item.type) {
              stats.typeBreakdown[item.type] = (stats.typeBreakdown[item.type] || 0) + 1;
            }
          });

          // Calculate average reduction
          if (history.length > 0) {
            const totalReduction = history.reduce(
              (sum, item) => sum + (item.reductionPercentage || 0),
              0
            );
            stats.averageReduction = Math.round(totalReduction / history.length);
          }

          return stats;
        },

        // Search history
        searchHistory: (searchTerm) => {
          const { history } = get();
          const term = searchTerm.toLowerCase();
          return history.filter((item) =>
            item.originalName.toLowerCase().includes(term)
          );
        },

        // Clean old history items based on settings
        cleanOldHistory: (daysToKeep) => {
          if (daysToKeep === 0) return; // Keep forever

          const cutoffDate = new Date();
          cutoffDate.setDate(cutoffDate.getDate() - daysToKeep);

          set((state) => ({
            history: state.history.filter(
              (item) => new Date(item.timestamp) > cutoffDate
            ),
          }));
        },
      }),
      {
        name: 'history-store',
        partialize: (state) => ({ history: state.history }),
      }
    ),
    {
      name: 'history-store',
    }
  )
);

export { useHistoryStore };
