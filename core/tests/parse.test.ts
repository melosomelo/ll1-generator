import { describe, it, expect } from "@jest/globals";
import parse from "../src/parse";
import { EMPTY_STRING } from "../src/symbols";
import * as exampleGrammars from "./exampleGrammars";
import LL1ParseError from "../src/errors/LL1ParseError";
import { makeNode, nonTerminal, terminal } from "../src/util";

describe("parse", () => {
  it("grammar allows empty input string", () => {
    expect(parse([], exampleGrammars.emptyLanguageGrammar)).toEqual(
      makeNode(nonTerminal("A"), makeNode(EMPTY_STRING))
    );
  });

  it("should throw with unexpected token", () => {
    expect(() =>
      parse(["id", "id"], exampleGrammars.arithmeticExpressionGrammar)
    ).toThrow(LL1ParseError);
  });

  it("should throw with unexpected end of input", () => {
    expect(() =>
      parse(["id", "+"], exampleGrammars.arithmeticExpressionGrammar)
    ).toThrow(LL1ParseError);
  });

  it("arithmetic expression with only one id", () => {
    expect(parse(["id"], exampleGrammars.arithmeticExpressionGrammar)).toEqual(
      makeNode(
        nonTerminal("E"),
        makeNode(
          nonTerminal("T"),
          makeNode(nonTerminal("F"), makeNode(terminal("id"))),
          makeNode(nonTerminal("T'"), makeNode(EMPTY_STRING))
        ),
        makeNode(nonTerminal("E'"), makeNode(EMPTY_STRING))
      )
    );
  });

  it("arithmetic expression with two different operations", () => {
    expect(
      parse(
        ["id", "+", "id", "*", "id"],
        exampleGrammars.arithmeticExpressionGrammar
      )
    ).toEqual(
      makeNode(
        nonTerminal("E"),
        makeNode(
          nonTerminal("T"),
          makeNode(nonTerminal("F"), makeNode(terminal("id"))),
          makeNode(nonTerminal("T'"), makeNode(EMPTY_STRING))
        ),
        makeNode(
          nonTerminal("E'"),
          makeNode(terminal("+")),
          makeNode(
            nonTerminal("T"),
            makeNode(nonTerminal("F"), makeNode(terminal("id"))),
            makeNode(
              nonTerminal("T'"),
              makeNode(terminal("*")),
              makeNode(nonTerminal("F"), makeNode(terminal("id"))),
              makeNode(nonTerminal("T'"), makeNode(EMPTY_STRING))
            )
          ),
          makeNode(nonTerminal("E'"), makeNode(EMPTY_STRING))
        )
      )
    );
  });

  it("arithmetic expression between parenthesis", () => {
    expect(
      parse(["(", "id", ")"], exampleGrammars.arithmeticExpressionGrammar)
    ).toEqual(
      makeNode(
        nonTerminal("E"),
        makeNode(
          nonTerminal("T"),
          makeNode(
            nonTerminal("F"),
            makeNode(terminal("(")),
            makeNode(
              nonTerminal("E"),
              makeNode(
                nonTerminal("T"),
                makeNode(nonTerminal("F"), makeNode(terminal("id"))),
                makeNode(nonTerminal("T'"), makeNode(EMPTY_STRING))
              ),
              makeNode(nonTerminal("E'"), makeNode(EMPTY_STRING))
            ),
            makeNode(terminal(")"))
          ),
          makeNode(nonTerminal("T'"), makeNode(EMPTY_STRING))
        ),
        makeNode(nonTerminal("E'"), makeNode(EMPTY_STRING))
      )
    );
  });

  it("arithmetic expression with one operation", () => {
    expect(
      parse(["id", "+", "id"], exampleGrammars.arithmeticExpressionGrammar)
    ).toEqual(
      makeNode(
        nonTerminal("E"),
        makeNode(
          nonTerminal("T"),
          makeNode(nonTerminal("F"), makeNode(terminal("id"))),
          makeNode(nonTerminal("T'"), makeNode(EMPTY_STRING))
        ),
        makeNode(
          nonTerminal("E'"),
          makeNode(terminal("+")),
          makeNode(
            nonTerminal("T"),
            makeNode(nonTerminal("F"), makeNode(terminal("id"))),
            makeNode(nonTerminal("T'"), makeNode(EMPTY_STRING))
          ),
          makeNode(nonTerminal("E'"), makeNode(EMPTY_STRING))
        )
      )
    );
  });
});
