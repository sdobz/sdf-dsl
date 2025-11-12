import { Scanner } from "./scanner.js";
import { Token } from "./token.js";

export class Lox {
  constructor() {
    this.hadError = false;
  }
  /** @param {string} src  */
  run(src) {
    this.hadError = false;
    const tokens = this.scan(src);

    console.log(tokens);
  }

  /**
   * @param {string} src
   * @returns {Token[]}
   */
  scan(src) {
    const scanner = new Scanner(src, this);
    scanner.scanTokens();
    return scanner.tokens;
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
}
