const { Worker } = require('worker_threads');
const path = require('path');
const os = require('os');
const EventEmitter = require('events');

class WorkerPoolService extends EventEmitter {
  constructor() {
    super();
    this.workers = [];
    this.freeWorkers = [];
    this.queue = [];
    this.minWorkers = 1;
    this.maxWorkers = Math.max(1, os.cpus().length - 1);
    this.currentWorkers = 0;
    this.taskTimeout = 5 * 60 * 1000; // 5 minutes
    this.workerIdleTimeout = 60 * 1000; // 1 minute
    this.memoryLimit = 512; // MB per worker
    this.isPaused = false;
    this.stats = {
      totalTasks: 0,
      completedTasks: 0,
      failedTasks: 0,
      totalProcessingTime: 0,
    };
  }

  async initialize (options = {}) {
    this.minWorkers = options.minWorkers || this.minWorkers;
    this.maxWorkers = options.maxWorkers || this.maxWorkers;
    this.taskTimeout = options.taskTimeout || this.taskTimeout;
    this.memoryLimit = options.memoryLimit || this.memoryLimit;

    console.log(`Initializing worker pool with ${this.minWorkers}-${this.maxWorkers} workers`);

    // Create minimum number of workers
    for (let i = 0; i < this.minWorkers; i++) {
      await this.createWorker();
    }
  }

  createWorker () {
    return new Promise((resolve, reject) => {
      if (this.currentWorkers >= this.maxWorkers) {
        reject(new Error('Maximum number of workers reached'));
        return;
      }

      const workerPath = path.join(__dirname, '../workers/compressionWorker.js');
      const worker = new Worker(workerPath, {
        resourceLimits: {
          maxOldGenerationSizeMb: this.memoryLimit,
        },
      });

      const workerId = Date.now() + Math.random();
      const workerInfo = {
        id: workerId,
        worker,
        busy: false,
        currentTask: null,
        idleTimer: null,
        createdAt: Date.now(),
        tasksCompleted: 0,
      };

      worker.on('message', (message) => {
        this.handleWorkerMessage(workerInfo, message);
      });

      worker.on('error', (error) => {
        console.error(`Worker ${workerId} error:`, error);
        this.handleWorkerError(workerInfo, error);
      });

      worker.on('exit', (code) => {
        console.log(`Worker ${workerId} exited with code ${code}`);
        this.removeWorker(workerInfo);
      });

      this.workers.push(workerInfo);
      this.freeWorkers.push(workerInfo);
      this.currentWorkers++;

      console.log(`Created worker ${workerId}. Total workers: ${this.currentWorkers}`);
      resolve(workerInfo);
    });
  }

  removeWorker (workerInfo) {
    // Clear idle timer
    if (workerInfo.idleTimer) {
      clearTimeout(workerInfo.idleTimer);
    }

    // Remove from arrays
    this.workers = this.workers.filter((w) => w.id !== workerInfo.id);
    this.freeWorkers = this.freeWorkers.filter((w) => w.id !== workerInfo.id);
    this.currentWorkers--;

    // Terminate worker
    workerInfo.worker.terminate();

    console.log(`Removed worker ${workerInfo.id}. Total workers: ${this.currentWorkers}`);

    // If we're below minimum, create a new worker
    if (this.currentWorkers < this.minWorkers) {
      this.createWorker().catch(console.error);
    }
  }

  handleWorkerMessage (workerInfo, message) {
    const { type, taskId, data, error } = message;

    switch (type) {
      case 'task-complete':
        this.handleTaskComplete(workerInfo, taskId, data);
        break;
      case 'task-error':
        this.handleTaskError(workerInfo, taskId, error);
        break;
      case 'progress':
        this.emit('task-progress', { taskId, progress: data });
        break;
      case 'log':
        console.log(`Worker ${workerInfo.id}:`, data);
        break;
    }
  }

  handleWorkerError (workerInfo, error) {
    if (workerInfo.currentTask) {
      this.handleTaskError(workerInfo, workerInfo.currentTask.id, error);
    }
    this.removeWorker(workerInfo);
  }

  handleTaskComplete (workerInfo, taskId, result) {
    const task = workerInfo.currentTask;
    if (!task || task.id !== taskId) return;

    // Clear task timeout
    if (task.timeout) {
      clearTimeout(task.timeout);
    }

    // Update stats
    this.stats.completedTasks++;
    this.stats.totalProcessingTime += Date.now() - task.startTime;
    workerInfo.tasksCompleted++;

    // Mark worker as free
    workerInfo.busy = false;
    workerInfo.currentTask = null;
    this.freeWorkers.push(workerInfo);

    // Resolve task promise
    task.resolve(result);

    // Process next task in queue
    this.processQueue();

    // Set idle timer
    this.setWorkerIdleTimer(workerInfo);
  }

  handleTaskError (workerInfo, taskId, error) {
    const task = workerInfo.currentTask;
    if (!task || task.id !== taskId) return;

    // Clear task timeout
    if (task.timeout) {
      clearTimeout(task.timeout);
    }

    // Update stats
    this.stats.failedTasks++;

    // Mark worker as free
    workerInfo.busy = false;
    workerInfo.currentTask = null;
    this.freeWorkers.push(workerInfo);

    // Reject task promise
    task.reject(new Error(error.message || 'Task failed'));

    // Process next task in queue
    this.processQueue();

    // Set idle timer
    this.setWorkerIdleTimer(workerInfo);
  }

  setWorkerIdleTimer (workerInfo) {
    // Clear existing timer
    if (workerInfo.idleTimer) {
      clearTimeout(workerInfo.idleTimer);
    }

    // Don't set timer if we're at minimum workers
    if (this.currentWorkers <= this.minWorkers) return;

    // Set new idle timer
    workerInfo.idleTimer = setTimeout(() => {
      if (!workerInfo.busy && this.currentWorkers > this.minWorkers) {
        console.log(`Worker ${workerInfo.id} idle for too long, removing`);
        this.removeWorker(workerInfo);
      }
    }, this.workerIdleTimeout);
  }

  async processTask (task) {
    return new Promise((resolve, reject) => {
      const taskInfo = {
        id: Date.now() + Math.random(),
        task,
        resolve,
        reject,
        startTime: Date.now(),
        timeout: null,
      };

      // Update stats
      this.stats.totalTasks++;

      // Add to queue
      this.queue.push(taskInfo);

      // Process queue
      this.processQueue();
    });
  }

  async processQueue () {
    if (this.isPaused || this.queue.length === 0) return;

    // Get available worker
    const worker = this.freeWorkers.pop();
    if (!worker) {
      // Try to create a new worker if below max
      if (this.currentWorkers < this.maxWorkers) {
        try {
          await this.createWorker();
          this.processQueue(); // Try again
        } catch (error) {
          console.error('Failed to create new worker:', error);
        }
      }
      return;
    }

    // Get next task
    const taskInfo = this.queue.shift();
    if (!taskInfo) {
      this.freeWorkers.push(worker);
      return;
    }

    // Clear idle timer
    if (worker.idleTimer) {
      clearTimeout(worker.idleTimer);
      worker.idleTimer = null;
    }

    // Mark worker as busy
    worker.busy = true;
    worker.currentTask = taskInfo;

    // Set task timeout
    taskInfo.timeout = setTimeout(() => {
      console.error(`Task ${taskInfo.id} timed out`);
      this.handleTaskError(worker, taskInfo.id, new Error('Task timeout'));
    }, this.taskTimeout);

    // Send task to worker
    worker.worker.postMessage({
      type: 'compress',
      taskId: taskInfo.id,
      data: taskInfo.task,
    });
  }

  // Public API methods
  async compress (imagePath, settings) {
    return this.processTask({
      imagePath,
      settings,
    });
  }

  async compressBatch (items, onProgress) {
    const results = [];
    const errors = [];

    for (let i = 0; i < items.length; i++) {
      const item = items[i];

      if (this.isPaused) {
        await this.waitForResume();
      }

      try {
        const result = await this.compress(item.path, item.settings);
        results.push({ ...result, id: item.id });

        if (onProgress) {
          onProgress({
            type: 'item-complete',
            itemId: item.id,
            current: i + 1,
            total: items.length,
            result,
          });
        }
      } catch (error) {
        errors.push({ id: item.id, error: error.message });

        if (onProgress) {
          onProgress({
            type: 'item-error',
            itemId: item.id,
            current: i + 1,
            total: items.length,
            error: error.message,
          });
        }
      }
    }

    return { results, errors };
  }

  pause () {
    this.isPaused = true;
    this.emit('paused');
  }

  resume () {
    this.isPaused = false;
    this.emit('resumed');
    this.processQueue();
  }

  async waitForResume () {
    if (!this.isPaused) return;

    return new Promise((resolve) => {
      const checkResume = () => {
        if (!this.isPaused) {
          resolve();
        } else {
          setTimeout(checkResume, 100);
        }
      };
      checkResume();
    });
  }

  getStats () {
    return {
      ...this.stats,
      currentWorkers: this.currentWorkers,
      busyWorkers: this.workers.filter((w) => w.busy).length,
      queueLength: this.queue.length,
      averageProcessingTime:
        this.stats.completedTasks > 0
          ? Math.round(this.stats.totalProcessingTime / this.stats.completedTasks)
          : 0,
    };
  }

  async shutdown () {
    console.log('Shutting down worker pool');

    // Clear queue
    this.queue.forEach((task) => {
      task.reject(new Error('Worker pool shutting down'));
    });
    this.queue = [];

    // Terminate all workers
    for (const worker of this.workers) {
      if (worker.idleTimer) {
        clearTimeout(worker.idleTimer);
      }
      worker.worker.terminate();
    }

    this.workers = [];
    this.freeWorkers = [];
    this.currentWorkers = 0;
  }
}

// Singleton instance
const workerPool = new WorkerPoolService();

module.exports = {
  workerPool,
  initializeWorkerPool: (options) => workerPool.initialize(options),
};
