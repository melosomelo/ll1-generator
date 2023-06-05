import assert from "assert";
import { EMPTY_STRING, EOI } from "./symbols";

export default class ParseTableGenerator {
  private firsts = new Map<string, Set<string | Symbol>>();
  private follows = new Map<string, Set<string | Symbol>>();
  private grammar: CFGrammar;

  public constructor(G: CFGrammar) {
    this.validateGrammar(G);
    this.grammar = G;
    this.generateFirsts();
  }

  public firstSet(nonTerminal: string): Set<string | Symbol> {
    return this.getFirst(nonTerminal);
  }

  public generateTable(): ParseTable {
    const t: ParseTable = {};
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

  private generateFirsts(): void {
    let sizeBefore = 0,
      sizeAfter = 0;
    do {
      sizeBefore = this.sumSizesOfSetsInMap(this.firsts);
      this.grammar.productions.forEach((rule) => {
        const [lhs, rhs] = rule;
        const rhsFirst = this.calculateFirstSet(rhs);
        this.addToFirstSet(lhs, rhsFirst);
      });
      sizeAfter = this.sumSizesOfSetsInMap(this.firsts);
    } while (sizeBefore < sizeAfter);
  }

  private calculateFirstSet(
    sententialForm: Array<RHSSymbol>
  ): Set<string | Symbol> {
    let allNullable = true;
    let result = new Set<string | Symbol>();
    for (let symbol of sententialForm) {
      if (!this.isNullable(symbol)) {
        allNullable = false;
        // This type assertion is valid because:
        //  1. This function is only called after the method validateGrammar,
        //     which guarantees there's no EOI symbols on any right-hand side.
        //  2. And if there are no EOI symbols and `symbol` is NOT nullable,
        //     then it must be of type GrammarSymbol.
        let gSymbol = symbol as GrammarSymbol;
        if (gSymbol.type === "TERMINAL") result.add(gSymbol.value);
        else result = new Set(this.getFirst(gSymbol.value));
        break;
      }
    }
    if (allNullable) result.add(EMPTY_STRING);
    return result;
  }

  private addToFirstSet(key: string, newValues: Set<any>) {
    const receiver = this.getFirst(key);
    newValues.forEach((value) => receiver.add(value));
  }

  private fillTable(t: ParseTable) {
    this.grammar.productions.forEach((rule) => {
      // Production A -> α
      const [lhs, rhs] = rule;
      t[lhs] = t[lhs] ?? {};
      // For every terminal a in First(α),
      // set the entry [A,a] to α
      // [TODO] deal with conflicts
      const rhsFirst = this.calculateFirstSet(rhs);
      rhsFirst.forEach((terminal) => {
        if (typeof terminal !== "symbol") {
          t[lhs][terminal as string] = rhs;
        }
      });
      // If ε ∈ First(α), then for every terminal b in
      // Follow(A), set the entry [A,b] to α.
      if (rhsFirst.has(EMPTY_STRING)) {
        const lhsFollow = this.getCalculatedFollow(lhs);
        lhsFollow.forEach((symbol) => (t[lhs][symbol.valueOf()] = rhs));
        if (lhsFollow.has(EOI)) t[lhs][EOI] = rhs;
      }
    });
  }

  private isNullable(symbol: RHSSymbol): boolean {
    if (this.isGrammarSymbol(symbol)) {
      return (
        symbol.type !== "TERMINAL" &&
        this.getFirst(symbol.value).has(EMPTY_STRING)
      );
    }
    return symbol === EMPTY_STRING;
  }

  private isGrammarSymbol(symbol: RHSSymbol): symbol is GrammarSymbol {
    return typeof symbol !== "symbol";
  }

  /**
   * Safely retrieves the current value for the First set of the parameter.
   * @param nonTerminal
   * @returns The First set for the nonTerminal parameter.
   */
  private getFirst(nonTerminal: string): Set<string | Symbol> {
    if (this.firsts.get(nonTerminal) === undefined)
      this.firsts.set(nonTerminal, new Set());
    return this.firsts.get(nonTerminal) as Set<string | Symbol>;
  }

  private getCalculatedFollow(nonTerminal: string): Set<string | Symbol> {
    if (this.follows.get(nonTerminal) === undefined)
      this.follows.set(nonTerminal, new Set());
    return this.follows.get(nonTerminal) as Set<string | Symbol>;
  }

  private sumSizesOfSetsInMap(map: Map<string, Set<any>>) {
    return Array.from(map.values()).reduce(
      (prev, current) => prev + current.size,
      0
    );
  }
}
