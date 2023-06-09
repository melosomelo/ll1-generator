import { describe, it, expect } from "@jest/globals";
import parse from "../src/parse";
import { nonTerminal } from "../src/symbols";
import * as exampleGrammars from "./exampleGrammars";
import LL1ParseError from "../src/errors/LL1ParseError";

describe("parse", () => {
  it("grammar allows empty input string", () => {
    expect(parse([], exampleGrammars.emptyLanguageGrammar)).toEqual({
      value: nonTerminal("A"),
      children: [],
    });
  });

  it("should throw with unexpected token", () => {
    expect(() =>
      parse(["id", "id"], exampleGrammars.arithmeticExpressionGrammar)
    ).toThrow(LL1ParseError);
  });

  it("should throw with unexpected end of input", () => {
    expect(() =>
      parse(["id", "+"], exampleGrammars.arithmeticExpressionGrammar)
    ).toThrow(LL1ParseError);
  });
});
