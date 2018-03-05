import { Vector3, Face3 } from 'three';
export default abstract class MeshIterator<T> implements Iterable<any> {
  vertices: Array<Vector3>;
  faces: Array<Face3>;

  constructor(vertices: Array<Vector3>, faces: Array<Face3>) {
    this.vertices = vertices;
    this.faces = faces;
  }

  abstract [Symbol.iterator](): {
    next(): IteratorResult<T>;
  };
}
