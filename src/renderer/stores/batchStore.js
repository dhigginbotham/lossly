import { create } from 'zustand';
import { devtools } from 'zustand/middleware';

const useBatchStore = create(
  devtools(
    (set, get) => ({
      // Batch items
      batchItems: [],
      batchStats: {
        total: 0,
        completed: 0,
        failed: 0,
        totalSaved: 0,
      },
      currentProcessingId: null,
      isPaused: false,

      // Actions
      addToBatch: (item) =>
        set((state) => {
          const newItem = {
            ...item,
            id: item.id || Date.now().toString() + Math.random(),
            status: 'pending',
            progress: 0,
          };
          return {
            batchItems: [...state.batchItems, newItem],
            batchStats: {
              ...state.batchStats,
              total: state.batchStats.total + 1,
            },
          };
        }),

      removeFromBatch: (id) =>
        set((state) => ({
          batchItems: state.batchItems.filter((item) => item.id !== id),
          batchStats: {
            ...state.batchStats,
            total: state.batchStats.total - 1,
          },
        })),

      clearBatch: () =>
        set(() => ({
          batchItems: [],
          batchStats: {
            total: 0,
            completed: 0,
            failed: 0,
            totalSaved: 0,
          },
          currentProcessingId: null,
          isPaused: false,
        })),

      updateBatchItem: (id, updates) =>
        set((state) => ({
          batchItems: state.batchItems.map((item) =>
            item.id === id ? { ...item, ...updates } : item
          ),
        })),

      updateBatchStats: (updates) =>
        set((state) => ({
          batchStats: { ...state.batchStats, ...updates },
        })),

      setCurrentProcessingId: (id) =>
        set(() => ({ currentProcessingId: id })),

      setPaused: (paused) =>
        set(() => ({ isPaused: paused })),

      // Process next item in batch
      processNextItem: () => {
        const { batchItems, currentProcessingId } = get();

        // If already processing, skip
        if (currentProcessingId) return null;

        // Find next pending item
        const nextItem = batchItems.find((item) => item.status === 'pending');
        if (!nextItem) return null;

        set(() => ({ currentProcessingId: nextItem.id }));
        return nextItem;
      },

      // Mark item as completed
      completeItem: (id, result) =>
        set((state) => {
          const item = state.batchItems.find((i) => i.id === id);
          if (!item) return state;

          const newStats = {
            ...state.batchStats,
            completed: state.batchStats.completed + 1,
          };

          if (result.savedBytes) {
            newStats.totalSaved = state.batchStats.totalSaved + result.savedBytes;
          }

          return {
            batchItems: state.batchItems.map((i) =>
              i.id === id
                ? {
                  ...i,
                  status: 'completed',
                  progress: 100,
                  ...result,
                }
                : i
            ),
            batchStats: newStats,
            currentProcessingId: null,
          };
        }),

      // Mark item as failed
      failItem: (id, error) =>
        set((state) => ({
          batchItems: state.batchItems.map((item) =>
            item.id === id
              ? {
                ...item,
                status: 'failed',
                error: error.message || error,
              }
              : item
          ),
          batchStats: {
            ...state.batchStats,
            failed: state.batchStats.failed + 1,
          },
          currentProcessingId: null,
        })),

      // Update progress
      updateProgress: (id, progress) =>
        set((state) => ({
          batchItems: state.batchItems.map((item) =>
            item.id === id ? { ...item, progress } : item
          ),
        })),

      // Get batch by status
      getItemsByStatus: (status) => {
        const { batchItems } = get();
        return batchItems.filter((item) => item.status === status);
      },

      // Get progress percentage
      getOverallProgress: () => {
        const { batchStats } = get();
        if (batchStats.total === 0) return 0;
        return ((batchStats.completed + batchStats.failed) / batchStats.total) * 100;
      },
    }),
    {
      name: 'batch-store',
    }
  )
);

export { useBatchStore };
