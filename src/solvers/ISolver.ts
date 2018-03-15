import { Mesh, Vector3 } from "three";
export default interface ISolver {
  solve(): void;
  setFloor(v: Vector3): void;
};
