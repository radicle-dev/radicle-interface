// Copyright (c) 2019, Ethereum Name Service

// The random number is a js implementation of the Xorshift PRNG
let randseed = new Array(4) // Xorshift: [x, y, z, w] 32 bit values

function seedrand(seed: string) {
  for (let i = 0; i < randseed.length; i++) {
    randseed[i] = 0;
  }
  for (let i = 0; i < seed.length; i++) {
    randseed[i % 4] =
      (randseed[i % 4] << 5) - randseed[i % 4] + seed.charCodeAt(i);
  }
}

function rand(): number {
  // Based on Java's String.hashCode(), expanded to 4 32bit values.
  let t = randseed[0] ^ (randseed[0] << 11)

  randseed[0] = randseed[1]
  randseed[1] = randseed[2]
  randseed[2] = randseed[3]
  randseed[3] = randseed[3] ^ (randseed[3] >> 19) ^ t ^ (t >> 8)

  return (randseed[3] >>> 0) / ((1 << 31) >>> 0)
}

function createColor(): string {
  // Saturation is the whole color spectrum.
  let h = Math.floor(rand() * 360);
  // Saturation goes from 40 to 100, it avoids greyish colors.
  let s = rand() * 60 + 40 + '%';
  // Lightness can be anything from 0 to 100, but probabilities are a bell curve around 50%.
  let l = (rand() + rand() + rand() + rand()) * 25 + '%';

  return `hsl(${h}, ${s}, ${l})`;
}

function createImageData(size: number): number[] {
  let width = size;
  let height = size;

  let dataWidth = Math.ceil(width / 2);
  let mirrorWidth = width - dataWidth;

  let data = [];
  for (let y = 0; y < height; y++) {
    let row = [];
    for (let x = 0; x < dataWidth; x++) {
      // this makes foreground and background color to have a 43% (1/2.3) probability
      // spot color has 13% chance
      row[x] = Math.floor(rand() * 2.3);
    }
    let r = row.slice(0, mirrorWidth);
    r.reverse();
    row = row.concat(r);

    for (let i = 0; i < row.length; i++) {
      data.push(row[i]);
    }
  }

  return data;
}

function createCanvas(
  imageData: number[],
  color: string,
  scale: number,
  bgcolor: string,
  spotcolor: string
): HTMLCanvasElement {
  let c = document.createElement('canvas');
  let width = Math.sqrt(imageData.length);
  c.width = c.height = width * scale;

  let cc = c.getContext('2d');

  if (! cc) throw new Error("Can't get 2D context");

  cc.fillStyle = bgcolor;
  cc.fillRect(0, 0, c.width, c.height);
  cc.fillStyle = color;

  for (let i = 0; i < imageData.length; i++) {
    let row = Math.floor(i / width);
    let col = i % width;
    // if data is 2, choose spot color, if 1 choose foreground
    cc.fillStyle = imageData[i] === 1 ? color : spotcolor;

    // if data is 0, leave the background
    if (imageData[i]) {
      cc.fillRect(col * scale, row * scale, scale, scale);
    }
  }

  return c;
}

export interface Options {
  seed: string
  size: number
  scale: number
  color?: string
  bgcolor?: string
  spotcolor?: string
}

export function createIcon(opts: Options) {
  opts = opts || {};
  let size = opts.size || 8;
  let scale = opts.scale || 4;
  let seed =
    opts.seed || Math.floor(Math.random() * Math.pow(10, 16)).toString(16);

  seedrand(seed);

  let color = opts.color || createColor();
  let bgcolor = opts.bgcolor || createColor();
  let spotcolor = opts.spotcolor || createColor();
  let imageData = createImageData(size);
  let canvas = createCanvas(imageData, color, scale, bgcolor, spotcolor);

  return canvas;
}
