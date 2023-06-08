import { describe, it, expect } from "@jest/globals";
import buildGrammar from "../src/buildGrammar";
import generateParseTable from "../src/generateTable";
import parse from "../src/parse";
import { nonTerminal, terminal } from "../src/symbols";

describe("parse", () => {
  it("should return empty tree when token list is empty", () => {
    const table = generateParseTable(
      buildGrammar().setStartingSymbol("A").build()
    );
    expect(parse([], table)).toBeNull();
  });
  it("should throw when undefined token appears", () => {
    const table = generateParseTable(
      buildGrammar()
        .setStartingSymbol("A")
        .addProduction("A", [terminal("a")])
        .build()
    );
    expect(parse(["b"], table)).toThrow();
  });
});
