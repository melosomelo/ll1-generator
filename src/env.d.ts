interface GrammarSymbol {
  type: "TERMINAL" | "NONTERMINAL";
  value: string;
}

type RHSSymbol = GrammarSymbol | Symbol;

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
