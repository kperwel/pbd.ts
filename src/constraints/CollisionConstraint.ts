import { Vector3, Mesh } from 'three';

import Constraint from './Constraint';
import MassPoint from '../MassPoint';

export default class CollisionConstraint implements Constraint {
  mesh: Mesh;
  mp: MassPoint;
  stiffness: number;

  constructor(mp: MassPoint, mesh: Mesh) {
    this.mp = mp;
    this.mesh = mesh;
  }

  solve() {}
}
