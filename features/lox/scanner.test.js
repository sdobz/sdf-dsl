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

import { runTests, TestErrorReporter } from "./test.js";

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
      console.log("too many tokens");
      return false;
    }
    if (got === undefined) {
      console.log("not enough tokens");
      return false;
    }

    if (got.type !== expect) {
      console.log("Mismatched types");
      return false;
    }

    if (literal && got.literal !== literal) {
      console.log("Mismatched literal");
      return false;
    }
  }

  return true;
}
