export function sumSizesOfSetsInMap(map: Map<string, Set<any>>): number {
  return Array.from(map.values()).reduce(
    (prev, current) => prev + current.size,
    0
  );
}

export function union(A: Set<any>, B: Set<any>): Set<any> {
  const S = new Set(A);
  B.forEach((val) => S.add(val));
  return S;
}

export function makeNode(
  symbol: RHSSymbol,
  ...children: ParseTreeNode[]
): ParseTreeNode {
  return {
    value: symbol,
    children: children ?? [],
  };
}

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
