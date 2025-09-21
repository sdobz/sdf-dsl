const delay = 1;
const duration = 5;

console.log(`Waiting ${delay} seconds`);

setTimeout(() => {
  console.log(`Profiling for ${duration} seconds`);
  const start = performance.now() / 1000;

  let frames = 0;
  /** @param {DOMHighResTimeStamp} now  */
  function advance(now) {
    frames += 1;

    const elapsed = now / 1000 - start;
    if (elapsed >= duration) {
      console.log(`Completed ${frames} frames in ${elapsed} seconds`);
      console.log(`${(frames / elapsed).toFixed(2)}fps`);
    } else {
      requestAnimationFrame(advance);
    }
  }
  requestAnimationFrame(advance);
}, delay * 1000);
