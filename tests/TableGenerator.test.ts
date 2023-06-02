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
    it("should throw when using EOI unique symbol in rhs of production", () => {
      expect(
        () =>
          new ParseTableGenerator({
            startingSymbol: "A",
            productions: [
              ["A", [EOI]],
              ["A", [makeNonTerminal("A"), makeTerminal("a")]],
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
    it("should calculate properly for grammar with a single rule", () => {
      const generator = new ParseTableGenerator({
        startingSymbol: "A",
        productions: [["A", [makeTerminal("a")]]],
      });
      expect(generator.generateTable()).toEqual({
        A: {
          a: "a",
        },
      });
    });
  });
});
