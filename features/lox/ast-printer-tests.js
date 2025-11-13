import { AstPrinter } from "./ast-printer.js";
import { Binary, Unary, Literal, Grouping } from "./ast.js";
import { runTests } from "./test.js";
import { Token, MINUS, STAR } from "./token.js";

const allTests = [testPrintsExpression];

runTests(allTests);

function testPrintsExpression() {
  const expression = new Binary(
    new Unary(new Token(MINUS, "-", null, 1), new Literal(123)),
    new Token(STAR, "*", null, 1),
    new Grouping(new Literal(45.67))
  );

  const printedAst = new AstPrinter().print(expression);
  console.log(printedAst)
  return printedAst === "(* (- 123) (group 45.67))";
}
