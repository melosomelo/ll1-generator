export const EMPTY_STRING = Symbol("EPSILON");
export const EOI = Symbol("EOI");
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
