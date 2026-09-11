export const createChessWorker = () => {
  if (process.env.NODE_ENV === 'test') {
    return null;
  }

  if (typeof Worker === 'undefined') {
    return null;
  }

  try {
    return new Worker(new URL('./chessWorker.js', import.meta.url), {
      type: 'module'
    });
  } catch (error) {
    console.warn('Failed to create chess worker, falling back to main thread.', error);
    return null;
  }
};
