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

  runtimeError(error) {}
}

/**
 * @param {(() => boolean)[]} tests
 */
export function runTests(tests) {
  let ok = true;
  tests.forEach((test) => {
    try {
      const result = test();

      if (!result) {
        console.log(`${test.name} failed`);
        ok = false;
      }
    } catch (err) {
      console.error(`❌ Test ${test.name} threw:`, err);
      ok = false;
    }
  });

  if (ok) {
    console.log("Tests passing");
  }
}
