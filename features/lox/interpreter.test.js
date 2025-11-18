import { Expr, Literal } from "./expr.js";
import { Interpreter } from "./interpreter.js";
import { runTests, TestErrorReporter } from "./test.js";

const allTests = [testInterpreterEvaluatesLiteral];

runTests(allTests);

function testInterpreterEvaluatesLiteral() {
  return evaluate(new Literal(5)) === 5;
}

/**
 *
 * @param {Expr} expr
 */
function evaluate(expr) {
  const reporter = new TestErrorReporter();

  const interpreter = new Interpreter(reporter);

  return interpreter.evaluate(expr);
}
