import CFGrammar from "./grammar";
import { EMPTY_STRING, EOI, isGrammarSymbol } from "./symbols";

export default class ParseTableGenerator {
  private _firsts = new Map<string, Set<string | Symbol>>();
  private _follows = new Map<string, Set<string | Symbol>>();
  public grammar: CFGrammar;

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

  public get firsts() {
    return this._firsts;
  }

  public get follows() {
    return this._follows;
  }

  public generateTable(): ParseTable {
    const t: ParseTable = {};
    this.preFillTable(t);
    this.grammar.productions.forEach((rule) => {
      const [lhs, rhs] = rule;
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

  private preFillTable(t: ParseTable) {
    this.grammar.nonTerminals.forEach((symbol) => {
      t[symbol] = {};
      this.grammar.terminals.forEach((symbol2) => (t[symbol][symbol2] = null));
      t[symbol][EOI] = null;
    });
  }

  private validateGrammar(G: CFGrammar) {
    G.productions.forEach((rule) => {
      if (rule[1].some((symbol) => symbol === EOI)) {
        throw new TypeError(
          "Cannot have EOI in right-hand side of production when using ParseTableGenerator"
        );
      }
    });
  }

  private generateFirsts(): void {
    let sizeBefore = 0,
      sizeAfter = 0;
    do {
      sizeBefore = this.sumSizesOfSetsInMap(this._firsts);
      this.grammar.productions.forEach((rule) => {
        const [lhs, rhs] = rule;
        const rhsFirst = this.calculateFirstSet(rhs);
        this.addToFirstSet(lhs, rhsFirst);
      });
      sizeAfter = this.sumSizesOfSetsInMap(this._firsts);
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
    this._follows.set(this.grammar.startingSymbol, new Set());
    this._follows.get(this.grammar.startingSymbol)!.add(EOI);
    let sizeBefore = 1,
      sizeAfter = 1;
    do {
      sizeBefore = this.sumSizesOfSetsInMap(this._follows);
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
      sizeAfter = this.sumSizesOfSetsInMap(this._follows);
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
    if (this._firsts.get(nonTerminal) === undefined)
      this._firsts.set(nonTerminal, new Set());
    return this._firsts.get(nonTerminal) as Set<string | Symbol>;
  }

  private getFollow(nonTerminal: string): Set<string | Symbol> {
    if (this._follows.get(nonTerminal) === undefined)
      this._follows.set(nonTerminal, new Set());
    return this._follows.get(nonTerminal) as Set<string | Symbol>;
  }

  private sumSizesOfSetsInMap(map: Map<string, Set<any>>): number {
    return Array.from(map.values()).reduce(
      (prev, current) => prev + current.size,
      0
    );
  }
}
