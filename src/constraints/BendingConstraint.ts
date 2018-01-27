import { Vector3 } from 'three';

import Constraint from './Constraint';
import MassPoint from '../MassPoint';

const calcn = (p1: Vector3, p2: Vector3): Vector3 =>
  new Vector3().crossVectors(p1, p2).normalize();

const calcq = (
  pj: Vector3,
  pi: Vector3,
  nj: Vector3,
  ni: Vector3,
  d: number,
  pk: Vector3 = pj,
): Vector3 => {
  const njxpj = new Vector3().crossVectors(nj, pj);
  const pjxpi = new Vector3().crossVectors(pj, pi);
  return new Vector3()
    .crossVectors(pj, nj)
    .add(njxpj.multiplyScalar(d))
    .divideScalar(pjxpi.length());
};

export default class BendingConstraint implements Constraint {
  mp: Array<MassPoint>;
  angle: number;
  stiffness: number;
  sub: Vector3;

  dp: Array<Vector3>;

  constructor(
    mp1: MassPoint,
    mp2: MassPoint,
    mp3: MassPoint,
    mp4: MassPoint,
    angle: number = 1,
    stiffness: number = 0.5,
  ) {
    this.sub = new Vector3();
    this.dp[0] = new Vector3();
    this.dp[1] = new Vector3();
    this.dp[2] = new Vector3();
    this.dp[3] = new Vector3();

    this.mp = [mp1, mp2, mp3, mp4];

    this.angle = angle;
    this.stiffness = stiffness;
  }

  solve() {
    const lambda = this.angle;
    const q = [];
    const w = this.mp.map(({ w }) => w);
    const { position: p1 } = this.mp[0];
    const { position: p2 } = this.mp[1];
    const { position: p3 } = this.mp[2];
    const { position: p4 } = this.mp[3];

    const n1 = calcn(p2, p3);
    const n2 = calcn(p2, p4);
    const d = n1.dot(n2);

    q[4] = calcq(p2, p3, n2, n1, d);
    q[3] = calcq(p2, p4, n1, n2, d);
    q[1] = calcq(p3, p3, n2, n1, d, p2)
      .multiplyScalar(-1)
      .sub(calcq(p4, p4, n1, n2, d, p2));
    q[0] = new Vector3()
      .subVectors(q[1], q[2])
      .sub(q[3])
      .multiplyScalar(-1);

    let wq2 = 0;
    for (let i = 0; i < 4; i++) {
      wq2 += w[i] * Math.pow(q[i].length(), 2);
    }
    for (let i = 0; i < 4; i++) {
      this.dp[i] = q[0].multiplyScalar(
        -w[i] * Math.sqrt(1 - Math.pow(d, 2)) * (Math.acos(d) - lambda) / wq2,
      );

      this.mp[i].nextPosition.add(this.dp[i].multiplyScalar(this.stiffness));
    }
  }
}
