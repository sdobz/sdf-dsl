import { Scanner } from "./scanner.js";
import {
  BANG,
  BANG_EQUAL,
  EOF,
  EQUAL_EQUAL,
  GREATER,
  GREATER_EQUAL,
  LEFT_BRACE,
  LEFT_PAREN,
  NUMBER,
  RIGHT_BRACE,
  RIGHT_PAREN,
  STRING,
} from "./token.js";

class TestErrorReporter {
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

const allTests = [
  testScannerNothing,
  testScannerSingleChars,
  testScannerDoubleChars,
  testScannerLiteralTypes,
];

runTests(allTests);

function testScannerNothing() {
  return expectTokens("", [EOF]);
}

function testScannerSingleChars() {
  return expectTokens("(){}", [
    LEFT_PAREN,
    RIGHT_PAREN,
    LEFT_BRACE,
    RIGHT_BRACE,
    EOF,
  ]);
}

function testScannerDoubleChars() {
  return expectTokens(">= > == != !", [
    GREATER_EQUAL,
    GREATER,
    EQUAL_EQUAL,
    BANG_EQUAL,
    BANG,
    EOF,
  ]);
}

function testScannerLiteralTypes() {
  return expectTokens(
    `123.45 "hi there"`,
    [NUMBER, STRING, EOF],
    [123.45, "hi there", null]
  );
}

function runTests(tests) {
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

function expectTokens(src, expected, literals) {
  const reporter = new TestErrorReporter();

  const scanner = new Scanner(src, reporter);
  const tokens = scanner.scanTokens();

  while (true) {
    const got = tokens.pop();
    const expect = expected.pop();
    const literal = literals && literals.pop();

    if (got === undefined && expect === undefined) {
      break;
    }

    if (got !== undefined && expect === undefined) {
      console.error("too many tokens");
      return false;
    }
    if (expect !== undefined && got === undefined) {
      console.error("not enough tokens");
      return false;
    }

    if (got.type !== expect) {
      console.error("Mismatched types");
      return false;
    }

    if (literal && got.literal !== literal) {
      console.error("Mismatched literal");
      return false;
    }
  }

  return true;
}
