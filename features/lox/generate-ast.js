function generateExpr() {
  return defineAst("Expr", [
    "Assign   : name, value",
    "Binary   : left, operator,  right",
    "Grouping : expression",
    "Literal  : value",
    "Unary    : operator, right",
    "Variable : name",
  ]);
}

function generateStmt() {
  return defineAst("Stmt", [
    "Expression : expression",
    "Print      : expression",
    "Vari       : name, initializer",
  ]);
}

function defineAst(baseName, types) {
  const typeDefs = types.map((type) => {
    const className = type.split(":")[0].trim();
    const fieldList = type
      .split(":")[1]
      .trim()
      .split(",")
      .map((field) => field.trim());
    return defineType(baseName, className, fieldList);
  });

  return `
${defineVisitor(baseName, types)}

export class ${baseName} {
  /**
   * @param {Visitor} visitor
   * @returns {any}
   */
  accept(visitor) {}
}

${typeDefs.join("\n")}
`;
}

function defineVisitor(baseName, types) {
  const fieldDefs = types.map((type) => {
    const className = type.split(":")[0].trim();
    return ` * @property {(${className.toLowerCase()}: ${className}) => any} visit${className}${baseName}`;
  });

  return `
/**
 * @typedef {object} Visitor
${fieldDefs.join("\n")}
 */`;
}

function defineType(baseName, className, fieldList) {
  return `
export class ${className} extends ${baseName} {
  constructor(${fieldList.join(", ")}) {
    super();
${fieldList.map((field) => `    this.${field} = ${field};`).join("\n")}
  }

  accept(visitor) {
    return visitor.visit${className}${baseName}(this);
  }
}`;
}
