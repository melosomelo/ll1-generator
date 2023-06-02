import assert from "assert";
import { EOI } from "./symbols";

export default class ParseTableGenerator {
  private nullableSymbols = new Set<string>();
  private firsts = new Map<string, Set<string>>();
  private follows = new Map<string, Set<string>>();
  private grammar: CFGrammar;

  public constructor(G: CFGrammar) {
    this.validateGrammar(G);
    this.grammar = G;
  }

  public generateTable(): ParseTable {
    return {};
  }

  private validateGrammar(G: CFGrammar): void {
    G.productions.forEach((rule, i) => {
      assert(
        rule[0].type !== "TERMINAL",
        new TypeError(
          `Invalid context-free grammar. Production number ${i} has a terminal on its left-hand side.`
        )
      );
      assert(
        rule[1].every((symbol) => symbol !== EOI),
        `Cannot use EOI symbol in right-hand side of productions.`
      );
    });
  }
}
