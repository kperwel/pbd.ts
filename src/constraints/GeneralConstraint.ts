import { Vector3 } from 'three';

import Constraint from './Constraint';
import MassPoint from '../MassPoint';

const C = (v1: Vector3, v2: Vector3) =>
  v2
    .clone()
    .sub(v1)
    .length() - 1;

export default class DistanceConstraint implements Constraint {
  mp1: MassPoint;
  mp2: MassPoint;

  constructor(mp1: MassPoint, mp2: MassPoint) {
    this.mp1 = mp1;
    this.mp2 = mp2;
  }

  solve(dt) {
    const s =
      C(this.mp1.position, this.mp2.position) / (this.mp1.w + this.mp2.w);
    const dp = C(this.mp1.position, this.mp2.position);
  }
}
