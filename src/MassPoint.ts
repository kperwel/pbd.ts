import { Vector3 } from "three";
import { Prealocator } from "./solvers/Prealocator";



export interface IMassPoint {
  w: number; // 1/mass
  position: Vector3;
  nextPosition: Vector3;
  velocity: Vector3;
  update(): void;
}

export default class MassPoint implements IMassPoint {
  w: number; // 1/mass
  position: Vector3;
  nextPosition: Vector3;
  velocity: Vector3;

  constructor(position: Vector3) {
    this.position = position;
    this.nextPosition = position.clone();
    this.velocity = Prealocator.getVector3();
    this.w = 1;
  }

  update() {
    if (!this.nextPosition.equals(this.position)) {
      this.velocity
        .subVectors(this.nextPosition, this.position)
        .divideScalar(2);
      this.position.copy(this.nextPosition);
    }
  }
}
