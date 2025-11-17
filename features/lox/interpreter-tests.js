import { Expr, Literal } from "./ast.js";
import { Interpreter } from "./interpreter.js";
import { runTests, TestErrorReporter } from "./test.js";

const allTests = [testInterpreterEvaluatesLiteral];

runTests(allTests);

function testInterpreterEvaluatesLiteral() {
  return interpret(new Literal(5)) === 5;
}

/**
 *
 * @param {Expr} expr
 */
function interpret(expr) {
  const reporter = new TestErrorReporter();

  const interpreter = new Interpreter(reporter);

  return interpreter.interpret(expr);
}
