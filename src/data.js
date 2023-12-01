class Garden {
    constructor(buffer, rows, cols) {
      this.buffer = buffer;
      this.u8 = new Uint8Array(buffer);
      this.rows = rows;
      this.cols = cols;
    }
  
    getCell(x, y) {
      const garden = this;
      const offset = (x + y * this.cols) * 4;
      
      return {
        get water() {
          return garden.u8[offset];
        },
        set water(value) {
          garden.u8[offset] = value;
        },
        get plant() {
          return garden.u8[offset + 1];
        },
        set plant(value) {
          garden.u8[offset + 1] = value;
        },
        get sun() {
          return garden.u8[offset + 2];
        },
        set sun(value) {
          garden.u8[offset + 2] = value;
        },
        get level() {
          return garden.u8[offset + 3];
        },
        set level(value) {
          garden.u8[offset + 3] = value;
        },
      };
    }
}

//should be around 100mb
const rows = 10000;
const cols = 10000;

const buffer = new ArrayBuffer(rows * cols * 4);
  
const garden = new Garden(buffer, rows, cols);
