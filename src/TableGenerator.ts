import assert from "assert";
import { EMPTY_STRING, EOI } from "./symbols";

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
    this.calculateNullables();
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

  private calculateNullables() {
    let sizeBefore = 0,
      sizeAfter = 0;
    do {
      sizeBefore = this.nullableSymbols.size;
      this.grammar.productions.forEach((rule) => {
        const [lhs, rhs] = rule;
        if (rhs.every((symbol) => this.isNullable(symbol)))
          this.nullableSymbols.add(lhs.value);
      });
      sizeAfter = this.nullableSymbols.size;
    } while (sizeAfter > sizeBefore);
  }

  private isNullable(sententialForm: RHSSymbol): boolean {
    if (this.isGrammarSymbol(sententialForm)) {
      return (
        sententialForm.type !== "TERMINAL" &&
        this.nullableSymbols.has(sententialForm.value)
      );
    }
    return sententialForm === EMPTY_STRING;
  }

  private isGrammarSymbol(symbol: RHSSymbol): symbol is GrammarSymbol {
    return typeof symbol !== "symbol";
  }
}
