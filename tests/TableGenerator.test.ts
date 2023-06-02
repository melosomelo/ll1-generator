import { describe, it, expect, beforeEach } from "@jest/globals";
import ParseTableGenerator from "../src/TableGenerator";
import { EMPTY_STRING, EOI } from "../src/symbols";

function makeTerminal(value: string): GrammarSymbol {
  return {
    type: "TERMINAL",
    value,
  };
}

function makeNonTerminal(value: string): GrammarSymbol {
  return {
    type: "NONTERMINAL",
    value,
  };
}

describe("ParseTableGenerator", () => {
  describe("constructor", () => {
    it("should thrown when grammar has terminal for lhs of production", () => {
      expect(
        () =>
          new ParseTableGenerator({
            startingSymbol: "A",
            productions: [
              [makeNonTerminal("A"), [makeTerminal("a")]],
              [makeTerminal("a"), [makeTerminal("a"), makeTerminal("a")]],
            ],
          })
      ).toThrow();
    });
    it("should throw when using EOI unique symbol in rhs of production", () => {
      expect(
        () =>
          new ParseTableGenerator({
            startingSymbol: "A",
            productions: [
              [makeNonTerminal("A"), [EOI]],
              [makeNonTerminal("A"), [makeNonTerminal("A"), makeTerminal("a")]],
            ],
          })
      ).toThrow();
    });
  });
  describe("generateTable", () => {
    it("should return empty table when grammar has no productions", () => {
      const generator = new ParseTableGenerator({
        startingSymbol: "A",
        productions: [],
      });
      expect(generator.generateTable()).toEqual({});
    });
  });
});
