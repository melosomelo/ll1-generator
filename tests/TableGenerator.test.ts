import { describe, it, expect, beforeEach } from "@jest/globals";
import ParseTableGenerator from "../src/TableGenerator";

function makeTerminal(value: string): GrammarSymbol {
  return {
    type: "TERMINAL",
    value,
  };
}

function makeNonTerminal(value: string): GrammarSymbol {
  return {
    type: "NON-TERMINAL",
    value,
  };
}

function makeEmpty(): GrammarSymbol {
  return {
    type: "EMPTY",
    value: "",
  };
}

describe("ParseTableGenerator", () => {
  describe("constructor", () => {
    it("should thrown when grammar has terminal for lhs of production", () => {
      expect(
        () =>
          new ParseTableGenerator([
            [makeNonTerminal("A"), [makeTerminal("a")]],
            [makeTerminal("a"), [makeTerminal("a"), makeTerminal("a")]],
          ])
      ).toThrow();
    });
    it("should throw when grammar has empty string for lhs of production", () => {
      expect(
        () =>
          new ParseTableGenerator([
            [makeEmpty(), [makeTerminal("a")]],
            [makeNonTerminal("A"), [makeTerminal("a")]],
          ])
      ).toThrow();
    });
  });
  describe("generateTable", () => {
    let tableGenerator = new ParseTableGenerator([]);
    beforeEach(() => {
      tableGenerator = new ParseTableGenerator([]);
    });
    it("should return empty parse table when grammar is empty", () => {
      expect(tableGenerator.generateTable()).toEqual({});
    });
  });
});
