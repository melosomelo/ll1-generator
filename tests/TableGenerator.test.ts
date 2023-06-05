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
    it("First(X) must contain x when X->x... and x is terminal", () => {
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
    it("First(X) must contain x when X -> x... and X -> y... and both x and y are terminals", () => {
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
    it("First(X) must contain First(Y) when X -> Y...", () => {
      const generator = new ParseTableGenerator({
        startingSymbol: "A",
        productions: [
          ["A", [makeNonTerminal("B"), makeTerminal("a")]],
          ["B", [makeNonTerminal("C"), makeTerminal("b")]],
          ["C", [makeTerminal("c")]],
        ],
      });
      expect(generator.firstSet("A")).toEqual(generator.firstSet("B"));
      expect(generator.firstSet("B")).toEqual(generator.firstSet("C"));
    });
    it("First(X) must contain ε when X -> ε", () => {
      const generator = new ParseTableGenerator({
        startingSymbol: "A",
        productions: [["A", [EMPTY_STRING]]],
      });
      expect(generator.firstSet("A").has(EMPTY_STRING)).toBeTruthy();
    });
    it("First(X) must contain ε when X -> ABC and A,B and C are all nullable", () => {
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
    it("mixture of previous cases", () => {
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
  describe("followSet", () => {
    it("Follow(S) must contain EOI (S is starting symbol)", () => {
      const generator = new ParseTableGenerator({
        startingSymbol: "A",
        productions: [],
      });
      expect(generator.followSet("A").has(EOI)).toBeTruthy();
    });
    it("Follow(A) must contain First(B) (without empty string) when X -> AB", () => {
      const generator = new ParseTableGenerator({
        startingSymbol: "A",
        productions: [
          ["A", [makeNonTerminal("A"), makeNonTerminal("B")]],
          ["B", [EMPTY_STRING]],
          ["B", [makeTerminal("b"), makeNonTerminal("B")]],
        ],
      });
      expect(generator.followSet("A").has("b")).toBeTruthy();
      expect(generator.followSet("A").has(EMPTY_STRING)).toBeFalsy();
    });
    it("Follow(B) must contain Follow(A) when A -> ...B", () => {
      const generator = new ParseTableGenerator({
        startingSymbol: "A",
        productions: [
          ["A", [makeNonTerminal("A"), makeNonTerminal("X")]],
          ["X", [makeTerminal("x")]],
          ["X", [makeTerminal("y")]],
          ["X", [makeTerminal("z")]],
          ["A", [makeTerminal("a"), makeNonTerminal("B")]],
        ],
      });
      expect(generator.followSet("B")).toEqual(generator.followSet("A"));
    });
    it("Follow(B) must contain Follow(A) when A -> ...Bβ and β is nullable", () => {
      const generator = new ParseTableGenerator({
        startingSymbol: "A",
        productions: [
          ["A", [makeNonTerminal("A"), makeNonTerminal("X")]],
          ["X", [makeTerminal("x")]],
          ["X", [makeTerminal("y")]],
          ["X", [makeTerminal("z")]],
          ["C", [EMPTY_STRING]],
          ["C", [makeTerminal("c")]],
          [
            "A",
            [makeTerminal("a"), makeNonTerminal("B"), makeNonTerminal("C")],
          ],
        ],
      });
      expect(generator.followSet("A")).toEqual(generator.followSet("A"));
    });
  });

  describe("generateTable", () => {
    it.each([
      ["empty grammar", { startingSymbol: "A", productions: [] }, {}],
      [
        "grammar with only one epsilon-rule",
        { startingSymbol: "A", productions: [["A", [EMPTY_STRING]]] },
        { A: { [EOI]: [EMPTY_STRING] } },
      ],
      [
        "grammar without epsilon-rules (taken from parsing techniques pg.240)",
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
        {
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
        {
          A: {
            a: [makeTerminal("a"), makeNonTerminal("A")],
            b: [makeNonTerminal("B")],
            c: [makeNonTerminal("B")],
          },
          B: {
            b: [makeTerminal("b"), makeNonTerminal("B")],
            c: [makeTerminal("c")],
          },
        },
      ],
      [
        "grammar without epsilon-rules 3 (taken from Parsing Techniques pg.238)",
        {
          startingSymbol: "S",
          productions: [
            ["S", [makeTerminal("a"), makeNonTerminal("B")]],
            ["B", [makeTerminal("b")]],
            ["B", [makeTerminal("a"), makeNonTerminal("B"), makeTerminal("b")]],
          ],
        },
        {
          S: {
            a: [makeTerminal("a"), makeNonTerminal("B")],
          },
          B: {
            a: [makeTerminal("a"), makeNonTerminal("B"), makeTerminal("b")],
            b: [makeTerminal("b")],
          },
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
        {
          E: {
            id: [makeNonTerminal("T"), makeNonTerminal("E'")],
            "(": [makeNonTerminal("T"), makeNonTerminal("E'")],
          },
          "E'": {
            "+": [
              makeTerminal("+"),
              makeNonTerminal("T"),
              makeNonTerminal("E'"),
            ],
            ")": [EMPTY_STRING],
            [EOI]: [EMPTY_STRING],
          },
          T: {
            id: [makeNonTerminal("F"), makeNonTerminal("T'")],
            "(": [makeNonTerminal("F"), makeNonTerminal("T'")],
          },
          "T'": {
            "+": [EMPTY_STRING],
            "*": [
              makeTerminal("*"),
              makeNonTerminal("F"),
              makeNonTerminal("T'"),
            ],
            ")": [EMPTY_STRING],
            [EOI]: [EMPTY_STRING],
          },
          F: {
            id: [makeTerminal("id")],
            "(": [makeTerminal("("), makeNonTerminal("E"), makeTerminal(")")],
          },
        },
      ],
    ])("parse table for %s", (_, G, expectedTable) => {
      const generator = new ParseTableGenerator(G as CFGrammar);
      expect(generator.generateTable()).toEqual(expectedTable);
    });
  });
});
