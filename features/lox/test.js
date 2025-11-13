export class TestErrorReporter {
  constructor() {
    this.errors = [];
  }

  /**
   * @param {number} line
   * @param {string} msg
   */
  error(line, msg) {
    this.errors.push([line, "", msg]);
  }
}

export function runTests(tests) {
  let ok = true;
  tests.forEach((test) => {
    if (!test()) {
      console.error(`${test.name} failed`);
      ok = false;
    }
  });

  if (ok) {
    console.log("Tests passing");
  }
}
