import { Expr, Literal } from "./expr.js";
import { Print, Stmt } from "./stmt.js";
import { Interpreter } from "./interpreter.js";
import { runTests, TestErrorReporter, TestIO } from "./test.js";

// const allTests = [testInterpreterEvaluatesLiteral];
const allTests = [testInterpreterPrints];

runTests(allTests);

function testInterpreterEvaluatesLiteral() {
  return evaluate(new Literal(5)) === 5;
}

function testInterpreterPrints() {
  const [io, err] = interpret([new Print(new Literal(5))]);

  io.expect(["5"]);
  return true;
}

/**
 * @param {Expr} expr
 */
function evaluate(expr) {
  const reporter = new TestErrorReporter();
  const io = new TestIO();

  const interpreter = new Interpreter(reporter, io);

  return interpreter.evaluate(expr);
}

/**
 * @param {Stmt[]} stmts
 */
function interpret(stmts) {
  const reporter = new TestErrorReporter();
  const io = new TestIO();

  const interpreter = new Interpreter(reporter, io);

  interpreter.interpret(stmts);

  return /** @type {const} */ ([io, reporter]);
}
