import { RuntimeError } from "./interpreter";
import { Token } from "./token";

export interface Scanner {
  scanTokens(): Token[];
}

export interface ErrorReporter {
  error(line: number, err: string);
  tokenError(token: Token, message: string);
  runtimeError(error: RuntimeError);
}

export interface IO {
  print(str: string);
}

export interface Environment {
  get(name: Token);
  define(name: string, value: Value);
}

export type Value = string | number | boolean | null;
