import { Environment } from "./environment.js";
import { Interpreter, RuntimeError } from "./interpreter.js";
import { Parser } from "./parser.js";
import { Scanner } from "./scanner.js";
import { EOF, Token } from "./token.js";

export class Lox {
  constructor() {
    this.hadError = false;
    this.hadRuntimeError = false;
    this.environment = new Environment();
  }

  /** @param {string} src  */
  run(src) {
    this.hadError = false;
    const scanner = new Scanner(src, this);
    const tokens = scanner.scanTokens();

    const parser = new Parser(tokens, this);
    const statements = parser.parse();

    if (this.hadError || !statements) return;

    const interpreter = new Interpreter(this, this, this.environment);

    console.log(interpreter.interpret(statements));
  }

  /**
   * @param {string} str
   */
  print(str) {
    console.log(str);
  }

  /**
   * @param {number} line
   * @param {string} msg
   */
  error(line, msg) {
    this.report(line, "", msg);
  }

  /**
   * @param {number} line
   * @param {string} where
   * @param {string} msg
   */
  report(line, where, msg) {
    console.error(`[line ${line}] Error${where}: ${msg}`);
    this.hadError = true;
  }

  /**
   *
   * @param {Token} token
   * @param {string} message
   */
  tokenError(token, message) {
    if (token.type == EOF) {
      this.report(token.line, " at end", message);
    } else {
      this.report(token.line, " at '" + token.lexeme + "'", message);
    }
  }

  /**
   *
   * @param {RuntimeError} error
   */
  runtimeError(error) {
    console.error(error.message + "\n[line " + error.token.line + "]");
    this.hadRuntimeError = true;
  }
}
