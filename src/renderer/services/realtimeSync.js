import { useAppStore } from '../stores/appStore';
import { useBatchStore } from '../stores/batchStore';

class RealtimeSync {
  constructor() {
    this.subscribers = new Map();
    this.intervalId = null;
  }

  subscribe (store, callback) {
    if (!this.subscribers.has(store)) {
      this.subscribers.set(store, new Set());
    }

    this.subscribers.get(store).add(callback);

    // Return unsubscribe function
    return () => {
      this.subscribers.get(store)?.delete(callback);
    };
  }

  notifySubscribers (store, data) {
    const callbacks = this.subscribers.get(store);
    if (callbacks) {
      callbacks.forEach(callback => callback(data));
    }
  }

  startSystemStatsPolling () {
    // Poll system stats every 2 seconds
    this.intervalId = setInterval(() => {
      // Simulate system stats for now
      // In production, this would come from the main process
      const stats = {
        cpu: Math.random() * 30 + 10, // 10-40%
        memory: Math.random() * 2147483648 + 1073741824, // 1-3GB
        workers: Math.floor(Math.random() * 4) + 1, // 1-4 workers
      };

      useAppStore.getState().updateSystemStats(stats);
    }, 2000);
  }

  stopSystemStatsPolling () {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
  }
}

// Create singleton instance
const sync = new RealtimeSync();

// Setup store synchronization
export function setupStoreSync () {
  // Start system stats polling
  sync.startSystemStatsPolling();

  // Listen for store updates from main process
  if (window.electron?.onStoreUpdate) {
    window.electron.onStoreUpdate((update) => {
      sync.notifySubscribers(update.store, update.data);
    });
  }

  // Cleanup on window unload
  window.addEventListener('beforeunload', () => {
    sync.stopSystemStatsPolling();
  });
}

// Export sync instance for manual subscriptions
export default sync;
