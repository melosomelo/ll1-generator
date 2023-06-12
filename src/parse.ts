import LL1ParseError from "./errors/LL1ParseError";
import generateParseTable from "./generateTable";
import { EMPTY_STRING, END_OF_INPUT } from "./symbols";
import type {
  CFGrammar,
  GrammarSymbol,
  ParseTable,
  ParseTreeNode,
} from "./types";
import { makeNode, isGrammarSymbol, isNonTerminal, nonTerminal } from "./util";

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
  const root = makeNode(nonTerminal(G.startingSymbol));
  const stack: Array<Symbol | ParseTreeNode> = [END_OF_INPUT, root];
  const input = [...tokens, END_OF_INPUT];
  let inputIndex = 0;
  while (stack[stack.length - 1] !== END_OF_INPUT) {
    const stackTop = stack[stack.length - 1] as ParseTreeNode;
    const currentToken = input[inputIndex];
    // Element at the top of stack is a non-terminal.
    // Check to see if there is a prediction in table. If
    // there is, apply it and change the stack. If not, throw an error.
    if (isNonTerminal(stackTop.value)) {
      const prediction =
        parseTable[(stackTop.value as GrammarSymbol).value][currentToken];
      if (prediction === null) {
        const errorMsg =
          currentToken === END_OF_INPUT
            ? "Unexpected end of input"
            : `Unexpected token '${String(currentToken)}'`;
        throw new LL1ParseError(errorMsg);
      }
      const nodes = prediction.map((symbol) => makeNode(symbol));
      stackTop.children.push(...nodes);
      stack.pop();
      // If the production isn't an epsilon-rule, then add it (reversed) to the stack.
      if (!(prediction.length === 1 && prediction[0] === EMPTY_STRING)) {
        stack.push(...nodes.reverse());
      }
    } else {
      const stackTopValue = isGrammarSymbol(stackTop.value)
        ? (stackTop.value as GrammarSymbol).value
        : stackTop;
      if (stackTopValue !== currentToken) {
        let errorMsg = "";
        if (
          typeof currentToken === "string" &&
          typeof stackTopValue === "string"
        ) {
          errorMsg = `Expected ${stackTop} but got ${currentToken}!`;
        } else if (typeof currentToken === "symbol") {
          errorMsg = "Unexpected end of input";
        } else {
          errorMsg = `Unexpected token '${currentToken}'`;
        }
        throw new LL1ParseError(errorMsg);
      }
      stack.pop();
      inputIndex += 1;
    }
  }
  return root;
}
