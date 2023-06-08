export const EMPTY_STRING = Symbol("EMPTY_STRING");

export const END_OF_INPUT = Symbol("END_OF_INPUT");

export const terminal = (s: string): GrammarSymbol => ({
  type: "TERMINAL",
  value: s,
});
export const nonTerminal = (s: string): GrammarSymbol => ({
  type: "NONTERMINAL",
  value: s,
});
export function isGrammarSymbol(symbol: RHSSymbol): symbol is GrammarSymbol {
  return typeof symbol !== "symbol";
}
