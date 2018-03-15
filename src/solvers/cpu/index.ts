import MassPoint, { IMassPoint } from "./../../MassPoint";
import ISolver from "../ISolver";
import { Mesh, PlaneGeometry, MaskPass, Vector3 } from "three";
import IConstraint from "./constraints/IConstraint";
import DistanceConstraint from "./constraints/DistanceConstraint";
import BendingConstraint from "./constraints/BendingConstraint";
import CollisionConstraint from "./constraints/CollisionConstraint";

const ITERATIONS = 30;

const calcIterationalStiffness = (stiffness: number) =>
  1 - Math.pow(1 - stiffness, 1 / ITERATIONS);

class Cpu implements ISolver {
  constraints: Array<IConstraint> = [];
  onceConstraints: Array<IConstraint> = [];

  massPoints: Array<IMassPoint> = [];
  geometry: PlaneGeometry;

  floor: Vector3;

  width: number;
  height: number;

  constructor(geometry: PlaneGeometry, width: number, height = width) {
    this.width = width;
    this.height = height;
    this.geometry = geometry;

    this.setMassPoints(this.geometry.vertices.map(v => new MassPoint(v)));
  }

  setMassPoints(massPoints: Array<IMassPoint>) {
    this.massPoints = massPoints;
  }

  setFloor(position: Vector3) {
    this.floor = position;
  }

  setupConstraints() {
    for (let i = 0; i < this.massPoints.length; i++) {
      if (
        !this.massPoints[i] ||
        !this.massPoints[i + 1] ||
        !this.massPoints[i + this.width] ||
        !this.massPoints[i + this.width + 1]
      ) {
        continue;
      }
      this.constraints.push(
        new BendingConstraint(
          this.massPoints[i + this.width],
          this.massPoints[i + 1],
          this.massPoints[i],
          this.massPoints[i + this.width + 1],
          0,
          calcIterationalStiffness(0.4)
        )
      );
    }

    // continue with constraintsSetting position constraints
    for (let { a, b, c } of this.geometry.faces) {
      this.constraints.push(
        new DistanceConstraint(
          this.massPoints[a],
          this.massPoints[b],
          this.massPoints[b].position.distanceTo(this.massPoints[a].position),
          calcIterationalStiffness(1)
        )
      );
      this.constraints.push(
        new DistanceConstraint(
          this.massPoints[b],
          this.massPoints[c],
          this.massPoints[b].position.distanceTo(this.massPoints[c].position),
          calcIterationalStiffness(1)
        )
      );
      this.constraints.push(
        new DistanceConstraint(
          this.massPoints[c],
          this.massPoints[a],
          this.massPoints[c].position.distanceTo(this.massPoints[a].position),
          calcIterationalStiffness(1)
        )
      );
    }
  }

  checkDynamicConstraints() {
    for (let i = 0; i < this.massPoints.length; i++) {
      if (this.floor && this.massPoints[i].nextPosition.y <= this.floor.y) {
        this.onceConstraints.push(
          new CollisionConstraint(
            this.massPoints[i],
            new Vector3(
              this.massPoints[i].nextPosition.x,
              this.floor.y,
              this.massPoints[i].nextPosition.z
            ),
            new Vector3(0, 1, 0),
            1
          )
        );
      }
    }
  }

  solve() {
    this.checkDynamicConstraints();
    for (let i = 0; i < ITERATIONS; i++) {
      for (let i = 0; i < this.onceConstraints.length; i++) {
        this.onceConstraints[i].solve();
      }
      for (let i = 0; i < this.constraints.length; i++) {
        this.constraints[i].solve();
      }
    }
    this.onceConstraints = [];
  }
}

export default Cpu;
