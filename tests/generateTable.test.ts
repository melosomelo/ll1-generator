import { describe, it, expect } from "@jest/globals";
import { EMPTY_STRING, END_OF_INPUT } from "../src/symbols";
import { nonTerminal, terminal } from "../src/util";
import buildGrammar from "../src/buildGrammar";
import generateParseTable from "../src/generateTable";
import LL1ConflictError from "../src/errors/LL1ConflictError";
import * as exampleGrammars from "./exampleGrammars";

describe("generateParseTable", () => {
  it.each([
    [
      "empty grammar",
      exampleGrammars.emptyGrammar,
      { A: { [END_OF_INPUT]: null } },
    ],
    [
      "grammar with only one epsilon-rule",
      exampleGrammars.emptyLanguageGrammar,
      { A: { [END_OF_INPUT]: [EMPTY_STRING] } },
    ],
    [
      "grammar without epsilon-rules (taken from parsing techniques pg.240)",
      exampleGrammars.grammarWithoutEpsilonRules,
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
          [END_OF_INPUT]: null,
        },
        Q: {
          "?": [terminal("?"), terminal("STRING")],
          "!": null,
          "(": null,
          ")": null,
          [END_OF_INPUT]: null,
          STRING: null,
        },
        F: {
          "!": [terminal("!"), terminal("STRING")],
          "(": null,
          ")": null,
          "?": null,
          STRING: null,
          [END_OF_INPUT]: null,
        },
      },
    ],
    [
      "grammar without epsilon-rules 2",
      exampleGrammars.grammarWithoutEpsilonRules2,
      {
        A: {
          a: [terminal("a"), nonTerminal("A")],
          b: [nonTerminal("B")],
          c: [nonTerminal("B")],
          [END_OF_INPUT]: null,
        },
        B: {
          a: null,
          b: [terminal("b"), nonTerminal("B")],
          c: [terminal("c")],
          [END_OF_INPUT]: null,
        },
      },
    ],
    [
      "grammar without epsilon-rules 3 (taken from Parsing Techniques pg.238)",
      exampleGrammars.grammarWithoutEpsilonRules3,
      {
        S: {
          a: [terminal("a"), nonTerminal("B")],
          b: null,
          [END_OF_INPUT]: null,
        },
        B: {
          a: [terminal("a"), nonTerminal("B"), terminal("b")],
          b: [terminal("b")],
          [END_OF_INPUT]: null,
        },
      },
    ],
    [
      "arithmetic expression grammar taken from the 'Dragon Book' pg.225",
      exampleGrammars.arithmeticExpressionGrammar,
      {
        E: {
          ")": null,
          "*": null,
          "+": null,
          [END_OF_INPUT]: null,
          id: [nonTerminal("T"), nonTerminal("E'")],
          "(": [nonTerminal("T"), nonTerminal("E'")],
        },
        "E'": {
          "(": null,
          "*": null,
          id: null,
          "+": [terminal("+"), nonTerminal("T"), nonTerminal("E'")],
          ")": [EMPTY_STRING],
          [END_OF_INPUT]: [EMPTY_STRING],
        },
        T: {
          id: [nonTerminal("F"), nonTerminal("T'")],
          "(": [nonTerminal("F"), nonTerminal("T'")],
          ")": null,
          "*": null,
          "+": null,
          [END_OF_INPUT]: null,
        },
        "T'": {
          "+": [EMPTY_STRING],
          "*": [terminal("*"), nonTerminal("F"), nonTerminal("T'")],
          ")": [EMPTY_STRING],
          [END_OF_INPUT]: [EMPTY_STRING],
          "(": null,
          id: null,
        },
        F: {
          ")": null,
          "*": null,
          "+": null,
          [END_OF_INPUT]: null,
          id: [terminal("id")],
          "(": [terminal("("), nonTerminal("E"), terminal(")")],
        },
      },
    ],
  ])("parse table for %s", (_, G, expectedTable) => {
    expect(generateParseTable(G)).toEqual(expectedTable);
  });
  it("should throw when grammar isn't left factored", () => {
    const G = buildGrammar()
      .setStartingSymbol("A")
      .addProduction("A", [terminal("a"), terminal("b")])
      .addProduction("A", [terminal("a"), terminal("c")])
      .build();
    expect(() => generateParseTable(G)).toThrow(LL1ConflictError);
  });
  it("should throw when grammar is left-recursive", () => {
    const G = buildGrammar()
      .setStartingSymbol("A")
      .addProduction("A", [nonTerminal("A"), terminal("a")])
      .addProduction("A", [terminal("b")])
      .addProduction("A", [terminal("c")])
      .build();
    expect(() => generateParseTable(G)).toThrow(LL1ConflictError);
  });
  it("should throw when a is both in First(A) and Follow(A) and A has a nullable production", () => {
    const G = buildGrammar()
      .setStartingSymbol("A")
      .addProduction("A", [terminal("a")])
      .addProduction("X", [terminal("x"), nonTerminal("A"), terminal("a")])
      .addProduction("A", [nonTerminal("B")])
      .addProduction("B", [EMPTY_STRING])
      .build();
    expect(() => generateParseTable(G)).toThrow(LL1ConflictError);
  });
});
