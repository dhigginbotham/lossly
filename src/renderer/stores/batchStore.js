import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';
import { temporal } from 'zundo';
import { v4 as uuidv4 } from 'uuid';

const useBatchStoreBase = create()(
  devtools(
    immer((set, get) => ({
      // Batch Queue
      queue: [],
      currentBatchId: null,
      batchSettings: {
        outputFormat: 'original',
        quality: 85,
        resize: null,
        outputDirectory: './compressed',
        namingPattern: '{name}_compressed',
        overwriteExisting: false,
        createTimestampFolder: true,
        concurrency: 4,
      },

      // Processing State
      isProcessing: false,
      processedCount: 0,
      totalCount: 0,
      currentFile: null,
      errors: [],

      // Stats
      totalOriginalSize: 0,
      totalCompressedSize: 0,
      averageCompressionRatio: 0,
      estimatedTimeRemaining: 0,
      processingStartTime: null,

      // Actions
      addToQueue: (files) => {
        const newItems = files.map((file) => ({
          id: uuidv4(),
          file,
          status: 'pending',
          progress: 0,
          selected: true,
          result: null,
          error: null,
        }));

        set((state) => {
          state.queue.push(...newItems);
          state.totalCount = state.queue.length;
        });
      },

      removeFromQueue: (ids) => {
        set((state) => {
          state.queue = state.queue.filter((item) => !ids.includes(item.id));
          state.totalCount = state.queue.length;
        });
      },

      clearQueue: () => {
        set((state) => {
          state.queue = [];
          state.totalCount = 0;
          state.processedCount = 0;
          state.errors = [];
          state.totalOriginalSize = 0;
          state.totalCompressedSize = 0;
        });
      },

      toggleItemSelection: (id) => {
        set((state) => {
          const item = state.queue.find((item) => item.id === id);
          if (item) {
            item.selected = !item.selected;
          }
        });
      },

      selectAll: () => {
        set((state) => {
          state.queue.forEach((item) => {
            item.selected = true;
          });
        });
      },

      deselectAll: () => {
        set((state) => {
          state.queue.forEach((item) => {
            item.selected = false;
          });
        });
      },

      reorderQueue: (fromIndex, toIndex) => {
        set((state) => {
          const [removed] = state.queue.splice(fromIndex, 1);
          state.queue.splice(toIndex, 0, removed);
        });
      },

      updateBatchSettings: (settings) => {
        set((state) => {
          Object.assign(state.batchSettings, settings);
        });
      },

      startBatchProcessing: async () => {
        const { queue, batchSettings } = get();
        const selectedItems = queue.filter((item) => item.selected && item.status === 'pending');

        if (selectedItems.length === 0) return;

        set((state) => {
          state.isProcessing = true;
          state.processedCount = 0;
          state.totalCount = selectedItems.length;
          state.errors = [];
          state.processingStartTime = Date.now();
        });

        try {
          const batchId = await window.electron.createBatch({
            settings: batchSettings,
            files: selectedItems.map((item) => ({
              id: item.id,
              path: item.file.path,
              name: item.file.name,
            })),
          });

          set((state) => {
            state.currentBatchId = batchId;
          });

          // Set up event listeners
          const progressCleanup = window.electron.onBatchProgress(batchId, (progress) => {
            set((state) => {
              state.processedCount = progress.processed;
              state.currentFile = progress.currentFile;
              state.estimatedTimeRemaining = progress.estimatedTime;

              const currentItem = state.queue.find(
                (item) => item.file.name === progress.currentFile
              );
              if (currentItem) {
                currentItem.status = 'processing';
                currentItem.progress = progress.fileProgress || 0;
              }
            });
          });

          const fileCompleteCleanup = window.electron.onFileComplete(batchId, (result) => {
            set((state) => {
              const item = state.queue.find((item) => item.id === result.fileId);
              if (item) {
                if (result.success) {
                  item.status = 'completed';
                  item.progress = 100;
                  item.result = result.data;
                  state.totalOriginalSize += result.data.originalSize;
                  state.totalCompressedSize += result.data.compressedSize;
                } else {
                  item.status = 'failed';
                  item.error = result.error;
                  state.errors.push({
                    fileId: result.fileId,
                    filename: item.file.name,
                    error: result.error,
                  });
                }
              }
            });
          });

          window.electron.onBatchComplete(batchId, (summary) => {
            set((state) => {
              state.isProcessing = false;
              state.averageCompressionRatio = summary.averageRatio;
              state.currentFile = null;
              state.processingStartTime = null;
            });

            // Cleanup listeners
            progressCleanup();
            fileCompleteCleanup();
          });
        } catch (error) {
          set((state) => {
            state.isProcessing = false;
            state.currentBatchId = null;
          });
          throw error;
        }
      },

      pauseBatchProcessing: () => {
        const { currentBatchId } = get();
        if (currentBatchId) {
          window.electron.pauseBatch(currentBatchId);
          set((state) => {
            state.isProcessing = false;
          });
        }
      },

      resumeBatchProcessing: () => {
        const { currentBatchId } = get();
        if (currentBatchId) {
          window.electron.resumeBatch(currentBatchId);
          set((state) => {
            state.isProcessing = true;
          });
        }
      },

      cancelBatchProcessing: () => {
        const { currentBatchId } = get();
        if (currentBatchId) {
          window.electron.cancelBatch(currentBatchId);
          set((state) => {
            state.isProcessing = false;
            state.currentBatchId = null;
            state.queue.forEach((item) => {
              if (item.status === 'processing') {
                item.status = 'pending';
                item.progress = 0;
              }
            });
          });
        }
      },

      retryFailed: () => {
        set((state) => {
          state.queue.forEach((item) => {
            if (item.status === 'failed') {
              item.status = 'pending';
              item.progress = 0;
              item.error = null;
            }
          });
          state.errors = [];
        });
      },
    })),
    {
      name: 'batch-store',
    }
  )
);

// Wrap with temporal for undo/redo
export const useBatchStore = temporal(useBatchStoreBase, {
  limit: 50,
  partialize: (state) => ({
    queue: state.queue,
    batchSettings: state.batchSettings,
  }),
});

// Selectors
export const selectPendingItems = (state) =>
  state.queue.filter((item) => item.status === 'pending');

export const selectCompletedItems = (state) =>
  state.queue.filter((item) => item.status === 'completed');

export const selectFailedItems = (state) =>
  state.queue.filter((item) => item.status === 'failed');

export const selectSelectedItems = (state) =>
  state.queue.filter((item) => item.selected);

export const selectBatchProgress = (state) => {
  if (state.totalCount === 0) return 0;
  return (state.processedCount / state.totalCount) * 100;
};

export const selectCompressionSavings = (state) => {
  if (state.totalOriginalSize === 0) return 0;
  return state.totalOriginalSize - state.totalCompressedSize;
};
