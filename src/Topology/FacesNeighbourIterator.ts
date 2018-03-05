import { Vector3, Face3 } from 'three';
import MeshIterator from './MeshIterator';

export type FacesNeighbourType = Array<Face3>;

type CountedFaceType = {
  face: Face3;
  neighbours: FacesNeighbourType;
};

const hasCommonEdge = (a: Face3, b: Face3) =>
  new Set([a.a, a.b, a.c, b.a, b.b, b.c]).size === 4;

const getNeighbours = (
  countedFaces: Array<CountedFaceType>,
  index: number,
): CountedFaceType => {
  const main = countedFaces[index];
  for (let countedFace of countedFaces) {
    if (
      main !== countedFace &&
      !countedFace.neighbours.includes(main.face) &&
      !main.neighbours.includes(countedFace.face) &&
      hasCommonEdge(main.face, countedFace.face)
    ) {
      main.neighbours.push(countedFace.face);
      // countedFace.neighbours.push(main.face); uncomment for not unique
    }

    if (main.neighbours.length > 2) {
      break;
    }
  }

  return main;
};

export default class FacesNeighbourIterator extends MeshIterator<
  CountedFaceType
> {
  neighbours: Map<number, CountedFaceType>;

  [Symbol.iterator]() {
    let current = -1;
    let faces: Array<CountedFaceType> = this.faces.map(face => ({
      face,
      neighbours: [],
    }));

    let neighboursMap = this.neighbours;

    return {
      next() {
        current++;

        let neighbours = neighboursMap.get(current);

        if (!neighbours) {
          neighbours = getNeighbours(faces, current);
          neighboursMap.set(current, neighbours);
        }

        if (current >= faces.length - 1) {
          return {
            value: null,
            done: true,
          };
        }

        return {
          value: neighbours,
          done: false,
        };
      },
    };
  }

  constructor(vertices: Array<Vector3>, faces: Array<Face3>) {
    super(vertices, faces);
    this.neighbours = new Map();
  }
}
