/** @typedef {import("./ast.js").Expr} Expr */
/** @typedef {import("./types").ErrorReporter} ErrorReporter */
/** @typedef {import("./types").Value} Value */

import {
  BANG,
  BANG_EQUAL,
  EQUAL_EQUAL,
  GREATER,
  GREATER_EQUAL,
  LESS,
  LESS_EQUAL,
  MINUS,
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
   */
  constructor(reporter) {
    this.reporter = reporter;
  }

  /**
   * @param {Expr} expr
   */
  interpret(expr) {
    try {
      const value = this.evaluate(expr);
      console.log(this.stringify(value));

      return value;
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

  visitLiteralExpr(expr) {
    return expr.value;
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

  visitBinaryExpr(expr) {
    const left = this.evaluate(expr.left);
    const right = this.evaluate(expr.right);

    switch (expr.operator.type) {
      case GREATER:
        this.checkNumberOperands(expr.operator, left, right);
        return left > right;
      case GREATER_EQUAL:
        this.checkNumberOperands(expr.operator, left, right);
        return left >= right;
      case LESS:
        this.checkNumberOperands(expr.operator, left, right);
        return left < right;
      case LESS_EQUAL:
        this.checkNumberOperands(expr.operator, left, right);
        return left <= right;
      case BANG_EQUAL:
        return !this.isEqual(left, right);
      case EQUAL_EQUAL:
        return this.isEqual(left, right);
      case MINUS:
        this.checkNumberOperands(expr.operator, left, right);
        return left - right;
      case SLASH:
        this.checkNumberOperands(expr.operator, left, right);
        return left / right;
      case STAR:
        this.checkNumberOperands(expr.operator, left, right);
        return left * right;
      case PLUS:
        return left + right;
    }

    return null;
  }

  checkNumberOperand(operator, operand) {
    if (typeof operand === "number") return;

    throw new RuntimeError(operator, "Operand must be a number");
  }

  checkNumberOperands(operator, left, right) {
    if (typeof left === "number" && typeof right === "number") return;

    throw new RuntimeError(operator, "Operands must be numbers");
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
