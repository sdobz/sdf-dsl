// Goal: SDF intermediate format
// Compiles to shader?

/**
 * @typedef {Object} Stack
 * @prop {Point3D[]} points3
 * @prop {Point2D[]} points2
 * @prop {number[]} floats
 * @prop {number[]} ints
 * @prop {number[]} ops
 * @prop {number} walk
 * @prop {number} skip
 */

/**
 * @typedef {[number, number]} Point2D
 * @typedef {[number, number, number]} Point3D
 */
const OP_POINT2_SUBTRACT = 0;
const OP_POINT2_LENGTH = 1;
const OP_FLOAT_SUBTRACT = 2;
const OP_FLOAT_ABS = 3;
const OP_POINT3_DROP = 4;
const OP_FLOAT_BRANCH = 5;
const OP_FLOAT_SWAP = 6;

/** @type {{[opId in number]: (stack: Stack) => void}} */
const ops = {
  [OP_POINT2_SUBTRACT]: ({ points2 }) => {
    const a = points2.pop();
    const b = points2.pop();
    /** @type {Point2D} */
    const result = [b[0] - a[0], b[1] - a[1]];
    points2.push(result);
  },
  [OP_FLOAT_SUBTRACT]: ({ floats }) => {
    const a = floats.pop();
    const b = floats.pop();
    const result = a - b;
    floats.push(result);
  },
  [OP_POINT2_LENGTH]: ({ points2, floats }) => {
    const a = points2.pop();
    const result = Math.sqrt(a[0] ** 2 + a[1] ** 2);
    floats.push(result);
  },
  [OP_FLOAT_ABS]: ({ floats }) => {
    const a = floats.pop();
    const result = Math.abs(a);
    floats.push(result);
  },
  [OP_FLOAT_SWAP]: ({ floats }) => {
    const a = floats.pop();
    const b = floats.pop();
    floats.push(a, b);
  },
  [OP_POINT3_DROP]: ({ points3 }) => {
    points3.pop();
  },
  [OP_FLOAT_BRANCH]: (stack) => {
    const { ints, floats } = stack;
    const a = ints.pop();
    const b = ints.pop();

    const t = floats.pop();

    if (t > 0) {
      stack.walk = a;
      stack.skip = b;
    } else {
      stack.skip = a;
      stack.walk = 0;
    }
  },
};

/**
 * Apply all operations in a stack
 * @param {Stack} stack
 */
function op(stack) {
  while (stack.ops.length > 0) {
    const nextOp = stack.ops.pop();

    if (stack.skip > 0 && stack.walk == 0) {
      stack.skip -= 1;
      return;
    }
    ops[nextOp](stack);
    if (stack.walk > 0) {
      stack.walk -= 1;
    }
  }
}

// param: vec2 p, float r
// type: (points: [center, ...], floats: [radius, ...]) => (points: [...], floats: [sdf, ...])
/** @type {(center: Point2D, radius: number) => (sdf: Stack) => void} */
const sdf_circle2 =
  (center, radius) =>
  ({ points2, floats, ops }) => {
    points2.push(center);
    floats.push(radius);
    ops.push(OP_FLOAT_SUBTRACT, OP_POINT2_LENGTH, OP_POINT2_SUBTRACT);
  };

/** @type {(color: Point3D, width: number) => (sdf: Stack) => void} */
const sdf_line2 =
  (color, width) =>
  ({ floats, ints, ops, points3 }) => {
    // assume: "distance"
    floats.push(width);
    ints.push(0, 1);
    points3.push(color);
    ops.push(OP_POINT3_DROP, OP_FLOAT_BRANCH, OP_FLOAT_SUBTRACT, OP_FLOAT_ABS);
  };

/**
 * Plots a 2d SDF to a canvas
 * @param {(sdf: Stack) => void} paths
 * @param {HTMLCanvasElement} canvas
 */
function render(paths, canvas) {
  // For each point on the canvas
  const ctx = canvas.getContext("2d");

  /** @type {Point3D} */
  const background = [0, 0, 0];

  const { width, height } = canvas;
  const img = ctx.createImageData(width, height);
  const data = img.data; // flat array [r,g,b,a,...]

  // iterate over each pixel
  for (let i = 0; i < data.length; i += 4) {
    const pixelIndex = i / 4; // pixel number 0..(width*height-1)
    const x = pixelIndex % width; // column
    const y = Math.floor(pixelIndex / width); // row

    /** @type {Stack} */
    const root = {
      points2: [[x, y]],
      points3: [],
      floats: [],
      ints: [],
      ops: [],
      skip: 0,
      walk: 0,
    };

    paths(root);
    op(root);

    if (root.points3.length > 0) {
      const color = root.points3.pop();
      data[i] = color[0];
      data[i + 1] = color[1];
      data[i + 2] = color[2];
      data[i + 3] = 255;
    } else {
      data[i] = background[0];
      data[i + 1] = background[1];
      data[i + 2] = background[2];
      data[i + 3] = 255;
    }
  }

  ctx.putImageData(img, 0, 0);
}

function main() {
  const canvas = document.getElementsByTagName("canvas")[0];
  canvas.width = 500;
  canvas.height = 500;

  animate(canvas);
}

/** @param {HTMLCanvasElement} canvas */
function animate(canvas) {
  const ctx = canvas.getContext("2d");
  /** @param {DOMHighResTimeStamp} start */
  function callback(start) {
    /** @type (sdf: Stack) => void */
    const paths = (sdf) => {
      sdf_line2([245, 132, 66], 9)(sdf);
      sdf_circle2(
        [canvas.width / 2, canvas.height / 2],
        canvas.height / 3
      )(sdf);
    };
    render(paths, canvas);

    ctx.textAlign = "right";
    ctx.fillStyle = "white";
    const finish = performance.now();
    const fps = 1000 / (finish - start);

    ctx.fillText(
      `${fps.toFixed(1)} fps`,
      canvas.width - 10,
      canvas.height - 10
    );

    requestAnimationFrame(callback);
  }

  callback(performance.now());
}

let times = []; // timestamps of frames

function updateFps() {
  const now = performance.now();
  times.push(now);

  // keep only the last second
  while (times.length > 0 && times[0] <= now - 1000) {
    times.shift();
  }

  const fps = times.length; // frames in the last 1 s
  return fps;
}

main();
