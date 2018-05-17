import ISolver from "../ISolver";
import * as GPU from "gpu.js";
import { Vector3, PlaneGeometry } from "three";
import { IMassPoint } from "../../MassPoint";
import IConstraint from "../cpu/constraints/IConstraint";
import DistanceConstraint from "../cpu/constraints/DistanceConstraint";

type GpuMassPoint = [number, number, number, number, number, number, number];
type GpuDistanceConstraint = [number, number, number];
/*
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
            this.distance)
      );

    this.dp2
      .copy(this.sub)
      .multiplyScalar(
        this.mp[1].w /
          (this.mp[0].w + this.mp[1].w) *
          (this.mp[0].nextPosition.distanceTo(this.mp[1].nextPosition) -
            this.distance)
      );
      
    this.mp[0].nextPosition.add(this.dp1.multiplyScalar(this.stiffness));
    this.mp[1].nextPosition.add(this.dp2.multiplyScalar(this.stiffness));
  }
*/

const gpu = new GPU();

const ITERATIONS = 30;

const noRepeatsPush = (arr: Array<any>, item: any) => {
  if (arr.indexOf(item) === -1) {
    arr.push(item);
  }
};

const join = (constraints: Array<any>, a: any, b: any) => {
  if (a !== b) {
    noRepeatsPush(constraints[a], b);
    noRepeatsPush(constraints[b], a);
  }
};

const calcIterationalStiffness = (stiffness: number) =>
  1 - Math.pow(1 - stiffness, 1 / ITERATIONS);

class Gpu implements ISolver {
  constraints: Array<any>;

  massPoints: Array<GpuMassPoint>;

  geometry: PlaneGeometry;

  floor: Vector3;

  width: number;
  height: number;

  constructor(geometry: PlaneGeometry, width: number, height = width) {
    this.width = width;
    this.height = height;
    this.geometry = geometry;
    this.constraints = Array(this.geometry.vertices.length);
    for (let i = 0; i < this.geometry.vertices.length; i++) {
      this.constraints[i] = [];
    }
  }

  setupConstraints() {
    this.massPoints = this.geometry.vertices.map(
      ({ x, y, z }, i): GpuMassPoint => [x, y, z, 1, 1, 1, 1]
    );
    for (let { a, b, c } of this.geometry.faces) {
      join(this.constraints, a, b);
      join(this.constraints, b, c);
      join(this.constraints, c, a);
    }
    console.log("constraints", this.constraints);
    console.log("mp", this.massPoints);
    // gpu.addFunction(function distanceConstraintSolve(
    //   n0: any,
    //   n1: any,
    //   w0: any,
    //   w1: any,
    //   distance: any
    // ) {
    //   var d = n1 - n0;
    //   return -w0 / (w0 + w1) * (d - distance);
    // });
    const matMult = gpu.createKernel(
      function(mp: any, c: any) {
        // var n0 = mp[this.thread.y][this.thread.x];
        // var n1 = mp[this.thread.y + 1][this.thread.x];
        // var n2 = mp[this.thread.y - 1][this.thread.x];

        // var pn = distanceConstraintSolve(
        //   n0,
        //   n1,
        //   mp[this.thread.y][3],
        //   mp[this.thread.y][4],
        //   10
        // );
        // mp[point index][axis or property]
        // !this.massPoints[i] ||
        // !this.massPoints[i + 1] ||
        // !this.massPoints[i + this.width] ||
        return mp[this.thread.y];
        //return mp[this.thread.y][this.thread.x];
      },
      {
        constants: { size: this.width },
        output: [3, this.constraints.length]
      }
    );

    // Perform matrix multiplication on 2 matrices of size 512 x 512
    const c = matMult(this.massPoints, this.constraints);
    console.log("result", c);
  }

  checkDynamicConstraints() {}

  setFloor(v: Vector3): void {
    throw new Error("Method not implemented.");
  }

  solve() {}
}

export default Gpu;
