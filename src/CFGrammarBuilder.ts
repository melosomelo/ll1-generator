import CFGrammar from "./CFGrammar";
import { isGrammarSymbol } from "./symbols";

export default class CFGrammarBuilder {
  private startingSymbol: string | null = null;
  private terminals: Set<string> = new Set();
  private nonTerminals: Set<string> = new Set();
  private productions: Set<CFProduction> = new Set();

  public constructor() {}

  public addProduction(lhs: string, rhs: Array<RHSSymbol>): CFGrammarBuilder {
    this.nonTerminals.add(lhs);
    rhs.forEach((symbol) => {
      if (isGrammarSymbol(symbol)) {
        if (symbol.type === "TERMINAL") this.terminals.add(symbol.value);
        else this.nonTerminals.add(symbol.value);
      }
    });
    if (
      Array.from(this.productions).every(
        (rule) => !this.productionsAreEqual(rule, [lhs, rhs])
      )
    ) {
      this.productions.add([lhs, rhs]);
    }
    return this;
  }

  public setStartingSymbol(symbol: string): CFGrammarBuilder {
    this.startingSymbol = symbol;
    return this;
  }

  public build(): CFGrammar {
    if (this.startingSymbol === null)
      throw new Error(
        "Cannot build CFGrammar without specifying starting symbol!"
      );
    return new CFGrammar(
      this.startingSymbol,
      this.terminals,
      this.nonTerminals,
      this.productions
    );
  }

  private productionsAreEqual(prod1: CFProduction, prod2: CFProduction) {
    return (
      prod1[0] === prod2[0] &&
      prod1[1].length === prod2[1].length &&
      prod1[1].every((symbol, i) => {
        const counterpart = prod2[1][i];
        if (isGrammarSymbol(symbol)) {
          return (
            isGrammarSymbol(counterpart) &&
            counterpart.type === symbol.type &&
            counterpart.value === symbol.value
          );
        }
        return (
          typeof counterpart === "symbol" &&
          counterpart.valueOf() === symbol.valueOf()
        );
      })
    );
  }
}
