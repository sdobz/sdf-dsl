import { Environment } from "./environment.js";
import { Interpreter } from "./interpreter.js";
import { Parser } from "./parser.js";
import { Scanner } from "./scanner.js";
import { runTests, TestErrorReporter, TestIO } from "./test.js";

const allTests = [testForLoop];

runTests(allTests);

function testForLoop() {
  const [io] = run(`
    var a = 0;
    var temp;

    for (var b = 1; a < 10000; b = temp + b) {
    print a;
    temp = a;
    a = b;
    }
  `);

  return io.expect([
    "0",
    "1",
    "1",
    "2",
    "3",
    "5",
    "8",
    "13",
    "21",
    "34",
    "55",
    "89",
    "144",
    "233",
    "377",
    "610",
    "987",
    "1597",
    "2584",
    "4181",
    "6765",
  ]);
}

/**
 * @param {string} body
 */
function run(body) {
  const reporter = new TestErrorReporter();
  const scanner = new Scanner(body, reporter);
  const tokens = scanner.scanTokens();
  const parser = new Parser(tokens, reporter);
  const stmts = parser.parse();
  const io = new TestIO();
  const environment = new Environment();
  const interpreter = new Interpreter(reporter, io, environment);
  interpreter.interpret(stmts);

  return /** @type {const} */ ([io, reporter, environment]);
}
