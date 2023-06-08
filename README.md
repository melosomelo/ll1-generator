# LL1 Generator Core

This package contains the core classes to perform LL(1) table/parse tree generation.
With it, you can:

- Define context-free grammars in a readable way.
- Calculate First/Follow sets.
- Generate parsing tables.
- Generate parsing trees for strings in the language defined by your grammar.

## Defining context-free grammars

A context-free grammar in this library is defined by four parts, like it is in
formal linguistic bibliography. The relevant types used to define a grammar are explained below:

```typescript
interface CFGrammar {
  startingSymbol: string;
  terminals: Set<string>;
  nonTerminals: Set<string>;
  productions: Set<CFProduction>;
}

/**
 * Represents a production from a context-free (CF) grammar.
 * Since a CF grammar has exactly one non-terminal on its left-hand
 * side, we can represent it as a tuple whose first
 * element is a simple string. The right-hand side, on the
 * other hand, is any sequence of grammar/special symbols.
 */
type CFProduction = [string, Array<RHSSymbol>];

/**
 * Any symbol that can appear on the right-hand side
 * of a grammar production.
 * The JavaScript Symbol type is used to represent
 * special grammatic symbols such as the empty string
 * and the end of input.
 */
type RHSSymbol = GrammarSymbol | Symbol;

// Represents terminal and non-terminal characters from grammars.
// This type is used in some contexts rather than simple strings
// to enable the use of uppercase/lowercase letters to define
// both non-terminals and terminals.
interface GrammarSymbol {
  type: "TERMINAL" | "NONTERMINAL";
  value: string;
}
```

You can manually construct an object to define a grammar, but I personally
consider that strategy to be boring and a bit error prone. By error prone I mean
that you may specify a non-terminal in a production and forget to add it to
the `nonTerminals` set. If you attempt to generate parse tables for this
faulty grammar, errors will be thrown.

It's much better to use the `GrammarBuilder` type, which you can access
via the `buildGrammar` function. You can chain the methods `setStartingSymbol`
and `addProduction` to build a context-free grammar in a more readable way.
The symbols you specify in the `addProduction` function are automatically picked up
and added to the correct sets. You finish the process by calling the `build` function.

```typescript
const G = buildGrammar()
  .setStartingSymbol("A") // Mandatory. Calling build() without specifying this will result in an error
  // Symbols A, B and a are automatically put in the correct sets.
  .addProduction("A", [terminal("a"), nonTerminal("A"), nonTerminal("B")])
  .addProduction("B", [EMPTY_STRING])
  .addProduction("A", [EMPTY_STRING])
  .build();
```

The `terminal` and `nonTerminal` functions are mere utilities. You can also use object
literals, if you want. The `EMPTY_STRING` value is a special symbol that represents, you guessed it,
the empty string.
