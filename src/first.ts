import InvalidGrammarError from "./errors/InvalidGrammarError";
import { EMPTY_STRING } from "./symbols";
import { sumSizesOfSetsInMap, union, isGrammarSymbol } from "./util";

/**
 * Calculates the First set for all non-terminals in the grammar G.
 * @param G A context-free grammar.
 * @returns An object whose keys are the string value of each non-terminal A from G
 * and the values are First(A)
 */
export default function firstSet(
  G: CFGrammar
): Record<string, Set<string | Symbol>> {
  const firsts = initializeFirstsToEmpty(G);
  let sizeBefore = 0,
    sizeAfter = 0;
  do {
    sizeBefore = sumSizesOfSetsInMap(firsts);
    G.productions.forEach((rule) => {
      const [lhs, rhs] = rule;
      const rhsFirst = calculateFirstSetForString(firsts, rhs);
      const lhsCurrentFirst = firsts.get(lhs);
      if (lhsCurrentFirst === undefined)
        throw new InvalidGrammarError(
          `Unable to calculate First set for grammar. Non-terminal ${lhs} appears on left-hand side of production but isn't present in the grammar's non-terminals set.`
        );
      firsts.set(lhs, union(lhsCurrentFirst, rhsFirst));
    });
    sizeAfter = sumSizesOfSetsInMap(firsts);
  } while (sizeBefore < sizeAfter);
  return Object.fromEntries(firsts);
}

function initializeFirstsToEmpty(
  G: CFGrammar
): Map<string, Set<string | Symbol>> {
  const firsts = new Map<string, Set<string | Symbol>>();
  G.nonTerminals.forEach((nonTerminal) => firsts.set(nonTerminal, new Set()));
  return firsts;
}

export function calculateFirstSetForString(
  firsts: Map<string, Set<string | Symbol>>,
  sententialForm: Array<RHSSymbol>
): Set<string | Symbol> {
  let result = new Set<string | Symbol>();
  result.add(EMPTY_STRING);
  for (let symbol of sententialForm) {
    if (isGrammarSymbol(symbol)) {
      if (symbol.type === "TERMINAL") {
        result.add(symbol.value);
        result.delete(EMPTY_STRING);
        break;
      } else {
        const symbolFirst = firsts.get(symbol.value);
        if (symbolFirst === undefined)
          throw new InvalidGrammarError(
            `Unable to calculate First set for grammar. Non-terminal ${symbol.value} appears on right-hand side of production but isn't present in the grammar's non-terminals set.`
          );
        symbolFirst.forEach((terminal) => result.add(terminal));
        if (!symbolFirst.has(EMPTY_STRING)) {
          result.delete(EMPTY_STRING);
          break;
        }
      }
    }
  }
  return result;
}
