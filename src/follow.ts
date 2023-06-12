import InvalidGrammarError from "./errors/InvalidGrammarError";
import firstSet, { calculateFirstSetForString } from "./first";
import { EMPTY_STRING, END_OF_INPUT } from "./symbols";
import type { CFGrammar, RHSSymbol } from "./types";
import { sumSizesOfSetsInMap, union, isGrammarSymbol } from "./util";

/**
 * Calculates the Follow set for all non-terminals of the grammar G.
 * @param G A context-free grammar.
 * @param firsts The first sets for each non-terminal of the grammar.
 * To calculate the Follow set for certain cases, we need to calculate
 * the First set of other terminals. If this argument is not supplied,
 * then `followSet` will call `firstSet` internally.
 * @returns An object whose keys are strings that represent the non-terminal
 * and whose values are sets of strings / Symbols.
 */
export default function followSet(
  G: CFGrammar,
  firsts?: Record<string, Set<string | Symbol>>
): Record<string, Set<string | Symbol>> {
  const follow = initializeFollows(G);
  const first = firsts ?? firstSet(G);
  let sizeBefore = 1,
    sizeAfter = 1;
  do {
    sizeBefore = sumSizesOfSetsInMap(follow);
    G.productions.forEach((rule) => {
      const [lhs, rhs] = rule;
      rhs.forEach((symbol, i) => {
        // Follow is only defined for non-terminals.
        if (isGrammarSymbol(symbol) && symbol.type === "NON_TERMINAL") {
          follow.set(
            symbol.value,
            union(
              follow.get(symbol.value)!,
              calculateFollowSetForNonTerminal(lhs, rhs, i, first, follow)
            )
          );
        }
      });
    });
    sizeAfter = sumSizesOfSetsInMap(follow);
  } while (sizeBefore < sizeAfter);
  return Object.fromEntries(follow);
}

function initializeFollows(G: CFGrammar) {
  const follows = new Map<string, Set<string | Symbol>>();
  G.nonTerminals.forEach((nonTerminal) => follows.set(nonTerminal, new Set()));
  follows.get(G.startingSymbol)!.add(END_OF_INPUT);
  return follows;
}

/**
 * Calculates the followSet for the non-terminal at index `symbolIndex` within
 * the context of the production determined by the parameters `lhs` and `rhs`.
 * For more info as to why do it like this, check the "Dragon Book".
 * @param lhs The left-hand side of the production
 * @param rhs The right-hand side of the production
 * @param symbolIndex The position of the non-terminal symbol whose Follow set
 * we will calculate
 * @param firsts The First set for the non-terminals of the grammar to whom
 * the productions [lhs,rhs] belongs to
 * @param follows The Follow sets calculated so far.
 */
function calculateFollowSetForNonTerminal(
  lhs: string,
  rhs: Array<RHSSymbol>,
  symbolIndex: number,
  firsts: Record<string, Set<string | Symbol>>,
  follows: Map<string, Set<string | Symbol>>
): Set<string | Symbol> {
  const result = new Set<string | Symbol>();
  const symbolsToTheRight = rhs.slice(symbolIndex + 1);
  const firstOfRight = calculateFirstSetForString(
    new Map(Object.entries(firsts)),
    symbolsToTheRight
  );
  if (firstOfRight.has(EMPTY_STRING)) {
    const lhsFollow = follows.get(lhs);
    if (!lhsFollow)
      throw new InvalidGrammarError(
        `Unable to calculate Follow set for grammar. Non-terminal ${lhs} appears on left-hand side of production but isn't present in the grammar's non-terminals set.`
      );
    lhsFollow.forEach((symbol) => result.add(symbol));
  }
  firstOfRight.delete(EMPTY_STRING);
  firstOfRight.forEach((symbol) => result.add(symbol));
  return result;
}
