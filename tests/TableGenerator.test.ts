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
    it("error when using EOI unique symbol in rhs of production", () => {
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
  describe("firstSet", () => {
    it("grammar with only terminals at rhs", () => {
      const generator = new ParseTableGenerator({
        startingSymbol: "A",
        productions: [
          ["A", [makeTerminal("a")]],
          ["B", [makeTerminal("b")]],
          ["C", [makeTerminal("c")]],
        ],
      });
      expect(generator.firstSet("A").has("a")).toBeTruthy();
      expect(generator.firstSet("B").has("b")).toBeTruthy();
      expect(generator.firstSet("C").has("c")).toBeTruthy();
    });
    it("grammar with multiple productions that start with terminals", () => {
      const generator = new ParseTableGenerator({
        startingSymbol: "A",
        productions: [
          ["A", [makeTerminal("a")]],
          ["B", [makeTerminal("b")]],
          ["C", [makeTerminal("c")]],
          ["A", [makeTerminal("b")]],
          ["C", [makeTerminal("a")]],
        ],
      });
      expect(generator.firstSet("A").has("a")).toBeTruthy();
      expect(generator.firstSet("A").has("b")).toBeTruthy();
      expect(generator.firstSet("B").has("b")).toBeTruthy();
      expect(generator.firstSet("C").has("c")).toBeTruthy();
      expect(generator.firstSet("C").has("a")).toBeTruthy();
    });
    it("productions of non-terminal X starting with another non-terminal Y", () => {
      const generator = new ParseTableGenerator({
        startingSymbol: "A",
        productions: [
          ["A", [makeNonTerminal("B"), makeTerminal("a")]],
          ["B", [makeNonTerminal("C"), makeTerminal("b")]],
          ["C", [makeTerminal("c")]],
        ],
      });
      expect(generator.firstSet("A").has("c")).toBeTruthy();
      expect(generator.firstSet("B").has("c")).toBeTruthy();
      expect(generator.firstSet("B").has("c")).toBeTruthy();
    });
    it("nonterminal with an epsilon-rule", () => {
      const generator = new ParseTableGenerator({
        startingSymbol: "A",
        productions: [["A", [EMPTY_STRING]]],
      });
      expect(generator.firstSet("A").has(EMPTY_STRING)).toBeTruthy();
    });
    it("nonterminal with nullable rhs with only nonterminals", () => {
      const generator = new ParseTableGenerator({
        startingSymbol: "A",
        productions: [
          ["A", [EMPTY_STRING]],
          [
            "A",
            [makeNonTerminal("B"), makeNonTerminal("C"), makeNonTerminal("D")],
          ],
          ["B", [EMPTY_STRING]],
          ["C", [EMPTY_STRING]],
          ["D", [EMPTY_STRING]],
        ],
      });
      expect(generator.firstSet("A").has(EMPTY_STRING)).toBeTruthy();
    });
    it("non-terminal that's not defined in any production", () => {
      const generator = new ParseTableGenerator({
        startingSymbol: "A",
        productions: [["A", [makeTerminal("a")]]],
      });
      expect(generator.firstSet("B").size).toEqual(0);
    });
    it("mixed grammar", () => {
      const generator = new ParseTableGenerator({
        startingSymbol: "A",
        productions: [
          ["A", [EMPTY_STRING]],
          [
            "A",
            [makeTerminal("a"), makeNonTerminal("A"), makeNonTerminal("B")],
          ],
          ["B", [makeTerminal("b"), makeNonTerminal("C")]],
          ["C", [makeTerminal("c")]],
          ["C", [EMPTY_STRING]],
        ],
      });
      expect(generator.firstSet("A").has(EMPTY_STRING)).toBeTruthy();
      expect(generator.firstSet("A").has("a")).toBeTruthy();
      expect(generator.firstSet("B").has("b")).toBeTruthy();
      expect(generator.firstSet("C").has("c")).toBeTruthy();
      expect(generator.firstSet("C").has(EMPTY_STRING)).toBeTruthy();
    });
  });
  const testCases: Array<[string, CFGrammar]> = [
    ["empty grammar", { startingSymbol: "A", productions: [] }],
    [
      "grammar with only one epsilon-rule",
      { startingSymbol: "A", productions: [["A", [makeTerminal("a")]]] },
    ],
    [
      "grammar without epsilon-rules (taken from parsing techniques pg.238)",
      {
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
      },
    ],
    [
      "grammar without epsilon-rules 2",
      {
        startingSymbol: "A",
        productions: [
          ["A", [makeTerminal("a"), makeNonTerminal("A")]],
          ["A", [makeNonTerminal("B")]],
          ["B", [makeTerminal("b"), makeNonTerminal("B")]],
          ["B", [makeTerminal("c")]],
        ],
      },
    ],
    [
      "grammar without epsilon-rules 3 (taken from Parsing Techniques pg.240)",
      {
        startingSymbol: "S",
        productions: [
          ["S", [makeTerminal("a"), makeNonTerminal("B")]],
          ["B", [makeTerminal("b")]],
          ["B", [makeTerminal("a"), makeNonTerminal("B"), makeTerminal("b")]],
        ],
      },
    ],
    [
      "arithmetic expression grammar taken from the 'Dragon Book' pg.225",
      {
        startingSymbol: "E",
        productions: [
          ["E", [makeNonTerminal("T"), makeNonTerminal("E'")]],
          [
            "E'",
            [makeTerminal("+"), makeNonTerminal("T"), makeNonTerminal("E'")],
          ],
          ["E'", [EMPTY_STRING]],
          ["T", [makeNonTerminal("F"), makeNonTerminal("T'")]],
          [
            "T'",
            [makeTerminal("*"), makeNonTerminal("F"), makeNonTerminal("T'")],
          ],
          ["T'", [EMPTY_STRING]],
          ["F", [makeTerminal("("), makeNonTerminal("E"), makeTerminal(")")]],
          ["F", [makeTerminal("id")]],
        ],
      },
    ],
  ];
  describe("firstSet", () => {});
  describe.skip("generateTable", () => {
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
    it("full ll1 grammar", () => {
      // Grammar taken from the "Dragon Book", pg. 225
      const generator = new ParseTableGenerator({
        startingSymbol: "E",
        productions: [
          ["E", [makeNonTerminal("T"), makeNonTerminal("E'")]],
          [
            "E'",
            [makeTerminal("+"), makeNonTerminal("T"), makeNonTerminal("E'")],
          ],
          ["E'", [EMPTY_STRING]],
          ["T", [makeNonTerminal("F"), makeNonTerminal("T'")]],
          [
            "T'",
            [makeTerminal("*"), makeNonTerminal("F"), makeNonTerminal("T'")],
          ],
          ["T'", [EMPTY_STRING]],
          ["F", [makeTerminal("("), makeNonTerminal("E"), makeTerminal(")")]],
          ["F", [makeTerminal("id")]],
        ],
      });
      expect(generator.generateTable()).toEqual({
        E: {
          id: [makeNonTerminal("T"), makeNonTerminal("E'")],
          "(": [makeNonTerminal("T"), makeNonTerminal("E'")],
        },
        "E'": {
          "+": [makeTerminal("+"), makeNonTerminal("T"), makeNonTerminal("E'")],
          ")": [EMPTY_STRING],
          [EOI]: [EMPTY_STRING],
        },
        T: {
          id: [makeNonTerminal("F"), makeNonTerminal("T'")],
          "(": [makeNonTerminal("F"), makeNonTerminal("T'")],
        },
        "T'": {
          "+": [EMPTY_STRING],
          "*": [makeTerminal("*"), makeNonTerminal("F"), makeNonTerminal("T'")],
          ")": [EMPTY_STRING],
          [EOI]: [EMPTY_STRING],
        },
        F: {
          id: [makeTerminal("id")],
          "(": [makeTerminal("("), makeNonTerminal("E"), makeTerminal(")")],
        },
      });
    });
  });
});
