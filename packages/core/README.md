# LL1 Generator Core

This package contains the core classes to perform LL(1) parsing operations.
With it, you can:

- [Define context-free grammars in a readable way](#defining-context-free-grammars).
- [Calculate First/Follow sets](#calculating-first-and-follow-sets).
- [Generate parsing tables](#generating-parsing-tables).
- [Generate parsing trees for strings in the language defined by your grammar.](#generating-parsing-trees)

## Defining context-free grammars

The building block of any formal parsing is a formal grammar.
In this library, a formal (context-free) grammar
is defined just as it is in mathematics, with four parts:

```typescript
// Represents a context-free grammar.
interface CFGrammar {
  startingSymbol: string;
  terminals: Set<string>;
  nonTerminals: Set<string>;
  productions: Set<CFProduction>;
}

/**
 * Represents a production from a context-free (CF) grammar.
 * Since a CF grammar has exactly one non-terminal on its left-hand
 * side, then we can represent this as a tuple whose first
 * element is a simple string. The right-hand side, on the
 * other hand, is any sequence of grammar/special symbols.
 */
type CFProduction = [string, Array<RHSSymbol>];

/**
 * Any symbol that can appear on the right-hand side
 * of a grammar production.
 * The JavaScript Symbol type is used to represent special grammatic symbols,
 * such as the empty string and the end of input symbol.
 */
type RHSSymbol = GrammarSymbol | Symbol;

// This type, on the other hand, represents terminal and non-terminal
// symbols, which are explicitly defined when describing the grammar.
interface GrammarSymbol {
  type: "TERMINAL" | "NON_TERMINAL";
  value: string;
}
```

You can define a formal grammar by using object literals, but I personally think that:

- It's cumbersome to add every non-terminal, terminal and productions in a set to then
  construct the grammar.
- It can be error-prone. Some operations defined within this library expect your grammar
  to well-defined (you can't use a non-terminal in a production that isn't defined in
  your `nonTerminals` set, for example). If it isn't, then an error will be thrown.

This is why I also created a special helper type that allows you to describe (and build)
a grammar in a much more readable way. It's called `GrammarBuilder`, and it's super simple
to use:

```typescript
const G = buildGrammar()
  .addProduction("A", [terminal("a"), nonTerminal("A"), nonTerminal("B")])
  .addProduction("A", [EMPTY_STRING])
  .addProduction("B", [terminal("b"), nonTerminal("B")])
  // Must be called before calling build. If not, `build` will throw an error!
  .setStartingSymbol("A")
  .build();
```

The `addProduction` and `setStartingSymbol` methods return the same instance of the `GrammarBuilder`
object that is initialized by the `buildGrammar` entrypoint. The terminals and non-terminals
that you define in your `addProduction` calls are automatically picked up. You finish the
process by calling the `build` function, which returns a `CFGrammar` object.

The `terminal` and `nonTerminal` functions are mere utilities which this library
also exports. You can use object literals to defined `GrammarSymbol`s if you want to.

One thing, the grammar builder **does not** check for repeated productions. Be careful with that,
I haven't tested what may happen if you add repeated productions and then attempt to generate
a parsing table, parsing tree, etc.
