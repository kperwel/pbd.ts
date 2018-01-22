import { timestamp } from './utils';
import { UpdateFunctionType } from './loop';

let lastTick = 0;
let tickTime = 0;
const fixedTick = 1 / 60;
let animationFrameId = 0;

export type UpdateFunctionType = (dt: number, time: number) => void;

const updates = new Set<UpdateFunctionType>();
const fixedUpdates = new Set<UpdateFunctionType>();

const update = (tick: number) => {
  let dt = tick - lastTick;
  tickTime += dt;

  for (let updateFn of updates) {
    updateFn(dt, tick);
  }

  if (fixedUpdates.size > 0) {
    if (tickTime > fixedTick * 10) {
      // skip calculation if too many frames missed
      tickTime = fixedTick;
    }
    while (tickTime >= fixedTick) {
      for (let fixedUpdateFn of fixedUpdates) {
        fixedUpdateFn(fixedTick, tick - tickTime);
      }
      tickTime -= fixedTick;
    }
  }

  lastTick = tick;
  animationFrameId = requestAnimationFrame(update);
};

export const add = (fn: UpdateFunctionType, fixed: boolean) => {
  (fixed ? fixedUpdates : updates).add(fn);

  if (fixedUpdates.size + updates.size > 0) {
    update(timestamp());
  }
};

export const remove = (fn: UpdateFunctionType) => {
  fixedUpdates.delete(fn);
  updates.delete(fn);

  if (fixedUpdates.size + updates.size === 0) {
    cancelAnimationFrame(animationFrameId);
  }
};

export const stop = () => {
  updates.clear();
  fixedUpdates.clear();
  cancelAnimationFrame(animationFrameId);
};
