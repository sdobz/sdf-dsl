import {Token} from './token'

export class Lox {
  constructor() {
    this.hadError = false;
  }
  /** @param {string} src  */
  run(src) {
    this.hadError = false;
    const tokens = this.scan(src);
  }

  /**
   * @param {string} src
   * @returns {Token[]}
   */
  scan(src) {}

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
