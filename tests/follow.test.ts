import { describe, it, expect, beforeEach } from "@jest/globals";
import buildGrammar from "../src/buildGrammar";
import followSet from "../src/follow";
import { EMPTY_STRING, EOI, nonTerminal, terminal } from "../src/symbols";

describe("followSet", () => {
  it("Follow(S) must contain EOI (S is starting symbol)", () => {
    const G = buildGrammar().setStartingSymbol("A").build();
    const follow = followSet(G);
    expect(follow["A"].has(EOI)).toBeTruthy();
    expect(follow["A"].size).toEqual(1);
  });
  it("Follow(A) must contain First(B) (without empty string) when X -> AB", () => {
    const G = buildGrammar()
      .setStartingSymbol("A")
      .addProduction("A", [nonTerminal("A"), nonTerminal("B")])
      .addProduction("B", [EMPTY_STRING])
      .addProduction("B", [terminal("b"), nonTerminal("B")])
      .build();
    const follow = followSet(G);
    expect(follow["A"].has("b")).toBeTruthy();
    expect(follow["A"].has(EMPTY_STRING)).toBeFalsy();
  });
  it("Follow(B) must contain Follow(A) when A -> ...B", () => {
    const G = buildGrammar()
      .setStartingSymbol("A")
      .addProduction("A", [nonTerminal("A"), nonTerminal("X")])
      .addProduction("X", [terminal("x")])
      .addProduction("X", [terminal("y")])
      .addProduction("X", [terminal("z")])
      .addProduction("A", [terminal("a"), nonTerminal("B")])
      .build();
    const follow = followSet(G);
    expect(follow["B"]).toEqual(follow["A"]);
  });
  it("Follow(B) must contain Follow(A) when A -> ...Bβ and β is nullable", () => {
    const G = buildGrammar()
      .setStartingSymbol("A")
      .addProduction("A", [nonTerminal("A"), nonTerminal("X")])
      .addProduction("X", [terminal("x")])
      .addProduction("X", [terminal("y")])
      .addProduction("X", [terminal("z")])
      .addProduction("C", [EMPTY_STRING])
      .addProduction("C", [terminal("c")])
      .addProduction("A", [terminal("a"), nonTerminal("B"), nonTerminal("C")])
      .build();
    const follow = followSet(G);
    follow["A"].forEach((value) => expect(follow["B"].has(value)).toBeTruthy());
  });
});
