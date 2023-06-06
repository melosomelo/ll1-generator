import { EMPTY_STRING, EOI, isGrammarSymbol } from "./symbols";

export default class ParseTableGenerator {
  private firsts = new Map<string, Set<string | Symbol>>();
  private follows = new Map<string, Set<string | Symbol>>();
  private grammar: CFGrammar;

  public constructor(G: CFGrammar) {
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
      if (isGrammarSymbol(symbol)) {
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

  private addToFirstSet(key: string, newValues: Set<any>): void {
    const receiver = this.getFirst(key);
    newValues.forEach((value) => receiver.add(value));
  }

  private generateFollows(): void {
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
          if (isGrammarSymbol(symbol) && symbol.type === "NONTERMINAL") {
            this.addToFollowSet(
              symbol.value,
              this.calculateFollowSet(lhs, rhs, i)
            );
          }
        });
      });
      sizeAfter = this.sumSizesOfSetsInMap(this.follows);
    } while (sizeBefore < sizeAfter);
  }

  private calculateFollowSet(
    lhs: string,
    rhs: Array<RHSSymbol>,
    symbolIndex: number
  ): Set<string | Symbol> {
    const result = new Set<string | Symbol>();
    const symbolsToTheRight = rhs.slice(symbolIndex + 1);
    const firstOfRight = this.calculateFirstSet(symbolsToTheRight);
    if (firstOfRight.has(EMPTY_STRING)) {
      this.getFollow(lhs).forEach((symbol) => result.add(symbol));
    }
    firstOfRight.delete(EMPTY_STRING);
    firstOfRight.forEach((symbol) => result.add(symbol));
    return result;
  }

  private addToFollowSet(key: string, newValues: Set<any>): void {
    const receiver = this.getFollow(key);
    newValues.forEach((value) => receiver.add(value));
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

  private sumSizesOfSetsInMap(map: Map<string, Set<any>>): number {
    return Array.from(map.values()).reduce(
      (prev, current) => prev + current.size,
      0
    );
  }
}
