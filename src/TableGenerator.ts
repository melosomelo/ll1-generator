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
    this.generateFollows();
  }

  public firstSet(nonTerminal: string): Set<string | Symbol> {
    return new Set(this.getFirst(nonTerminal));
  }

  public followSet(nonTerminal: string): Set<string | Symbol> {
    return new Set(this.getFollow(nonTerminal));
  }

  public generateTable(): ParseTable {
    const t: ParseTable = {};
    this.grammar.productions.forEach((rule) => {
      const [lhs, rhs] = rule;
      t[lhs] = t[lhs] ?? {};
      const rhsFirst = this.calculateFirstSet(rhs);
      if (rhsFirst.has(EMPTY_STRING)) {
        const lhsFollow = this.getFollow(lhs);
        lhsFollow.forEach((symbol) => (t[lhs][symbol.valueOf()] = rhs));
      }
      rhsFirst.delete(EMPTY_STRING);
      rhsFirst.forEach((symbol) => (t[lhs][symbol.valueOf()] = rhs));
    });
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
    let result = new Set<string | Symbol>();
    result.add(EMPTY_STRING);
    // We add to the result until we either find a terminal symbol
    // or we find a non-terminal that is not nullable.
    // If none of these cases are satisfied, then the sententialForm
    // parameter is nullable.
    for (let symbol of sententialForm) {
      if (this.isGrammarSymbol(symbol)) {
        if (symbol.type === "TERMINAL") {
          result.add(symbol.value);
          result.delete(EMPTY_STRING);
          break;
        } else {
          const symbolFirst = this.getFirst(symbol.value);
          symbolFirst.forEach((terminal) => result.add(terminal));
          if (!symbolFirst.has(EMPTY_STRING)) {
            result.delete(EMPTY_STRING);
            break;
          }
        }
      }
    }
    return result;
  }

  private addToFirstSet(key: string, newValues: Set<any>) {
    const receiver = this.getFirst(key);
    newValues.forEach((value) => receiver.add(value));
  }

  private generateFollows() {
    this.follows.set(this.grammar.startingSymbol, new Set());
    this.follows.get(this.grammar.startingSymbol)!.add(EOI);
    let sizeBefore = 1,
      sizeAfter = 1;
    do {
      sizeBefore = this.sumSizesOfSetsInMap(this.follows);
      this.grammar.productions.forEach((rule) => {
        const [lhs, rhs] = rule;
        rhs.forEach((symbol, i) => {
          // Follow set is only defined for non-terminals.
          if (this.isGrammarSymbol(symbol) && symbol.type === "NONTERMINAL") {
            const symbolsToTheRight = rhs.slice(i + 1);
            const firstOfRight = this.calculateFirstSet(symbolsToTheRight);
            if (firstOfRight.has(EMPTY_STRING)) {
              this.addToFollowSet(symbol.value, this.getFollow(lhs));
            }
            firstOfRight.delete(EMPTY_STRING);
            this.addToFollowSet(symbol.value, firstOfRight);
          }
        });
      });
      sizeAfter = this.sumSizesOfSetsInMap(this.follows);
    } while (sizeBefore < sizeAfter);
  }

  private addToFollowSet(key: string, newValues: Set<any>) {
    const receiver = this.getFollow(key);
    newValues.forEach((value) => receiver.add(value));
  }

  private isGrammarSymbol(symbol: RHSSymbol): symbol is GrammarSymbol {
    return typeof symbol !== "symbol";
  }

  private getFirst(nonTerminal: string): Set<string | Symbol> {
    if (this.firsts.get(nonTerminal) === undefined)
      this.firsts.set(nonTerminal, new Set());
    return this.firsts.get(nonTerminal) as Set<string | Symbol>;
  }

  private getFollow(nonTerminal: string): Set<string | Symbol> {
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
