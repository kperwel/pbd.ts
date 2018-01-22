export const timestamp = () =>
  window.performance && window.performance.now ? window.performance.now() : new Date().getTime();
