import LL1ConflictError from "./errors/LL1ConflictError";
import firstSet, { calculateFirstSetForString } from "./first";
import followSet from "./follow";
import { EMPTY_STRING, END_OF_INPUT } from "./symbols";
import type { CFGrammar, ParseTable, RHSSymbol } from "./types";

/**
 * Generates a parsing table for a context-free grammar.
 * @param G A context-free grammar.
 * @param firstParam Optional parameter. First sets of the non-terminals of the grammar G.
 * If not provided, then it will be generated internally.
 * @param followParam Also optional parameter. Follow sets of the non-terminals of the grammar G.
 * If not provided, then it will be generated internally.
 * @returns An object which holds the parsing table and a (perhaps empty)
 * array of possible LL(1) conflicts. Each element of the array is
 * another array with two elements, representing each entry (A,a) of
 * the parsing table that has a conflict.
 */
export default function generateParseTable(
  G: CFGrammar,
  firstParam?: Record<string, Set<string | Symbol>>,
  followParam?: Record<string, Set<string | Symbol>>
): { table: ParseTable; conflicts: Array<[string, string]> } {
  const table: ParseTable = {};
  const first = firstParam ?? firstSet(G);
  const follow = followParam ?? followSet(G);
  // We're going to stringify the entries (A,a) for
  // performance and convenience reasons.
  const conflicts = new Set<string>();
  preFillTable(table, G);
  G.productions.forEach((rule) => {
    const [lhs, rhs] = rule;
    const rhsFirst = calculateFirstSetForString(
      new Map(Object.entries(first)),
      rhs
    );
    if (rhsFirst.has(EMPTY_STRING)) {
      const lhsFollow = follow[lhs];
      lhsFollow.forEach((symbol) => {
        setTableEntry(table, lhs, symbol, rhs, conflicts);
      });
    }
    rhsFirst.delete(EMPTY_STRING);
    rhsFirst.forEach((symbol) =>
      setTableEntry(table, lhs, symbol, rhs, conflicts)
    );
  });
  return {
    table,
    conflicts: Array.from(conflicts).map((conflictStr) =>
      JSON.parse(conflictStr)
    ),
  };
}

function preFillTable(table: ParseTable, G: CFGrammar) {
  G.nonTerminals.forEach((symbol) => {
    table[symbol] = {};
    G.terminals.forEach((symbol2) => (table[symbol][symbol2] = null));
    table[symbol][END_OF_INPUT] = null;
  });
}

function setTableEntry(
  table: ParseTable,
  nonTerminal: string,
  terminal: string | Symbol,
  rhs: Array<RHSSymbol>,
  conflicts: Set<string>
): void {
  if (table[nonTerminal][terminal.valueOf()] === null)
    table[nonTerminal][terminal.valueOf()] = [];
  const tableEntry = table[nonTerminal][terminal.valueOf()]!;
  if (tableEntry.length === 1)
    conflicts.add(JSON.stringify([nonTerminal, terminal]));
  tableEntry.push(rhs);
}
