/** @typedef {import("./types").ErrorReporter} ErrorReporter */
/** @typedef {import("./token").Token} Token */

/** @implements ErrorReporter */
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

  /**
   * @param {Token} token
   * @param {string} msg
   */
  tokenError(token, msg) {}
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
