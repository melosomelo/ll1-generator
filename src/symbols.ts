export const EMPTY_STRING = Symbol("EMPTY_STRING");

export const END_OF_INPUT = Symbol("END_OF_INPUT");

export const terminal = (s: string): GrammarSymbol => ({
  type: "TERMINAL",
  value: s,
});
export const nonTerminal = (s: string): GrammarSymbol => ({
  type: "NON_TERMINAL",
  value: s,
});
export function isGrammarSymbol(symbol: RHSSymbol): symbol is GrammarSymbol {
  return typeof symbol !== "symbol";
}

export function isNonTerminal(symbol: RHSSymbol): boolean {
  return isGrammarSymbol(symbol) && symbol.type === "NON_TERMINAL";
}

export function isTerminal(symbol: RHSSymbol): boolean {
  return isGrammarSymbol(symbol) && symbol.type === "TERMINAL";
}
