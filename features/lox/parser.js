/** @typedef {import("./token").Token} Token */
/** @typedef {import("./token").TokenType} TokenType */
/** @typedef {import("./types").ErrorReporter} ErrorReporter */

import { Expr, Binary, Grouping, Literal, Unary } from "./ast.js";
import {
  BANG,
  BANG_EQUAL,
  CLASS,
  EOF,
  EQUAL_EQUAL,
  FALSE,
  FOR,
  FUN,
  GREATER,
  GREATER_EQUAL,
  IF,
  LEFT_PAREN,
  LESS,
  LESS_EQUAL,
  MINUS,
  NIL,
  NUMBER,
  PLUS,
  PRINT,
  RETURN,
  RIGHT_PAREN,
  SEMICOLON,
  SLASH,
  STAR,
  STRING,
  TRUE,
  VAR,
  WHILE,
} from "./token.js";

export class ParseError extends Error {}

export class Parser {
  /**
   * @param {Token[]} tokens
   * @param {ErrorReporter} reporter
   */
  constructor(tokens, reporter) {
    this.tokens = tokens;
    this.reporter = reporter;
    this.current = 0;
  }

  /**
   * @returns {Expr | null}
   */
  parse() {
    try {
      return this.expression();
    } catch (error) {
      return null;
    }
  }

  /**
   * @returns {Expr}
   */
  expression() {
    return this.equality();
  }

  /**
   * @return {Expr}
   */
  equality() {
    let expr = this.comparison();

    while (this.match(BANG_EQUAL, EQUAL_EQUAL)) {
      const operator = this.previous();
      const right = this.comparison();
      expr = new Binary(expr, operator, right);
    }

    return expr;
  }

  /**
   * @return {Expr}
   */
  comparison() {
    let expr = this.term();

    while (this.match(GREATER, GREATER_EQUAL, LESS, LESS_EQUAL)) {
      const operator = this.previous();
      const right = this.term();
      expr = new Binary(expr, operator, right);
    }

    return expr;
  }

  /**
   * @return {Expr}
   */
  term() {
    let expr = this.factor();

    while (this.match(MINUS, PLUS)) {
      const operator = this.previous();
      const right = this.factor();
      expr = new Binary(expr, operator, right);
    }

    return expr;
  }

  /**
   * @return {Expr}
   */
  factor() {
    let expr = this.unary();

    while (this.match(SLASH, STAR)) {
      const operator = this.previous();
      const right = this.unary();
      expr = new Binary(expr, operator, right);
    }

    return expr;
  }

  /**
   * @return {Expr}
   */
  unary() {
    if (this.match(BANG, MINUS)) {
      const operator = this.previous();
      const right = this.unary();
      return new Unary(operator, right);
    }

    return this.primary();
  }

  /**
   * @return {Expr}
   */
  primary() {
    if (this.match(FALSE)) return new Literal(false);
    if (this.match(TRUE)) return new Literal(true);
    if (this.match(NIL)) return new Literal(null);

    if (this.match(NUMBER, STRING)) {
      return new Literal(this.previous().literal);
    }

    if (this.match(LEFT_PAREN)) {
      const expr = this.expression();
      this.consume(RIGHT_PAREN, "Expect ')' after expression.");
      return new Grouping(expr);
    }

    throw this.error(this.peek(), "Expect expression.");
  }

  /**
   *
   * @param {TokenType} type
   * @param {string} message
   */
  consume(type, message) {
    if (this.check(type)) return this.advance();

    throw this.error(this.peek(), message);
  }

  /**
   *
   * @param {Token} token
   * @param {string} message
   */
  error(token, message) {
    this.reporter.tokenError(token, message);
    return new ParseError();
  }

  synchronize() {
    this.advance();

    while (!this.isAtEnd()) {
      if (this.previous().type == SEMICOLON) return;

      switch (this.peek().type) {
        case CLASS:
        case FUN:
        case VAR:
        case FOR:
        case IF:
        case WHILE:
        case PRINT:
        case RETURN:
          return;
      }

      this.advance();
    }
  }

  /**
   * @param  {...TokenType} types
   */
  match(...types) {
    for (const type of types) {
      if (this.check(type)) {
        this.advance();
        return true;
      }
    }
  }

  /**
   * @param {TokenType} type
   */
  check(type) {
    if (this.isAtEnd()) return false;
    return this.peek().type == type;
  }

  advance() {
    if (!this.isAtEnd()) this.current++;
    return this.previous();
  }

  isAtEnd() {
    return this.peek().type == EOF;
  }

  peek() {
    return this.tokens[this.current];
  }

  previous() {
    return this.tokens[this.current - 1];
  }
}
