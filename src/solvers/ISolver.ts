import { Vector3 } from "three";
import MassPoint from "../MassPoint";
export default interface ISolver {
  solve(): void;
  setFloor(v: Vector3): void;
  setHook(hook: MassPoint): void;
};
