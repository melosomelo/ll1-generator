import { describe, it, expect } from "@jest/globals";
import buildGrammar from "../src/buildGrammar";
import parse from "../src/parse";
import { EMPTY_STRING, nonTerminal, terminal } from "../src/symbols";

describe("parse", () => {
  it("grammar allows empty input string", () => {
    const G = buildGrammar()
      .setStartingSymbol("S")
      .addProduction("S", [EMPTY_STRING])
      .build();
    expect(parse([], G)).toEqual({
      value: nonTerminal("S"),
      children: [],
    });
  });
});
