/** @typedef {import('./types').Value} Value */
/** @typedef {import('./token.js').Token} Token */

import { RuntimeError } from "./interpreter.js";

export class Environment {
  constructor() {
    /** @type {{[k: string]: Value}} */
    this.values = {};
  }

  /**
   * @param {string} name
   * @param {Value} value
   */
  define(name, value) {
    this.values[name] = value;
  }

  /**
   * @param {Token} name
   */
  get(name) {
    if (name.lexeme in this.values) {
      return this.values[name.lexeme];
    }

    throw new RuntimeError(name, `Undefined variable ${name.lexeme}`);
  }

  /**
   *
   * @param {Token} name
   * @param {Value} value
   * @returns
   */
  assign(name, value) {
    if (name.lexeme in this.values) {
      this.values[name.lexeme] = value;
      return;
    }

    throw new RuntimeError(name, `Undefined variable ${name.lexeme}`);
  }
}
