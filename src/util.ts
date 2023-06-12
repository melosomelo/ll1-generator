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
