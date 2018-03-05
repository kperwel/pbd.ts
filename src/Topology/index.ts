import { Geometry, Face3, Vector3 } from 'three';
import Chunks from './Chunks';
import FacesNeighbourIterator from './FacesNeighbourIterator';

export default class Topology {
  vertices: Array<Vector3>;
  faces: Array<Face3>;

  facesNeighbourIterator: FacesNeighbourIterator;

  constructor(geometry: Geometry) {
    this.vertices = geometry.vertices;
    this.faces = geometry.faces;

    this.facesNeighbourIterator = new FacesNeighbourIterator(
      this.vertices,
      this.faces,
    );
  }
}
