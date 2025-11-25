/** @typedef {import("./stmt.js").Stmt} Stmt */
/** @typedef {import("./expr.js").Expr} Expr */
/** @typedef {import("./expr.js").Visitor} Visitor */
/** @typedef {import("./types").ErrorReporter} ErrorReporter */
/** @typedef {import("./types").IO} IO */
/** @typedef {import("./types").Value} Value */

import { Environment } from "./environment.js";
import {
  BANG,
  BANG_EQUAL,
  EQUAL_EQUAL,
  GREATER,
  GREATER_EQUAL,
  LESS,
  LESS_EQUAL,
  MINUS,
  OR,
  PLUS,
  SLASH,
  STAR,
} from "./token.js";

export class RuntimeError extends Error {
  constructor(token, message) {
    super(message);
    this.token = token;
  }
}

export class Interpreter {
  /**
   *
   * @param {ErrorReporter} reporter
   * @param {IO} io
   * @param {Environment} environment
   */
  constructor(reporter, io, environment) {
    this.reporter = reporter;
    this.io = io;
    this.environment = environment;
  }

  /**
   * @param {Stmt[]} stmts
   */
  interpret(stmts) {
    try {
      const boundExecute = this.execute.bind(this);
      stmts.forEach(boundExecute);
    } catch (e) {
      this.reporter.runtimeError(e);
    }
  }

  /**
   * @param {Expr} expr
   * @returns {Value}
   */
  evaluate(expr) {
    return expr.accept(this);
  }

  /**
   *
   * @param {Stmt} stmt
   */
  execute(stmt) {
    stmt.accept(this);
  }

  visitBlockStmt(stmt) {
    this.executeBlock(stmt.statements, new Environment(this.environment));
  }

  executeBlock(statements, environment) {
    const previous = this.environment;
    try {
      this.environment = environment;

      const boundExecute = this.execute.bind(this);

      statements.forEach(boundExecute);
    } finally {
      this.environment = previous;
    }
  }

  visitExpressionStmt(stmt) {
    this.evaluate(stmt.expression);
  }

  visitIfStmt(stmt) {
    if (this.isTruthy(this.evaluate(stmt.condition))) {
      this.execute(stmt.thenBranch);
    } else {
      this.execute(stmt.elseBranch);
    }
  }

  visitPrintStmt(stmt) {
    const value = this.evaluate(stmt.expression);

    this.io.print(this.stringify(value));
  }

  visitVarStmt(stmt) {
    let value = null;
    if (stmt.initializer !== null) {
      value = this.evaluate(stmt.initializer);
    }

    this.environment.define(stmt.name.lexeme, value);
  }

  visitWhileStmt(stmt) {
    while (this.isTruthy(this.evaluate(stmt.condition))) {
      this.execute(stmt.body);
    }
  }

  visitAssignExpr(expr) {
    const value = this.evaluate(expr.value);
    this.environment.assign(expr.name, value);
    return value;
  }

  visitLiteralExpr(expr) {
    return expr.value;
  }

  visitLogicalExpr(expr) {
    const left = this.evaluate(expr.left);

    if (expr.operator.type === OR) {
      if (this.isTruthy(left)) return left;
    } else {
      if (!this.isTruthy(left)) return left;
    }

    return this.evaluate(expr.right);
  }

  visitGroupingExpr(expr) {
    return this.evaluate(expr.expression);
  }

  visitUnaryExpr(expr) {
    const right = this.evaluate(expr.right);

    switch (expr.operator.type) {
      case BANG:
        return !this.isTruthy(right);
      case MINUS:
        this.checkNumberOperand(expr.operator, right);
        return -right;
    }

    return null;
  }

  visitVariableExpr(expr) {
    return this.environment.get(expr.name);
  }

  visitBinaryExpr(expr) {
    const left = this.evaluate(expr.left);
    const right = this.evaluate(expr.right);

    switch (expr.operator.type) {
      case GREATER:
        this.checkNumberOperand(expr.operator, left);
        this.checkNumberOperand(expr.operator, right);
        return left > right;
      case GREATER_EQUAL:
        this.checkNumberOperand(expr.operator, left);
        this.checkNumberOperand(expr.operator, right);
        return left >= right;
      case LESS:
        this.checkNumberOperand(expr.operator, left);
        this.checkNumberOperand(expr.operator, right);
        return left < right;
      case LESS_EQUAL:
        this.checkNumberOperand(expr.operator, left);
        this.checkNumberOperand(expr.operator, right);
        return left <= right;
      case BANG_EQUAL:
        return !this.isEqual(left, right);
      case EQUAL_EQUAL:
        return this.isEqual(left, right);
      case MINUS:
        this.checkNumberOperand(expr.operator, left);
        this.checkNumberOperand(expr.operator, right);
        return left - right;
      case SLASH:
        this.checkNumberOperand(expr.operator, left);
        this.checkNumberOperand(expr.operator, right);
        return left / right;
      case STAR:
        this.checkNumberOperand(expr.operator, left);
        this.checkNumberOperand(expr.operator, right);
        return left * right;
      case PLUS:
        return left + right;
    }

    return null;
  }

  /**
   * @param {string} operator
   * @param {Value} operand
   * @returns {asserts operand is number}
   */
  checkNumberOperand(operator, operand) {
    if (typeof operand === "number") return;

    throw new RuntimeError(operator, "Operand must be a number");
  }

  isTruthy(object) {
    if (object === null) return false;
    if (object === false) return false;
    return true;
  }

  isEqual(a, b) {
    if (a === null && b === null) return true;
    if (a === null) return false;

    return a === b;
  }

  /** @param {Value} object  */
  stringify(object) {
    if (object == null) return "nil";

    if (typeof object === "number") {
      let text = object.toString();
      if (text.endsWith(".0")) {
        text = text.substring(0, text.length - 2);
      }
      return text;
    }

    return object.toString();
  }
}
