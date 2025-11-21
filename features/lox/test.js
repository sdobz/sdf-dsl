/** @typedef {import("./types").ErrorReporter} ErrorReporter */
/** @typedef {import("./types").IO} IO */
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
      console.log(`${test.name} threw:`, err);
      ok = false;
    }
  });

  if (ok) {
    console.log("Tests passing");
  }
}

export class TestIO {
  constructor() {
    this.messages = [];
  }

  /**
   *
   * @param {string} str
   */
  print(str) {
    this.messages.push(str);
  }

  /**
   *
   * @param {string[]} messages
   */
  expect(messages) {
    while (true) {
      const got = this.messages.pop();
      const expect = messages.pop();

      if (got === undefined && expect === undefined) {
        break;
      }

      if (got !== undefined && expect === undefined) {
        console.log("too many messages");
        return false;
      }
      if (got === undefined) {
        console.log("not enough messages");
        return false;
      }

      if (got !== expect) {
        console.log("mismatched message, expect:", expect, "got:", got);
        return false;
      }
    }

    return true;
  }
}
