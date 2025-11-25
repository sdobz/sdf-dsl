import { Assign, Expr, Literal, Logical, Variable } from "./expr.js";
import { Block, IfStmt, Print, Stmt, VarStmt } from "./stmt.js";
import { Interpreter } from "./interpreter.js";
import {
  expectAll,
  expectEqual,
  runTests,
  TestErrorReporter,
  TestIO,
} from "./test.js";
import { Environment } from "./environment.js";
import { AND, IDENTIFIER, OR, Token } from "./token.js";

const allTests = [
  // testInterpreterPrints,
  // testInterpreterEvaluatesLiteral,
  testInterpreterManagesState,
  // testEnvironmentShadowing,
  // testControlFlow,
];

// runTests([testControlFlow]);
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
  const mutatedToken = newIdentifierToken("mutated");
  const [io, err, env] = interpret([
    new VarStmt(uninitializedToken, null),
    new VarStmt(initializedToken, new Literal(5)),
    new VarStmt(mutatedToken, new Literal(4)),
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
    new VarStmt(aToken, new Literal("global a")),
    new VarStmt(bToken, new Literal("global b")),
    new VarStmt(cToken, new Literal("global c")),

    new Block([
      new VarStmt(aToken, new Literal("outer a")),
      new VarStmt(bToken, new Literal("outer b")),

      new Block([
        new VarStmt(aToken, new Literal("inner a")),
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

function testControlFlow() {
  const andResultFalse = evaluate(
    new Logical(new Literal(false), AND, new Literal("andResult"))
  );
  const andResultTrue = evaluate(
    new Logical(new Literal(true), AND, new Literal("andResult"))
  );
  const orResultFalse = evaluate(
    new Logical(new Literal(false), OR, new Literal("orResult"))
  );
  const orResultTrue = evaluate(
    new Logical(new Literal(true), OR, new Literal("orResult"))
  );

  const [ifIO] = interpret([
    new IfStmt(new Literal(true), new Print(new Literal("ifResult"))),
    new IfStmt(
      new Literal(false),
      new Print(new Literal("ifResultThen")),
      new Print(new Literal("ifResultElse"))
    ),
  ]);

  return expectAll([
    expectEqual(andResultFalse, false),
    expectEqual(andResultTrue, "andResult"),
    expectEqual(orResultFalse, false),
    expectEqual(orResultTrue, "orResult"),
    ifIO.expect(["ifResult", "ifResultElse"]),
  ]);
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
