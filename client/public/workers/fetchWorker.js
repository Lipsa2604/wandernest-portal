// Web Worker for handling network requests off the main thread
self.onmessage = async (event) => {
  const { id, method = 'GET', url, body, headers } = event.data;

  try {
    const options = {
      method,
      headers: {
        'Content-Type': 'application/json',
        ...headers,
      },
    };

    if (body) {
      options.body = JSON.stringify(body);
    }

    const response = await fetch(url, options);
    const data = await response.json();

    if (!response.ok) {
      self.postMessage({
        id,
        error: data.message || 'Network error',
        status: response.status,
      });
    } else {
      self.postMessage({
        id,
        data,
        status: response.status,
      });
    }
  } catch (error) {
    self.postMessage({
      id,
      error: error.message || 'Network error',
    });
  }
};
