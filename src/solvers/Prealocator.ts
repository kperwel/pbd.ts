import { Vector3 } from "three";

const PREALLOCATED = 1500;
export class Prealocator {
  static current = 0;
  static vectors3 = Array.from({length:PREALLOCATED}, _ => new Vector3());
  static getVector3 () {
    if (this.current >= PREALLOCATED) {
      this.current = 0;
    }
    return this.vectors3[this.current++];
  }
}