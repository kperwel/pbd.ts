import { Vector3 } from 'three';

import Constraint from './Constraint';
import MassPoint from '../MassPoint';

export default class DistanceConstraint implements Constraint {
  mp: Array<MassPoint>;
  distance: number;
  stiffness: number;

  constructor(
    mp1: MassPoint,
    mp2: MassPoint,
    distance: number = 1,
    stiffness: number = 0.5,
  ) {
    this.mp = [mp1, mp2];
    this.distance = distance;
    this.stiffness = stiffness;
  }

  solve() {
    const sub = this.mp[0].nextPosition.clone().sub(this.mp[1].nextPosition);
    sub.divideScalar(sub.length());
    const dp1 = sub
      .clone()
      .multiplyScalar(
        -this.mp[0].w /
          (this.mp[0].w + this.mp[1].w) *
          (this.mp[0].nextPosition.distanceTo(this.mp[1].nextPosition) -
            this.distance),
      );
    const dp2 = sub
      .clone()
      .multiplyScalar(
        this.mp[1].w /
          (this.mp[0].w + this.mp[1].w) *
          (this.mp[0].nextPosition.distanceTo(this.mp[1].nextPosition) -
            this.distance),
      );

    this.mp[0].nextPosition.add(dp1.multiplyScalar(this.stiffness));
    this.mp[1].nextPosition.add(dp2.multiplyScalar(this.stiffness));
  }
}
