import { describe, it, expect, beforeEach } from "@jest/globals";
import { EMPTY_STRING, EOI, nonTerminal, terminal } from "../src/symbols";
import buildGrammar from "../src/buildGrammar";
import generateParseTable from "../src/generateTable";

describe("generateParseTable", () => {
  it.each([
    [
      "empty grammar",
      { startingSymbol: "A", productions: [] },
      { A: { [EOI]: null } },
    ],
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
            [terminal("("), nonTerminal("S"), terminal(")"), nonTerminal("S")],
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
          ")": null,
          STRING: null,
          [EOI]: null,
        },
        Q: {
          "?": [terminal("?"), terminal("STRING")],
          "!": null,
          "(": null,
          ")": null,
          [EOI]: null,
          STRING: null,
        },
        F: {
          "!": [terminal("!"), terminal("STRING")],
          "(": null,
          ")": null,
          "?": null,
          STRING: null,
          [EOI]: null,
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
          [EOI]: null,
        },
        B: {
          a: null,
          b: [terminal("b"), nonTerminal("B")],
          c: [terminal("c")],
          [EOI]: null,
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
          b: null,
          [EOI]: null,
        },
        B: {
          a: [terminal("a"), nonTerminal("B"), terminal("b")],
          b: [terminal("b")],
          [EOI]: null,
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
          ")": null,
          "*": null,
          "+": null,
          [EOI]: null,
          id: [nonTerminal("T"), nonTerminal("E'")],
          "(": [nonTerminal("T"), nonTerminal("E'")],
        },
        "E'": {
          "(": null,
          "*": null,
          id: null,
          "+": [terminal("+"), nonTerminal("T"), nonTerminal("E'")],
          ")": [EMPTY_STRING],
          [EOI]: [EMPTY_STRING],
        },
        T: {
          id: [nonTerminal("F"), nonTerminal("T'")],
          "(": [nonTerminal("F"), nonTerminal("T'")],
          ")": null,
          "*": null,
          "+": null,
          [EOI]: null,
        },
        "T'": {
          "+": [EMPTY_STRING],
          "*": [terminal("*"), nonTerminal("F"), nonTerminal("T'")],
          ")": [EMPTY_STRING],
          [EOI]: [EMPTY_STRING],
          "(": null,
          id: null,
        },
        F: {
          ")": null,
          "*": null,
          "+": null,
          [EOI]: null,
          id: [terminal("id")],
          "(": [terminal("("), nonTerminal("E"), terminal(")")],
        },
      },
    ],
  ])("parse table for %s", (_, G, expectedTable) => {
    const grammarBuilder = buildGrammar().setStartingSymbol(G.startingSymbol);
    G.productions.forEach((rule) =>
      grammarBuilder.addProduction(rule[0] as string, rule[1] as RHSSymbol[])
    );
    expect(generateParseTable(grammarBuilder.build())).toEqual(expectedTable);
  });
});