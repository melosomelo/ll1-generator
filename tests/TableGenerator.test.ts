import { describe, it, expect, beforeEach } from "@jest/globals";
import { EMPTY_STRING, EOI, terminal, nonTerminal } from "../src/symbols";
import ParseTableGenerator from "../src/tableGenerator";
import CFGrammarBuilder from "../src/grammarBuilder";

describe("ParseTableGenerator", () => {
  describe("constructor", () => {
    it("error when using EOI unique symbol in rhs of production", () => {
      expect(
        () =>
          new ParseTableGenerator(
            new CFGrammarBuilder()
              .setStartingSymbol("A")
              .addProduction("A", [EOI])
              .addProduction("A", [nonTerminal("A"), terminal("a")])
              .build()
          )
      ).toThrow();
    });
  });
  describe("firstSet", () => {
    it("First(X) must contain x when X->x... and x is terminal", () => {
      const generator = new ParseTableGenerator(
        new CFGrammarBuilder()
          .setStartingSymbol("A")
          .addProduction("A", [terminal("a")])
          .addProduction("B", [terminal("b")])
          .addProduction("C", [terminal("c")])
          .build()
      );
      expect(generator.firstSet("A").has("a")).toBeTruthy();
      expect(generator.firstSet("B").has("b")).toBeTruthy();
      expect(generator.firstSet("C").has("c")).toBeTruthy();
    });
    it("First(X) must contain x when X -> x... and X -> y... and both x and y are terminals", () => {
      const generator = new ParseTableGenerator(
        new CFGrammarBuilder()
          .setStartingSymbol("A")
          .addProduction("A", [terminal("a")])
          .addProduction("B", [terminal("b")])
          .addProduction("C", [terminal("c")])
          .addProduction("A", [terminal("b")])
          .addProduction("C", [terminal("a")])
          .build()
      );
      expect(generator.firstSet("A").has("a")).toBeTruthy();
      expect(generator.firstSet("A").has("b")).toBeTruthy();
      expect(generator.firstSet("B").has("b")).toBeTruthy();
      expect(generator.firstSet("C").has("c")).toBeTruthy();
      expect(generator.firstSet("C").has("a")).toBeTruthy();
    });
    it("First(X) must contain First(Y) when X -> Y...", () => {
      const generator = new ParseTableGenerator(
        new CFGrammarBuilder()
          .setStartingSymbol("A")
          .addProduction("A", [nonTerminal("B"), terminal("a")])
          .addProduction("B", [nonTerminal("C"), terminal("b")])
          .addProduction("C", [terminal("c")])
          .build()
      );
      expect(generator.firstSet("A")).toEqual(generator.firstSet("B"));
      expect(generator.firstSet("B")).toEqual(generator.firstSet("C"));
    });
    it("First(X) must contain ε when X -> ε", () => {
      const generator = new ParseTableGenerator(
        new CFGrammarBuilder()
          .addProduction("A", [EMPTY_STRING])
          .setStartingSymbol("A")
          .build()
      );
      expect(generator.firstSet("A").has(EMPTY_STRING)).toBeTruthy();
    });
    it("First(X) must contain ε when X -> ABC and A,B and C are all nullable", () => {
      const generator = new ParseTableGenerator(
        new CFGrammarBuilder()
          .setStartingSymbol("A")
          .addProduction("A", [EMPTY_STRING])
          .addProduction("B", [
            nonTerminal("B"),
            nonTerminal("C"),
            nonTerminal("D"),
          ])
          .addProduction("B", [EMPTY_STRING])
          .addProduction("C", [EMPTY_STRING])
          .addProduction("D", [EMPTY_STRING])
          .build()
      );
      expect(generator.firstSet("A").has(EMPTY_STRING)).toBeTruthy();
    });
    it("mixture of previous cases", () => {
      const generator = new ParseTableGenerator(
        new CFGrammarBuilder()
          .setStartingSymbol("A")
          .addProduction("A", [EMPTY_STRING])
          .addProduction("A", [
            terminal("a"),
            nonTerminal("A"),
            nonTerminal("B"),
          ])
          .addProduction("B", [terminal("b"), nonTerminal("C")])
          .addProduction("C", [terminal("c")])
          .addProduction("C", [EMPTY_STRING])
          .build()
      );
      expect(generator.firstSet("A").has(EMPTY_STRING)).toBeTruthy();
      expect(generator.firstSet("A").has("a")).toBeTruthy();
      expect(generator.firstSet("B").has("b")).toBeTruthy();
      expect(generator.firstSet("C").has("c")).toBeTruthy();
      expect(generator.firstSet("C").has(EMPTY_STRING)).toBeTruthy();
    });
  });
  describe("followSet", () => {
    it("Follow(S) must contain EOI (S is starting symbol)", () => {
      const generator = new ParseTableGenerator(
        new CFGrammarBuilder().setStartingSymbol("A").build()
      );
      expect(generator.followSet("A").has(EOI)).toBeTruthy();
    });
    it("Follow(A) must contain First(B) (without empty string) when X -> AB", () => {
      const generator = new ParseTableGenerator(
        new CFGrammarBuilder()
          .setStartingSymbol("A")
          .addProduction("A", [nonTerminal("A"), nonTerminal("B")])
          .addProduction("B", [EMPTY_STRING])
          .addProduction("B", [terminal("b"), nonTerminal("B")])
          .build()
      );
      expect(generator.followSet("A").has("b")).toBeTruthy();
      expect(generator.followSet("A").has(EMPTY_STRING)).toBeFalsy();
    });
    it("Follow(B) must contain Follow(A) when A -> ...B", () => {
      const generator = new ParseTableGenerator(
        new CFGrammarBuilder()
          .setStartingSymbol("A")
          .addProduction("A", [nonTerminal("A"), nonTerminal("X")])
          .addProduction("X", [terminal("x")])
          .addProduction("X", [terminal("y")])
          .addProduction("X", [terminal("z")])
          .addProduction("A", [terminal("a"), nonTerminal("B")])
          .build()
      );
      expect(generator.followSet("B")).toEqual(generator.followSet("A"));
    });
    it("Follow(B) must contain Follow(A) when A -> ...Bβ and β is nullable", () => {
      const generator = new ParseTableGenerator(
        new CFGrammarBuilder()
          .setStartingSymbol("A")
          .addProduction("A", [nonTerminal("A"), nonTerminal("X")])
          .addProduction("X", [terminal("x")])
          .addProduction("X", [terminal("y")])
          .addProduction("X", [terminal("z")])
          .addProduction("C", [EMPTY_STRING])
          .addProduction("C", [terminal("c")])
          .addProduction("A", [
            terminal("a"),
            nonTerminal("B"),
            nonTerminal("C"),
          ])
          .build()
      );
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
            ["S", [nonTerminal("F"), nonTerminal("S")]],
            ["S", [nonTerminal("Q")]],
            [
              "S",
              [
                terminal("("),
                nonTerminal("S"),
                terminal(")"),
                nonTerminal("S"),
              ],
            ],
            ["F", [terminal("!"), terminal("STRING")]],
            ["Q", [terminal("?"), terminal("STRING")]],
          ],
        },
        {
          S: {
            "!": [nonTerminal("F"), nonTerminal("S")],
            "?": [nonTerminal("Q")],
            "(": [
              terminal("("),
              nonTerminal("S"),
              terminal(")"),
              nonTerminal("S"),
            ],
          },
          Q: {
            "?": [terminal("?"), terminal("STRING")],
          },
          F: {
            "!": [terminal("!"), terminal("STRING")],
          },
        },
      ],
      [
        "grammar without epsilon-rules 2",
        {
          startingSymbol: "A",
          productions: [
            ["A", [terminal("a"), nonTerminal("A")]],
            ["A", [nonTerminal("B")]],
            ["B", [terminal("b"), nonTerminal("B")]],
            ["B", [terminal("c")]],
          ],
        },
        {
          A: {
            a: [terminal("a"), nonTerminal("A")],
            b: [nonTerminal("B")],
            c: [nonTerminal("B")],
          },
          B: {
            b: [terminal("b"), nonTerminal("B")],
            c: [terminal("c")],
          },
        },
      ],
      [
        "grammar without epsilon-rules 3 (taken from Parsing Techniques pg.238)",
        {
          startingSymbol: "S",
          productions: [
            ["S", [terminal("a"), nonTerminal("B")]],
            ["B", [terminal("b")]],
            ["B", [terminal("a"), nonTerminal("B"), terminal("b")]],
          ],
        },
        {
          S: {
            a: [terminal("a"), nonTerminal("B")],
          },
          B: {
            a: [terminal("a"), nonTerminal("B"), terminal("b")],
            b: [terminal("b")],
          },
        },
      ],
      [
        "arithmetic expression grammar taken from the 'Dragon Book' pg.225",
        {
          startingSymbol: "E",
          productions: [
            ["E", [nonTerminal("T"), nonTerminal("E'")]],
            ["E'", [terminal("+"), nonTerminal("T"), nonTerminal("E'")]],
            ["E'", [EMPTY_STRING]],
            ["T", [nonTerminal("F"), nonTerminal("T'")]],
            ["T'", [terminal("*"), nonTerminal("F"), nonTerminal("T'")]],
            ["T'", [EMPTY_STRING]],
            ["F", [terminal("("), nonTerminal("E"), terminal(")")]],
            ["F", [terminal("id")]],
          ],
        },
        {
          E: {
            id: [nonTerminal("T"), nonTerminal("E'")],
            "(": [nonTerminal("T"), nonTerminal("E'")],
          },
          "E'": {
            "+": [terminal("+"), nonTerminal("T"), nonTerminal("E'")],
            ")": [EMPTY_STRING],
            [EOI]: [EMPTY_STRING],
          },
          T: {
            id: [nonTerminal("F"), nonTerminal("T'")],
            "(": [nonTerminal("F"), nonTerminal("T'")],
          },
          "T'": {
            "+": [EMPTY_STRING],
            "*": [terminal("*"), nonTerminal("F"), nonTerminal("T'")],
            ")": [EMPTY_STRING],
            [EOI]: [EMPTY_STRING],
          },
          F: {
            id: [terminal("id")],
            "(": [terminal("("), nonTerminal("E"), terminal(")")],
          },
        },
      ],
    ])("parse table for %s", (_, G, expectedTable) => {
      const grammarBuilder = new CFGrammarBuilder().setStartingSymbol(
        G.startingSymbol
      );
      G.productions.forEach((rule) =>
        grammarBuilder.addProduction(rule[0] as string, rule[1] as RHSSymbol[])
      );
      const generator = new ParseTableGenerator(grammarBuilder.build());
      expect(generator.generateTable()).toEqual(expectedTable);
    });
  });
});
