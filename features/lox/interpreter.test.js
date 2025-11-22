import { Assign, Expr, Literal, Variable } from "./expr.js";
import { Block, Print, Stmt, Vari } from "./stmt.js";
import { Interpreter } from "./interpreter.js";
import { runTests, TestErrorReporter, TestIO } from "./test.js";
import { Environment } from "./environment.js";
import { IDENTIFIER, Token } from "./token.js";

const allTests = [
  testInterpreterPrints,
  testInterpreterEvaluatesLiteral,
  testInterpreterManagesState,
];

runTests([testEnvironmentShadowing]);
//runTests(allTests);

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
  const mutatedToken = newIdentifierToken("mutated");
  const [io, err, env] = interpret([
    new Vari(uninitializedToken, null),
    new Vari(initializedToken, new Literal(5)),
    new Vari(mutatedToken, new Literal(4)),
    new Print(new Variable(initializedToken)),
    new Assign(mutatedToken, new Literal(6)),
  ]);

  const uninitialized = env.get(uninitializedToken);
  const initialized = env.get(initializedToken);
  const mutated = env.get(mutatedToken);

  return (
    uninitialized === null &&
    initialized === 5 &&
    mutated === 6 &&
    io.expect(["5"])
  );
}

function testEnvironmentShadowing() {
  const aToken = newIdentifierToken("a");
  const bToken = newIdentifierToken("b");
  const cToken = newIdentifierToken("c");

  const [io, err, env] = interpret([
    new Vari(aToken, new Literal("global a")),
    new Vari(bToken, new Literal("global b")),
    new Vari(cToken, new Literal("global c")),

    new Block([
      new Vari(aToken, new Literal("outer a")),
      new Vari(bToken, new Literal("outer b")),

      new Block([
        new Vari(aToken, new Literal("inner a")),
        new Print(new Variable(aToken)), // inner a
        new Print(new Variable(bToken)), // outer b
        new Print(new Variable(cToken)), // global c
      ]),

      new Print(new Variable(aToken)), // outer a
      new Print(new Variable(bToken)), // outer b
      new Print(new Variable(cToken)), // global c
    ]),

    new Print(new Variable(aToken)), // global a
    new Print(new Variable(bToken)), // global b
    new Print(new Variable(cToken)), // global c
  ]);

  io.expect([
    "inner a",
    "outer b",
    "global c",
    "outer a",
    "outer b",
    "global c",
    "global a",
    "global b",
    "global c",
  ]);

  return true;
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
