/** @typedef {import("./token").Token} Token */
/** @typedef {import("./token").TokenType} TokenType */
/** @typedef {import("./types").ErrorReporter} ErrorReporter */

import {
  Expr,
  Binary,
  Grouping,
  Literal,
  Unary,
  Variable,
  Assign,
  Logical,
} from "./expr.js";
import {
  Block,
  Expression,
  IfStmt,
  Print,
  Stmt,
  VarStmt,
  WhileStmt,
} from "./stmt.js";
import {
  AND,
  BANG,
  BANG_EQUAL,
  CLASS,
  ELSE,
  EOF,
  EQUAL,
  EQUAL_EQUAL,
  FALSE,
  FOR,
  FUN,
  GREATER,
  GREATER_EQUAL,
  IDENTIFIER,
  IF,
  LEFT_BRACE,
  LEFT_PAREN,
  LESS,
  LESS_EQUAL,
  MINUS,
  NIL,
  NUMBER,
  OR,
  PLUS,
  PRINT,
  RETURN,
  RIGHT_BRACE,
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
   * @returns {Stmt[]}
   */
  parse() {
    const statements = [];
    while (!this.isAtEnd()) {
      statements.push(this.declaration());
    }

    return statements.filter((s) => !!s);
  }

  /**
   * @returns {Stmt | null}
   */
  declaration() {
    try {
      if (this.match(VAR)) return this.varDeclaration();

      return this.statement();
    } catch (e) {
      this.synchronize();
      return null;
    }
  }

  /**
   * @returns {Stmt}
   */
  statement() {
    if (this.match(FOR)) return this.forStatement();
    if (this.match(PRINT)) return this.printStatement();
    if (this.match(WHILE)) return this.whileStatement();
    if (this.match(LEFT_BRACE)) return new Block(this.block());

    return this.expressionStatement();
  }

  forStatement() {
    this.consume(LEFT_PAREN, "Expect '(' after 'for' statement");

    let initializer;
    if (this.match(SEMICOLON)) {
      initializer = null;
    } else if (this.match(VAR)) {
      initializer = this.varDeclaration();
    } else {
      initializer = this.expressionStatement();
    }

    let condition = null;

    if (!this.check(SEMICOLON)) {
      condition = this.expression();
    }
    this.consume(SEMICOLON, "Expect ';' after loop condition.");

    let increment = null;
    if (!this.check(RIGHT_PAREN)) {
      increment = this.expression();
    }

    this.consume(RIGHT_PAREN, "Expect ')' after for clauses.");

    let body = this.statement();

    if (increment !== null) {
      body = new Block([body, new Expression(increment)]);
    }

    if (condition === null) condition = new Literal(true);
    body = new WhileStmt(condition, body);

    if (initializer !== null) {
      body = new Block([initializer, body]);
    }

    return body;
  }

  ifStatement() {
    this.consume(LEFT_PAREN, "Expect '(' after 'if'");
    const condition = this.expression();
    this.consume(RIGHT_PAREN, "Expect ')' after 'if' condition");

    const thenBranch = this.statement();
    let elseBranch = null;
    if (this.match(ELSE)) {
      elseBranch = this.statement();
    }

    return new IfStmt(condition, thenBranch, elseBranch);
  }

  /**
   * @returns {Stmt}
   */
  printStatement() {
    const value = this.expression();

    this.consume(SEMICOLON, "Expect ';' after value.");

    return new Print(value);
  }

  varDeclaration() {
    const name = this.consume(IDENTIFIER, "Expect variable name.");

    let initializer = null;
    if (this.match(EQUAL)) {
      initializer = this.expression();
    }

    this.consume(SEMICOLON, "Expect ';' after variable declaration.");

    return new VarStmt(name, initializer);
  }

  whileStatement() {
    this.consume(LEFT_PAREN, "Expect '(' after 'while'");

    const condition = this.expression();
    this.consume(RIGHT_PAREN, "Expect ')' after condition");

    const body = this.statement();

    return new WhileStmt(condition, body);
  }

  /**
   * @returns {Stmt}
   */
  expressionStatement() {
    const expr = this.expression();
    this.consume(SEMICOLON, "Expect ';' after value.");

    return new Expression(expr);
  }

  block() {
    const statements = [];

    while (!this.check(RIGHT_BRACE) && !this.isAtEnd()) {
      statements.push(this.declaration());
    }

    this.consume(RIGHT_BRACE, "Expect '}' after block.");
    return statements;
  }

  assignment() {
    const expr = this.or();

    if (this.match(EQUAL)) {
      const equals = this.previous();
      const value = this.assignment();

      if (expr instanceof Variable) {
        const name = expr.name;
        return new Assign(name, value);
      }

      this.error(equals, "Invalid assignment target.");
    }

    return expr;
  }

  or() {
    let expr = this.and();

    while (this.match(OR)) {
      const operator = this.previous();
      const right = this.and();
      expr = new Logical(expr, operator, right);
    }

    return expr;
  }

  and() {
    let expr = this.equality();

    while (this.match(AND)) {
      const operator = this.previous();
      const right = this.equality();
      expr = new Logical(expr, operator, right);
    }

    return expr;
  }

  /**
   * @returns {Expr}
   */
  expression() {
    return this.assignment();
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

    if (this.match(IDENTIFIER)) {
      return new Variable(this.previous());
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
