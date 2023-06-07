import { describe, it, expect, beforeEach } from "@jest/globals";
import firstSet from "../src/first";
import buildGrammar from "../src/buildGrammar";
import { EMPTY_STRING, nonTerminal, terminal } from "../src/symbols";

describe("firstSet", () => {
  it("First(X) must contain x when X->x... and x is terminal", () => {
    const G = buildGrammar()
      .setStartingSymbol("A")
      .addProduction("A", [terminal("a")])
      .addProduction("B", [terminal("b")])
      .addProduction("C", [terminal("c")])
      .build();
    const first = firstSet(G);
    expect(first["A"].has("a")).toBeTruthy();
    expect(first["B"].has("b")).toBeTruthy();
    expect(first["C"].has("c")).toBeTruthy();
  });

  it("First(X) must contain First(Y) when X -> Y...", () => {
    const G = buildGrammar()
      .setStartingSymbol("A")
      .addProduction("A", [nonTerminal("B"), terminal("a")])
      .addProduction("B", [nonTerminal("C"), terminal("b")])
      .addProduction("C", [terminal("c")])
      .build();
    const first = firstSet(G);
    expect(first["A"]).toEqual(first["B"]);
    expect(first["B"]).toEqual(first["C"]);
  });

  it("First(X) must contain ε when X -> ε", () => {
    const G = buildGrammar()
      .addProduction("A", [EMPTY_STRING])
      .setStartingSymbol("A")
      .build();
    const first = firstSet(G);
    expect(first["A"].has(EMPTY_STRING)).toBeTruthy();
    expect(first["A"].size).toEqual(1);
  });
  it("First(X) must contain ε when X -> ABC and A,B and C are all nullable", () => {
    const G = buildGrammar()
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
      .build();
    const first = firstSet(G);
    expect(first["A"].has(EMPTY_STRING)).toBeTruthy();
    expect(first["A"].size).toEqual(1);
  });
  it("mixture of previous cases", () => {
    const G = buildGrammar()
      .setStartingSymbol("A")
      .addProduction("A", [EMPTY_STRING])
      .addProduction("A", [terminal("a"), nonTerminal("A"), nonTerminal("B")])
      .addProduction("B", [terminal("b"), nonTerminal("C")])
      .addProduction("C", [terminal("c")])
      .addProduction("C", [EMPTY_STRING])
      .build();
    const first = firstSet(G);
    expect(first["A"].has(EMPTY_STRING)).toBeTruthy();
    expect(first["A"].has("a")).toBeTruthy();
    expect(first["B"].has("b")).toBeTruthy();
    expect(first["C"].has("c")).toBeTruthy();
    expect(first["C"].has(EMPTY_STRING)).toBeTruthy();
  });
});
