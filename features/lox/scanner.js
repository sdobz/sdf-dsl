import {
  LEFT_PAREN,
  RIGHT_PAREN,
  LEFT_BRACE,
  RIGHT_BRACE,
  COMMA,
  DOT,
  MINUS,
  PLUS,
  SEMICOLON,
  STAR,
  EOF,
  Token,
  BANG,
  BANG_EQUAL,
  EQUAL,
  EQUAL_EQUAL,
  GREATER_EQUAL,
  LESS,
  LESS_EQUAL,
  GREATER,
  SLASH,
  STRING,
  NUMBER,
  IDENTIFIER,
  AND,
  CLASS,
  ELSE,
  FALSE,
  FOR,
  FUN,
  IF,
  NIL,
  OR,
  PRINT,
  RETURN,
  SUPER,
  THIS,
  TRUE,
  VAR,
  WHILE,
} from "./token";

/** @import {Lox} from './lox' */

const RESERVED = {
  and: AND,
  class: CLASS,
  else: ELSE,
  false: FALSE,
  for: FOR,
  fun: FUN,
  if: IF,
  nil: NIL,
  or: OR,
  print: PRINT,
  return: RETURN,
  super: SUPER,
  this: THIS,
  true: TRUE,
  var: VAR,
  while: WHILE,
};

export class Scanner {
  /**
   * @param {string} src
   * @param {Lox} lox
   */
  constructor(src, lox) {
    this.src = src;
    this.lox = lox;
    this.start = 0;
    this.current = 0;
    this.line = 1;
    /** @type {Token[]} */
    this.tokens = [];
  }

  scanTokens() {
    while (!this.isAtEnd()) {
      // We are at the beginning of the next lexeme.
      this.start = this.current;
      this.scanToken();
    }

    this.tokens.push(new Token(EOF, "", null, this.line));
    return this.tokens;
  }

  scanToken() {
    const c = this.advance();
    switch (c) {
      case "(":
        this.addToken(LEFT_PAREN);
        break;
      case ")":
        this.addToken(RIGHT_PAREN);
        break;
      case "{":
        this.addToken(LEFT_BRACE);
        break;
      case "}":
        this.addToken(RIGHT_BRACE);
        break;
      case ",":
        this.addToken(COMMA);
        break;
      case ".":
        this.addToken(DOT);
        break;
      case "-":
        this.addToken(MINUS);
        break;
      case "+":
        this.addToken(PLUS);
        break;
      case ";":
        this.addToken(SEMICOLON);
        break;
      case "*":
        this.addToken(STAR);
        break;
      case "!":
        this.addToken(this.match("=") ? BANG_EQUAL : BANG);
        break;
      case "=":
        this.addToken(this.match("=") ? EQUAL_EQUAL : EQUAL);
        break;
      case "<":
        this.addToken(this.match("=") ? LESS_EQUAL : LESS);
        break;
      case ">":
        this.addToken(this.match("=") ? GREATER_EQUAL : GREATER);
        break;

      case "/":
        if (this.match("/")) {
          // A comment goes until the end of the line.
          while (this.peek() != "\n" && !this.isAtEnd()) this.advance();
        } else {
          this.addToken(SLASH);
        }
        break;
      case " ":
      case "\r":
      case "\t":
        // Ignore whitespace.
        break;

      case "\n":
        this.line++;
        break;

      case '"':
        this.string();
        break;

      default:
        if (this.isDigit(c)) {
          this.number();
        } else if (this.isAlpha(c)) {
          this.identifier();
        } else {
          this.lox.error(this.line, "Unexpected character.");
        }
        break;
    }
  }

  advance() {
    return this.src.charAt(this.current++);
  }

  /** @param {string} expected  */
  match(expected) {
    if (this.isAtEnd()) return false;
    if (this.src.charAt(this.current) != expected) return false;

    this.current++;
    return true;
  }

  peek() {
    if (this.isAtEnd()) return "\0";
    return this.src.charAt(this.current);
  }

  peekNext() {
    if (this.current + 1 >= this.src.length) return "\0";
    return this.src.charAt(this.current + 1);
  }

  string() {
    while (this.peek() != '"' && !this.isAtEnd()) {
      if (this.peek() == "\n") this.line++;
      this.advance();
    }

    if (this.isAtEnd()) {
      this.lox.error(this.line, "Unterminated string.");
      return;
    }

    // The closing ".
    this.advance();

    // Trim the surrounding quotes.
    const value = this.src.substring(this.start + 1, this.current - 1);
    this.addToken(STRING, value);
  }

  number() {
    while (this.isDigit(this.peek())) this.advance();

    if (this.peek() == "." && this.isDigit(this.peekNext())) {
      this.advance();

      while (this.isDigit(this.peek())) this.advance();
    }

    this.addToken(
      NUMBER,
      parseFloat(this.src.substring(this.start, this.current))
    );
  }

  identifier() {
    while (this.isAlphaNumeric(this.peek())) this.advance();

    const text = this.src.substring(this.start, this.current);
    let type = RESERVED[text];
    if (!type) type = IDENTIFIER;
    this.addToken(type);
  }

  /**
   *
   * @param {number} type
   * @param {Object} literal
   */
  addToken(type, literal) {
    const text = this.src.substring(this.start, this.current);
    this.tokens.push(new Token(type, text, literal, this.line));
  }

  isAtEnd() {
    return this.current >= this.src.length;
  }

  /**
   * @param {string} c
   */
  isDigit(c) {
    return c >= "0" && c <= "9";
  }

  /**
   * @param {string} c
   */
  isAlpha(c) {
    return (c >= "a" && c <= "z") || (c >= "A" && c <= "Z") || c == "_";
  }

  /**
   * @param {string} c
   */
  isAlphaNumeric(c) {
    return this.isAlpha(c) || this.isDigit(c);
  }
}
