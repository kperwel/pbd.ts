import { Vector3, Face3 } from 'three';
import MeshIterator from './MeshIterator';

type Triangle = {
  a: Vector3;
  b: Vector3;
  c: Vector3;
};

export default class TrianglesIterator extends MeshIterator<Triangle> {
  [Symbol.iterator]() {
    let current = -1;
    let faces = this.faces;
    let vertices = this.vertices;

    return {
      next() {
        current++;
        if (current >= faces.length) {
          return {
            value: null,
            done: true,
          };
        }

        return {
          value: {
            a: vertices[faces[current].a],
            b: vertices[faces[current].b],
            c: vertices[faces[current].c],
          },
          done: false,
        };
      },
    };
  }
  constructor(vertices: Array<Vector3>, faces: Array<Face3>) {
    super(vertices, faces);
  }
}
