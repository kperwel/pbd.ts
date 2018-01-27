export class Chunks implements Iterable<any> {
  array: Array<any>;
  chunkSize: number;
  constructor(array: Array<any>, chunkSize: number) {
    this.chunkSize = chunkSize;
    this.array = array;
  }
  [Symbol.iterator]() {
    let current = 0;
    let array = this.array;
    let chunkSize = this.chunkSize;

    return {
      next(): IteratorResult<any> {
        if (current < array.length) {
          return {
            done: false,
            value: array.slice(current, (current += chunkSize)),
          };
        } else {
          return {
            done: true,
            value: null,
          };
        }
      },
    };
  }
}
