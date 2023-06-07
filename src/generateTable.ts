import firstSet, { calculateFirstSetForString } from "./first";
import followSet from "./follow";
import { EMPTY_STRING, EOI } from "./symbols";

export default function generateParseTable(
  G: CFGrammar,
  firstParam?: Record<string, Set<string | Symbol>>,
  followParam?: Record<string, Set<string | Symbol>>
): ParseTable {
  const table: ParseTable = {};
  const first = firstParam ?? firstSet(G);
  const follow = followParam ?? followSet(G);
  preFillTable(table, G);
  G.productions.forEach((rule) => {
    const [lhs, rhs] = rule;
    const rhsFirst = calculateFirstSetForString(
      new Map(Object.entries(first)),
      rhs
    );
    if (rhsFirst.has(EMPTY_STRING)) {
      const lhsFollow = follow[lhs];
      lhsFollow.forEach((symbol) => (table[lhs][symbol.valueOf()] = rhs));
    }
    rhsFirst.delete(EMPTY_STRING);
    rhsFirst.forEach((symbol) => (table[lhs][symbol.valueOf()] = rhs));
  });
  return table;
}

function preFillTable(table: ParseTable, G: CFGrammar) {
  G.nonTerminals.forEach((symbol) => {
    table[symbol] = {};
    G.terminals.forEach((symbol2) => (table[symbol][symbol2] = null));
    table[symbol][EOI] = null;
  });
}