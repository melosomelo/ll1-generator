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
          if (symbol.type === "NONTERMINAL")
            this.nonTerminals.add(symbol.value);
          else this.terminals.add(symbol.value);
        }
      });
      this.productions.add([lhs, rhs]);
      return this;
    },
    setStartingSymbol(symbol) {
      this.startingSymbol = symbol;
      return this;
    },
    build() {
      if (this.startingSymbol === null)
        throw new Error(
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
