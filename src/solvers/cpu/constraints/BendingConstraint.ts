import { Vector3 } from "three";

import IConstraint from "./IConstraint";
import MassPoint from "../../../MassPoint";
import { Prealocator } from "../../Prealocator";

const calcn = (p1: Vector3, p2: Vector3): Vector3 =>
  Prealocator.getVector3().crossVectors(p1, p2).normalize();


let pixni = Prealocator.getVector3();
let njxpj = Prealocator.getVector3();
let pkxpl = Prealocator.getVector3();

const calcq = (
  pi: Vector3,
  pj: Vector3,
  pk: Vector3,
  pl: Vector3,
  ni: Vector3,
  nj: Vector3,
  d: number
): Vector3 => {
  pixni.crossVectors(pi, ni);
  njxpj.crossVectors(nj, pj);
  pkxpl.crossVectors(pk, pl);

  return Prealocator.getVector3().addVectors(pixni, njxpj.multiplyScalar(d)).divideScalar(pkxpl.length());
};

let wq2 = 0;
export default class BendingConstraint implements IConstraint {
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
    stiffness: number = 0.5
  ) {
    this.sub = Prealocator.getVector3();
    this.dp = [Prealocator.getVector3(), Prealocator.getVector3(), Prealocator.getVector3(), Prealocator.getVector3()];

    this.mp = [mp1, mp2, mp3, mp4];

    this.angle = angle;
    this.stiffness = stiffness;
  }

  solve() {
    const lambda = this.angle;
    const q = [];
    const { nextPosition: p2 } = this.mp[1];
    const { nextPosition: p3 } = this.mp[2];
    const { nextPosition: p4 } = this.mp[3];

    const n1 = calcn(p2, p3);
    const n2 = calcn(p2, p4);
    const d = n1.dot(n2);

    q[3] = calcq(p2, p2, p2, p3, n2, n1, d);
    q[2] = calcq(p2, p2, p2, p4, n1, n2, d);
    q[1] = calcq(p3, p3, p2, p3, n2, n1, d)
      .multiplyScalar(-1)
      .sub(calcq(p4, p4, p2, p4, n1, n2, d));

    q[0] = q[1]
      .clone()
      .multiplyScalar(-1)
      .sub(q[2])
      .sub(q[3]);

    wq2 = 0;
    for (let i = 0; i < 4; i++) {
      wq2 += this.mp[i].w * Math.pow(q[i].length(), 2);
    }
    // if (isNaN(wq2) || Math.abs(wq2) < 0.0000001) {
    //   return;
    // }

    for (let i = 0; i < 4; i++) {
      this.dp[i] = q[i].multiplyScalar(
        -this.mp[i].w * Math.sqrt(1 - Math.pow(d, 2)) * (Math.acos(d) - lambda) / wq2
      );
    }

    for (let i = 0; i < 4; i++) {
      this.mp[i].nextPosition.add(this.dp[i].multiplyScalar(this.stiffness));
    }
  }
}
