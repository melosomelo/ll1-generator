import LL1ParseError from "./errors/LL1ParseError";
import generateParseTable from "./generateTable";
import {
  EMPTY_STRING,
  END_OF_INPUT,
  isNonTerminal,
  nonTerminal,
} from "./symbols";

/**
 * Parses a list of tokens based on a parsing table. As of is right now,
 * this parse function (and the whole project, as a matter of fact) **does not** support
 * regular grammars to describe tokens, it accepts only literal strings. I'll add
 * support for this in the next major version, probably.
 * @param tokens A list of strings (tokens).
 * @param G The context-free grammar that describes the language.
 * @param parseTable The parse table for the grammar. Optional parameter. If you do
 * not supply it, then `generateParseTable` will be called internally.
 * @returns A `ParseTreeNode` representing the root of the parse tree
 * produced by parsing the list of tokens. If the list is empty, then
 * the function returns null.
 */
export default function parse(
  tokens: Array<string>,
  G: CFGrammar,
  parseTableParam?: ParseTable
): ParseTreeNode {
  const parseTable = parseTableParam ?? generateParseTable(G);
  const stack: Array<RHSSymbol> = [END_OF_INPUT, nonTerminal(G.startingSymbol)];
  const input = [...tokens, END_OF_INPUT];
  let inputIndex = 0;
  while (stack[0] !== END_OF_INPUT) {
    // The only symbol that can exist in the stack is END_OF_INPUT.
    // If we're inside the while loop, then it is a GrammarSymbol.
    const stackTop = stack[0] as GrammarSymbol;
    // Same rationale for currentToken.
    const currentToken = input[inputIndex] as string;
    if (isNonTerminal(stack[0])) {
      const prediction = parseTable[stackTop.value][currentToken];
      if (prediction === null)
        throw new LL1ParseError(
          `Invalid input string. Unexpected token ${currentToken}!`
        );
      stack.pop();
      // Not epsilon-rule.
      if (!(prediction.length === 0 && prediction[0] === EMPTY_STRING)) {
        stack.concat(...prediction);
      }
    } else {
      if (currentToken !== stackTop.value)
        throw new LL1ParseError(
          `Invalid input string. Expected ${stackTop.value} but got ${currentToken}!`
        );
      inputIndex += 1;
      stack.pop();
    }
  }
  return { value: nonTerminal(G.startingSymbol), children: [] };
}
