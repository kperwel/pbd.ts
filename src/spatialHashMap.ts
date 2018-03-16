import { Vector3, Face3 } from "three";

const hashPoint = (point: Vector3, cellSize: number): string =>
  `${Math.trunc(point.x * 100 / cellSize)}-${Math.trunc(
    point.y * 100 / cellSize
  )}-${Math.trunc(point.z * 100 / cellSize)}`;

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

export default class SpatialHashMap {
  map: IStringFaceArrayMap = {};
  cellSize: number;

  constructor(cellSize: number) {
    this.cellSize = cellSize;
  }
  addFace(face: Face3, vertices: Array<Vector3>) {
    pushOrInit(this.map, hashPoint(vertices[face.a], this.cellSize), face);
    pushOrInit(this.map, hashPoint(vertices[face.b], this.cellSize), face);
    pushOrInit(this.map, hashPoint(vertices[face.c], this.cellSize), face);
  }
}
