

/**
 * @typedef {object} Visitor
 * @property {(expression: Expression) => any} visitExpressionStmt
 * @property {(print: Print) => any} visitPrintStmt
 */

export class Stmt {
  /**
   * @param {Visitor} visitor
   * @returns {any}
   */
  accept(visitor) {}
}


export class Expression extends Stmt {
  constructor(expression) {
    super();
    this.expression = expression;
  }

  accept(visitor) {
    return visitor.visitExpressionStmt(this);
  }
}

export class Print extends Stmt {
  constructor(expression) {
    super();
    this.expression = expression;
  }

  accept(visitor) {
    return visitor.visitPrintStmt(this);
  }
}

