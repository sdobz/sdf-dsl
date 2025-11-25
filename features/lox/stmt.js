/**
 * @typedef {object} Visitor
 * @property {(block: Block) => any} visitBlockStmt
 * @property {(expression: Expression) => any} visitExpressionStmt
 * @property {(ifstmt: IfStmt) => any} visitIfStmt
 * @property {(print: Print) => any} visitPrintStmt
 * @property {(varstmt: VarStmt) => any} visitVarStmt
 * @property {(whilestmt: WhileStmt) => any} visitWhileStmt
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

export class IfStmt extends Stmt {
  constructor(condition, thenBranch, elseBranch) {
    super();
    this.condition = condition;
    this.thenBranch = thenBranch;
    this.elseBranch = elseBranch;
  }

  accept(visitor) {
    return visitor.visitIfStmt(this);
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

export class VarStmt extends Stmt {
  constructor(name, initializer) {
    super();
    this.name = name;
    this.initializer = initializer;
  }

  accept(visitor) {
    return visitor.visitVarStmt(this);
  }
}

export class WhileStmt extends Stmt {
  constructor(condition, body) {
    super();
    this.condition = condition;
    this.body = body;
  }

  accept(visitor) {
    return visitor.visitWhileStmt(this);
  }
}
