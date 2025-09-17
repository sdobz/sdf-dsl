// Goal: SDF intermediate format
// Compiles to shader?

/**
 * @typedef {Object} SDF
 * @prop {Point[]} points
 * @prop {number[]} floats
 * @prop {number[]} ints
 * @prop {number[]} ops
 */

/**
 * @typedef {[number, number]} Point
 */
const OP_POINT_SUBTRACT = 0;
const OP_POINT_LENGTH = 1;
const OP_FLOAT_SUBTRACT = 2;

/** @type {{[opId in number]: (sdf: SDF) => void}} */
const ops = {
  [OP_POINT_SUBTRACT]: ({ points }) => {
    const a = points.pop();
    const b = points.pop();
    /** @type {Point} */
    const result = [b[0] - a[0], b[1] - a[1]];
    points.push(result);
  },
  [OP_FLOAT_SUBTRACT]: ({ floats }) => {
    const a = floats.pop();
    const b = floats.pop();
    const result = a-b;
    floats.push(result);
  },
  [OP_POINT_LENGTH]: ({ points, floats }) => {
    const a = points.pop();
    const result = Math.sqrt(a[0] ** 2 + a[1] ** 2);
    floats.push(result);
  },
};

/**
 * Apply all operations in a sdf
 * @param {SDF} sdf
 */
function op(sdf) {
  while (sdf.ops.length > 0) {
    const nextOp = sdf.ops.pop();
    ops[nextOp](sdf);
  }
}

// param: vec2 p, float r
// type: (points: [center, ...], floats: [radius, ...]) => (points: [...], floats: [sdf, ...])
/** @type {(center: Point, radius: number) => (sdf: SDF) => void} */
const sdf_circle =
  (center, radius) =>
  ({ points, floats, ops }) => {
    points.push(center);
    floats.push(radius);
    ops.push(OP_FLOAT_SUBTRACT, OP_POINT_LENGTH, OP_POINT_SUBTRACT);
  };

/**
 * Plots a 2d SDF to a canvas
 * @param {(sdf: SDF) => void} paths
 * @param {HTMLCanvasElement} canvas
 */
function render(paths, canvas) {
  // For each point on the canvas
  const ctx = canvas.getContext("2d");
  const { width, height } = canvas;
  const img = ctx.createImageData(width, height)
  const data = img.data; // flat array [r,g,b,a,...]

  // iterate over each pixel
  for (let i = 0; i < data.length; i += 4) {
    const pixelIndex = i / 4; // pixel number 0..(width*height-1)
    const x = pixelIndex % width; // column
    const y = Math.floor(pixelIndex / width); // row

    /** @type {SDF} */
    const rootSDF = {
      points: [[x, y]],
      floats: [],
      ints: [],
      ops: [],
    };

    paths(rootSDF);
    op(rootSDF);

    const distance = rootSDF.floats[0]

    const gray = distance < 0 ? 0 : 255-(distance * 10 % 255);
    data[i] = gray;
    data[i + 1] = gray;
    data[i + 2] = gray;
    data[i + 3] = 255;
  }

  ctx.putImageData(img, 0, 0);
}

function main() {
  const canvas = document.getElementsByTagName("canvas")[0];
  canvas.width = 500;
  canvas.height = 500;
  
  const start = performance.now()
  /** @type (sdf: SDF) => void */
  const paths = (sdf) => {
    sdf_circle([canvas.width / 2, canvas.height / 2], canvas.height / 3)(sdf);
  };
  render(paths, canvas);

  const finish = performance.now()

  console.log("took", (finish - start).toFixed(2))
}

main();
