export const fakeApi = (data, delay = 600) =>
  new Promise((resolve) => {
    setTimeout(() => resolve(data), delay);
  });

export const fakeApiError = (message, delay = 600) =>
  new Promise((_, reject) => {
    setTimeout(() => reject(new Error(message)), delay);
  });