/** @typedef {import("./expr.js").Expr} Expr */

export class AstPrinter {
  /**
   * @param {Expr} expr
   * @returns {string}
   */
  print(expr) {
    return expr.accept(this);
  }

  visitBinaryExpr(expr) {
    return this.parenthesize(expr.operator.lexeme, expr.left, expr.right);
  }

  visitGroupingExpr(expr) {
    return this.parenthesize("group", expr.expression);
  }

  visitLiteralExpr(expr) {
    if (expr.value === null) return "nil";
    return expr.value.toString();
  }

  visitUnaryExpr(expr) {
    return this.parenthesize(expr.operator.lexeme, expr.right);
  }

  parenthesize(name, ...fields) {
    return `(${name} ${fields.map((field) => field.accept(this)).join(" ")})`;
  }
}
