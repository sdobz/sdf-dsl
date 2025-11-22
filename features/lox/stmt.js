

/**
 * @typedef {object} Visitor
 * @property {(block: Block) => any} visitBlockStmt
 * @property {(expression: Expression) => any} visitExpressionStmt
 * @property {(ifs: Ifs) => any} visitIfsStmt
 * @property {(print: Print) => any} visitPrintStmt
 * @property {(vari: Vari) => any} visitVariStmt
 */

export class Stmt {
  /**
   * @param {Visitor} visitor
   * @returns {any}
   */
  accept(visitor) {}
}


export class Block extends Stmt {
  constructor(statements) {
    super();
    this.statements = statements;
  }

  accept(visitor) {
    return visitor.visitBlockStmt(this);
  }
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

export class Ifs extends Stmt {
  constructor(condition, thenBranch, elseBranch) {
    super();
    this.condition = condition;
    this.thenBranch = thenBranch;
    this.elseBranch = elseBranch;
  }

  accept(visitor) {
    return visitor.visitIfsStmt(this);
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

export class Vari extends Stmt {
  constructor(name, initializer) {
    super();
    this.name = name;
    this.initializer = initializer;
  }

  accept(visitor) {
    return visitor.visitVariStmt(this);
  }
}

