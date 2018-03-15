import { Vector3 } from "three";
const zero = new Vector3(0, 0, 0);

export interface IMassPoint {
  w: number; // 1/mass
  position: Vector3;
  nextPosition: Vector3;
  velocity: Vector3;
  update(): void; // just copy nextPOsition to position
}

export default class MassPoint implements IMassPoint {
  w: number; // 1/mass
  position: Vector3;
  nextPosition: Vector3;
  velocity: Vector3;

  constructor(position: Vector3) {
    this.position = position;
    this.nextPosition = position.clone();
    this.velocity = new Vector3(0, 0, 0);
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
