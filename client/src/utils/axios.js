import axios from 'axios';
import workerPool from './workerPool';

const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_BASE_URL,
  withCredentials: true,
});

// Store original request method
const originalRequest = axiosInstance.request;

// Intercept requests to use Web Worker pool for non-blocking network calls
// This ensures data fetches don't block the main thread
axiosInstance.request = async function (config) {
  try {
    // For smaller/critical requests, use regular axios (maintains compatibility)
    // For heavier payloads, use worker pool
    if (config.method && config.method.toUpperCase() !== 'GET') {
      // POST, PUT, DELETE etc - use worker pool
      const response = await workerPool.fetch(
        config.method.toUpperCase(),
        `${config.baseURL || ''}${config.url}`,
        config.data,
        config.headers
      );
      return response;
    } else {
      // GET requests - use regular axios for better caching
      return originalRequest.call(this, config);
    }
  } catch (error) {
    // Fallback to regular axios on worker error
    console.warn('Worker fetch failed, falling back to regular axios:', error);
    return originalRequest.call(this, config);
  }
};

export default axiosInstance;
