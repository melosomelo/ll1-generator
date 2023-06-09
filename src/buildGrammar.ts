import InvalidGrammarError from "./errors/InvalidGrammarError";
import { isGrammarSymbol } from "./symbols";

export default function buildGrammar(): GrammarBuilder {
  return {
    startingSymbol: null,
    terminals: new Set(),
    nonTerminals: new Set(),
    productions: new Set(),
    addProduction: function (lhs, rhs) {
      this.nonTerminals.add(lhs);
      rhs.forEach((symbol) => {
        if (isGrammarSymbol(symbol)) {
          if (symbol.type === "NON_TERMINAL")
            this.nonTerminals.add(symbol.value);
          else this.terminals.add(symbol.value);
        }
      });
      this.productions.add([lhs, rhs]);
      return this;
    },
    setStartingSymbol(symbol) {
      this.startingSymbol = symbol;
      this.nonTerminals.add(this.startingSymbol);
      return this;
    },
    build() {
      if (this.startingSymbol === null)
        throw new InvalidGrammarError(
          "Cannot build grammar without specifying starting symbol!"
        );
      return {
        startingSymbol: this.startingSymbol,
        nonTerminals: this.nonTerminals,
        terminals: this.terminals,
        productions: this.productions,
      };
    },
  };
}
