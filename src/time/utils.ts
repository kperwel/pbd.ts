import { Face3 } from 'three';

export const timestamp = () =>
  window.performance && window.performance.now
    ? window.performance.now()
    : new Date().getTime();

export const reducedLog = (times: number) => {
  let i = times;

  return (...args: any[]) => {
    if (++i > times) {
      console.log(...args);
      i = 0;
    }
  };
};
