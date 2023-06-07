import { describe, it, expect, beforeEach } from "@jest/globals";
import { EMPTY_STRING, EOI, terminal, nonTerminal } from "../src/symbols";
import buildGrammar from "../src/buildGrammar";

describe("CFGrammarBuilder", () => {
  it("should not build without starting symbol set", () => {
    expect(() => buildGrammar().build()).toThrow();
  });
  it("should build correctly even with no productions", () => {
    const G = buildGrammar().setStartingSymbol("A").build();
    expect(G.startingSymbol).toEqual("A");
    expect(G.nonTerminals.size).toEqual(1);
    expect(G.terminals.size).toEqual(0);
    expect(G.productions.size).toEqual(0);
  });
  it("should correctly add terminals, non-terminals and productions", () => {
    const G = buildGrammar()
      .addProduction("A", [terminal("a"), nonTerminal("A"), nonTerminal("X")])
      .addProduction("B", [terminal("b"), nonTerminal("B")])
      .addProduction("C", [EMPTY_STRING])
      .setStartingSymbol("A")
      .build();
    expect(G.nonTerminals.has("A")).toBeTruthy();
    expect(G.nonTerminals.has("B")).toBeTruthy();
    expect(G.nonTerminals.has("C")).toBeTruthy();
    expect(G.nonTerminals.size).toEqual(4);
    expect(G.terminals.has("a")).toBeTruthy();
    expect(G.terminals.has("b")).toBeTruthy();
    expect(G.terminals.size).toEqual(2);
    expect(G.productions.size).toEqual(3);
  });
});
