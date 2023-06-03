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
    it("empty grammar", () => {
      const generator = new ParseTableGenerator({
        startingSymbol: "A",
        productions: [],
      });
      expect(generator.generateTable()).toEqual({});
    });
    it("grammar with a single non epsilon-rule", () => {
      const generator = new ParseTableGenerator({
        startingSymbol: "A",
        productions: [["A", [makeTerminal("a")]]],
      });
      expect(generator.generateTable()).toEqual({
        A: {
          a: [makeTerminal("a")],
        },
      });
    });
    it("grammar without epsilon-rules", () => {
      // Grammar taken from the book Parsing Techniques - A Practical Guide pg.240
      const generator = new ParseTableGenerator({
        startingSymbol: "S",
        productions: [
          ["S", [makeNonTerminal("F"), makeNonTerminal("S")]],
          ["S", [makeNonTerminal("Q")]],
          [
            "S",
            [
              makeTerminal("("),
              makeNonTerminal("S"),
              makeTerminal(")"),
              makeNonTerminal("S"),
            ],
          ],
          ["F", [makeTerminal("!"), makeTerminal("STRING")]],
          ["Q", [makeTerminal("?"), makeTerminal("STRING")]],
        ],
      });
      expect(generator.generateTable()).toEqual({
        S: {
          "!": [makeNonTerminal("F"), makeNonTerminal("S")],
          "?": [makeNonTerminal("Q")],
          "(": [
            makeTerminal("("),
            makeNonTerminal("S"),
            makeTerminal(")"),
            makeNonTerminal("S"),
          ],
        },
        Q: {
          "?": [makeTerminal("?"), makeTerminal("STRING")],
        },
        F: {
          "!": [makeTerminal("!"), makeTerminal("STRING")],
        },
      });
    });
    it("grammar without epsilon-rules 2", () => {
      const generator = new ParseTableGenerator({
        startingSymbol: "A",
        productions: [
          ["A", [makeTerminal("a"), makeNonTerminal("A")]],
          ["A", [makeNonTerminal("B")]],
          ["B", [makeTerminal("b"), makeNonTerminal("B")]],
          ["B", [makeTerminal("c")]],
        ],
      });
      expect(generator.generateTable()).toEqual({
        A: {
          a: [makeTerminal("a"), makeNonTerminal("A")],
          b: [makeNonTerminal("B")],
          c: [makeNonTerminal("B")],
        },
        B: {
          b: [makeTerminal("b"), makeNonTerminal("B")],
          c: [makeTerminal("c")],
        },
      });
    });
    it("grammar without epsilon-rules 3", () => {
      // Taken from Parsing Techniques - A Practical Guade pg.238
      const generator = new ParseTableGenerator({
        startingSymbol: "S",
        productions: [
          ["S", [makeTerminal("a"), makeNonTerminal("B")]],
          ["B", [makeTerminal("b")]],
          ["B", [makeTerminal("a"), makeNonTerminal("B"), makeTerminal("b")]],
        ],
      });
      expect(generator.generateTable()).toEqual({
        S: {
          a: [makeTerminal("a"), makeNonTerminal("B")],
        },
        B: {
          a: [makeTerminal("a"), makeNonTerminal("B"), makeTerminal("b")],
          b: [makeTerminal("b")],
        },
      });
    });
  });
});
