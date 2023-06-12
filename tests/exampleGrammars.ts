import buildGrammar from "../src/buildGrammar";
import { EMPTY_STRING, nonTerminal, terminal } from "../src/symbols";

export const emptyGrammar = buildGrammar().setStartingSymbol("A").build();

export const emptyLanguageGrammar = buildGrammar()
  .setStartingSymbol("A")
  .addProduction("A", [EMPTY_STRING])
  .build();

// taken from parsing techniques pg.240
export const grammarWithoutEpsilonRules = buildGrammar()
  .setStartingSymbol("S")
  .addProduction("S", [nonTerminal("F"), nonTerminal("S")])
  .addProduction("S", [nonTerminal("Q")])
  .addProduction("S", [
    terminal("("),
    nonTerminal("S"),
    terminal(")"),
    nonTerminal("S"),
  ])
  .addProduction("F", [terminal("!"), terminal("STRING")])
  .addProduction("Q", [terminal("?"), terminal("STRING")])
  .build();

export const grammarWithoutEpsilonRules2 = buildGrammar()
  .setStartingSymbol("A")
  .addProduction("A", [terminal("a"), nonTerminal("A")])
  .addProduction("A", [nonTerminal("B")])
  .addProduction("B", [terminal("b"), nonTerminal("B")])
  .addProduction("B", [terminal("c")])
  .build();

// taken from Parsing Techniques pg.238
export const grammarWithoutEpsilonRules3 = buildGrammar()
  .setStartingSymbol("S")
  .addProduction("S", [terminal("a"), nonTerminal("B")])
  .addProduction("B", [terminal("b")])
  .addProduction("B", [terminal("a"), nonTerminal("B"), terminal("b")])
  .build();

// taken from the 'Dragon Book' pg.225
export const arithmeticExpressionGrammar = buildGrammar()
  .setStartingSymbol("E")
  .addProduction("E", [nonTerminal("T"), nonTerminal("E'")])
  .addProduction("E'", [terminal("+"), nonTerminal("T"), nonTerminal("E'")])
  .addProduction("E'", [EMPTY_STRING])
  .addProduction("T", [nonTerminal("F"), nonTerminal("T'")])
  .addProduction("T'", [terminal("*"), nonTerminal("F"), nonTerminal("T'")])
  .addProduction("T'", [EMPTY_STRING])
  .addProduction("F", [terminal("("), nonTerminal("E"), terminal(")")])
  .addProduction("F", [terminal("id")])
  .build();

export const luaIfStatement = buildGrammar()
  .setStartingSymbol("<if_statement>")
  .addProduction("<if_statement>", [
    terminal("if"),
    terminal("boolean_exp"),
    terminal("then"),
    terminal("statements"),
    nonTerminal("<elseif>"),
    nonTerminal("<else>"),
    terminal("end"),
  ])
  .addProduction("<elseif>", [
    terminal("elseif"),
    terminal("boolean_exp"),
    terminal("then"),
    terminal("statements"),
    nonTerminal("<elseif>"),
  ])
  .addProduction("<elseif>", [EMPTY_STRING])
  .addProduction("<else>", [EMPTY_STRING])
  .addProduction("<else>", [terminal("else"), terminal("statements")])
  .build();
