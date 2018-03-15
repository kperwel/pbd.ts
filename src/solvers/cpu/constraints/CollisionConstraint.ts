import { Vector3, Mesh } from "three";

import IConstraint from "./IConstraint";
import MassPoint from "../../../MassPoint";

export default class CollisionConstraint implements IConstraint {
  mp: MassPoint;
  stiffness: number;
  direction: Vector3;
  collisionPoint: Vector3;

  constructor(
    mp: MassPoint,
    collisionPoint: Vector3,
    direction: Vector3,
    stiffness: number = 1
  ) {
    this.direction = direction.normalize();
    this.stiffness = stiffness;
    this.collisionPoint = collisionPoint;
    this.mp = mp;
  }

  solve() {
    const response = new Vector3();
    response
      .subVectors(this.collisionPoint, this.mp.nextPosition)
      .multiply(this.direction);

    this.mp.nextPosition.add(response);
  }
}
