import assert from "assert";
import { EMPTY_STRING, EOI } from "./symbols";

export default class ParseTableGenerator {
  private firsts = new Map<string, Set<string | Symbol>>();
  private follows = new Map<string, Set<string | Symbol>>();
  private grammar: CFGrammar;

  public constructor(G: CFGrammar) {
    this.validateGrammar(G);
    this.grammar = G;
  }

  public generateTable(): ParseTable {
    const t: ParseTable = {};
    this.generateFirsts();
    // this.generateFollows();
    this.fillTable(t);
    return t;
  }

  private validateGrammar(G: CFGrammar): void {
    G.productions.forEach((rule, i) => {
      assert(
        rule[1].every((symbol) => symbol !== EOI),
        `Cannot use EOI symbol in right-hand side of productions.`
      );
    });
  }

  private generateFirsts() {
    let sizeBefore = 0,
      sizeAfter = 0;
    do {
      sizeBefore = this.sumSizesOfSetsInMap(this.firsts);
      this.grammar.productions.forEach((rule) => {
        const [lhs, rhs] = rule;
        const terminals = this.calculateFirst(rhs);
        Array.from(terminals).forEach((symbol) =>
          this.getCalculatedFirst(lhs).add(symbol)
        );
      });
      sizeAfter = this.sumSizesOfSetsInMap(this.firsts);
    } while (sizeBefore < sizeAfter);
  }

  private calculateFirst(string: Array<RHSSymbol>): Set<string | Symbol> {
    let allNullable = true;
    let result = new Set<string | Symbol>();
    for (let symbol of string) {
      if (!this.isNullable(symbol)) {
        allNullable = false;
        // This type assertion is valid because:
        //  1. firstSet is only called after the method validateGrammar,
        //     which guarantees there's no EOI symbols on any right-hand side.
        //  2. And if there are no EOI symbols and `symbol` is NOT nullable,
        //     then it must be of type GrammarSymbol.
        let gSymbol = symbol as GrammarSymbol;
        if (gSymbol.type === "TERMINAL") result.add(gSymbol.value);
        else result = this.getCalculatedFirst(gSymbol.value);
        break;
      }
    }
    if (allNullable) result.add(EMPTY_STRING);
    return result;
  }

  private fillTable(t: ParseTable) {
    this.grammar.productions.forEach((rule) => {
      const [lhs, rhs] = rule;
      t[lhs] = t[lhs] ?? {};
      const terminals = this.calculateFirst(rhs);
      terminals.forEach((a) => (t[lhs][a as string] = rhs));
    });
  }

  private isNullable(symbol: RHSSymbol): boolean {
    if (this.isGrammarSymbol(symbol)) {
      return (
        symbol.type !== "TERMINAL" &&
        this.getCalculatedFirst(symbol.value).has(EMPTY_STRING)
      );
    }
    return symbol === EMPTY_STRING;
  }

  private isGrammarSymbol(symbol: RHSSymbol): symbol is GrammarSymbol {
    return typeof symbol !== "symbol";
  }

  private getCalculatedFirst(nonTerminal: string): Set<string | Symbol> {
    if (this.firsts.get(nonTerminal) === undefined)
      this.firsts.set(nonTerminal, new Set());
    return this.firsts.get(nonTerminal) as Set<string | Symbol>;
  }

  private sumSizesOfSetsInMap(map: Map<string, Set<any>>) {
    return Array.from(map.values()).reduce(
      (prev, current) => prev + current.size,
      0
    );
  }
}
