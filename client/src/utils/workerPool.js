// Worker Pool Manager for handling network requests in separate threads
class WorkerPool {
  constructor(workerScript, poolSize = 4) {
    this.workers = [];
    this.taskQueue = [];
    this.activeRequests = new Map();
    this.requestId = 0;

    // Create worker pool
    for (let i = 0; i < poolSize; i++) {
      const worker = new Worker(workerScript);
      worker.onmessage = this.handleWorkerMessage.bind(this);
      this.workers.push({
        worker,
        busy: false,
      });
    }
  }

  handleWorkerMessage = (event) => {
    const { id, data, error, status } = event.data;
    const request = this.activeRequests.get(id);

    if (request) {
      if (error) {
        request.reject(new Error(error));
      } else {
        request.resolve({ data, status });
      }
      this.activeRequests.delete(id);

      // Mark worker as not busy
      const workerItem = this.workers.find(w => w.worker === event.target);
      if (workerItem) {
        workerItem.busy = false;
        this.procesQueue();
      }
    }
  };

  procesQueue = () => {
    const availableWorker = this.workers.find(w => !w.busy);
    const task = this.taskQueue.shift();

    if (availableWorker && task) {
      availableWorker.busy = true;
      availableWorker.worker.postMessage(task);
    }
  };

  fetch(method, url, body = null, headers = {}) {
    return new Promise((resolve, reject) => {
      const id = ++this.requestId;

      this.activeRequests.set(id, { resolve, reject });

      const task = {
        id,
        method,
        url,
        body,
        headers,
      };

      const availableWorker = this.workers.find(w => !w.busy);

      if (availableWorker) {
        availableWorker.busy = true;
        availableWorker.worker.postMessage(task);
      } else {
        this.taskQueue.push(task);
      }
    });
  }

  terminate() {
    this.workers.forEach(w => w.worker.terminate());
  }
}

// Initialize worker pool
const workerPool = new WorkerPool('/workers/fetchWorker.js', 4);

export default workerPool;
