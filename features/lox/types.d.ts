import { Token } from "./token";

export interface Scanner {
  scanTokens(): Token[];
}

export interface ErrorReporter {
  error(line: number, err: string);
}
