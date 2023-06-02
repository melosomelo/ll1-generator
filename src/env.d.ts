interface GrammarSymbol {
  type: "TERMINAL" | "NONTERMINAL";
  value: string;
}

type RHSSymbol = GrammarSymbol | Symbol;

type CFProduction = [GrammarSymbol, Array<RHSSymbol>];

interface CFGrammar {
  productions: Array<CFProduction>;
  startingSymbol: string;
}

type ParseTable = Record<string, Record<string, Array<RHSSymbol>>>;
