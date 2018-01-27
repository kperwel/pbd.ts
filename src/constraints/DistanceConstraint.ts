import { Vector3 } from 'three';

import Constraint from './Constraint';
import MassPoint from '../MassPoint';

export default class DistanceConstraint implements Constraint {
  mp: Array<MassPoint>;
  distance: number;
  stiffness: number;
  sub: Vector3;
  dp1: Vector3;
  dp2: Vector3;

  constructor(
    mp1: MassPoint,
    mp2: MassPoint,
    distance: number = 1,
    stiffness: number = 0.5,
  ) {
    this.sub = new Vector3();
    this.dp1 = new Vector3();
    this.dp2 = new Vector3();
    this.mp = [mp1, mp2];
    this.distance = distance;
    this.stiffness = stiffness;
  }

  solve() {
    this.sub.subVectors(this.mp[0].nextPosition, this.mp[1].nextPosition);
    const length = this.sub.length();
    this.sub.divideScalar(length);
    this.dp1
      .copy(this.sub)
      .multiplyScalar(
        -this.mp[0].w /
          (this.mp[0].w + this.mp[1].w) *
          (this.mp[0].nextPosition.distanceTo(this.mp[1].nextPosition) -
            this.distance),
      );

    this.dp2
      .copy(this.sub)
      .multiplyScalar(
        this.mp[1].w /
          (this.mp[0].w + this.mp[1].w) *
          (this.mp[0].nextPosition.distanceTo(this.mp[1].nextPosition) -
            this.distance),
      );

    this.mp[0].nextPosition.add(this.dp1.multiplyScalar(this.stiffness));
    this.mp[1].nextPosition.add(this.dp2.multiplyScalar(this.stiffness));
  }
}
