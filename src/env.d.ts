interface GrammarSymbol {
  type: "TERMINAL" | "NONTERMINAL";
  value: string;
}

/**
 * Any symbol that can appear on the right-hand side
 * of a grammar production.
 */
type RHSSymbol = GrammarSymbol | Symbol;

/**
 * A context-free grammar.
 */
interface CFGrammar {
  startingSymbol: string;
  terminals: Set<string>;
  nonTerminals: Set<string>;
  productions: Set<CFProduction>;
}

/**
 * Represents a production from a context-free (CF) grammar.
 * Since a CF grammar has exactly one non-terminal on its left-hand
 * side, then we can represent this as a tuple whose first
 * element is a simple string. The right-hand side, on the
 * other hand, is any sequence of grammar/special symbols.
 */
type CFProduction = [string, Array<RHSSymbol>];

type ParseTable = Record<
  string,
  Record<string | unique symbol, Array<RHSSymbol> | null>
>;

interface GrammarBuilder {
  startingSymbol: null | string;
  terminals: Set<string>;
  nonTerminals: Set<string>;
  productions: Set<CFProduction>;
  addProduction: (lhs: string, rhs: Array<RHSSymbol>) => GrammarBuilder;
  setStartingSymbol: (symbol: string) => GrammarBuilder;
  build(): CFGrammar;
}

interface ParseTreeNode {
  value: RHSSymbol;
  children: Array<ParseTreeNode>;
}
