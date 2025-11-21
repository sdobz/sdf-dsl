import { Expr, Literal, Variable } from "./expr.js";
import { Print, Stmt, Vari } from "./stmt.js";
import { Interpreter } from "./interpreter.js";
import { runTests, TestErrorReporter, TestIO } from "./test.js";
import { Environment } from "./environment.js";
import { IDENTIFIER, Token } from "./token.js";

const allTests = [
  testInterpreterPrints,
  testInterpreterEvaluatesLiteral,
  testInterpreterManagesState,
];

// runTests([testInterpreterManagesState]);
runTests(allTests);

function testInterpreterEvaluatesLiteral() {
  return evaluate(new Literal(5)) === 5;
}

function testInterpreterPrints() {
  const [io, err, env] = interpret([new Print(new Literal(5))]);

  io.expect(["5"]);
  return true;
}

function newIdentifierToken(name) {
  return new Token(IDENTIFIER, name, name, 1);
}

function testInterpreterManagesState() {
  const uninitializedToken = newIdentifierToken("uninitialized");
  const initializedToken = newIdentifierToken("initialized");
  const [io, err, env] = interpret([
    new Vari(uninitializedToken, null),
    new Vari(initializedToken, new Literal(5)),
    new Print(new Variable(initializedToken)),
  ]);

  const uninitialized = env.get(uninitializedToken);
  const initialized = env.get(initializedToken);

  return uninitialized === null && initialized === 5 && io.expect(["5"]);
}

/**
 * @param {Expr} expr
 */
function evaluate(expr) {
  const reporter = new TestErrorReporter();
  const io = new TestIO();
  const environment = new Environment();

  const interpreter = new Interpreter(reporter, io, environment);

  return interpreter.evaluate(expr);
}

/**
 * @param {Stmt[]} stmts
 */
function interpret(stmts) {
  const reporter = new TestErrorReporter();
  const io = new TestIO();
  const environment = new Environment();

  const interpreter = new Interpreter(reporter, io, environment);

  interpreter.interpret(stmts);

  return /** @type {const} */ ([io, reporter, environment]);
}
