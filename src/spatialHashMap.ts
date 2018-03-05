import { Vector3, Face3 } from "three";

const hashPoint = (point: Vector3): string =>
  `${point.x}-${point.y}-${point.z}`;

interface IStringTMap<T> {
  [key: string]: T;
}
interface IStringFaceArrayMap extends IStringTMap<Array<Face3>> {}

const pushOrInit = (ob: IStringFaceArrayMap, key: string, item: Face3) => {
  if (ob[key]) {
    ob[key].push(item);
  } else {
    ob[key] = [item];
  }
};

class SpatialHashMap {
  map: IStringFaceArrayMap = {};
  cellSize: number;

  constructor(cellSize: number) {
    this.cellSize = cellSize;
  }
  addFace(face: Face3, vertices: Array<Vector3>) {
    pushOrInit(this.map, hashPoint(vertices[face.a]), face);
    pushOrInit(this.map, hashPoint(vertices[face.b]), face);
    pushOrInit(this.map, hashPoint(vertices[face.c]), face);
  }
}
