type GrammarSymbolType = "TERMINAL" | "NON-TERMINAL" | "EMPTY";

interface GrammarSymbol {
  type: GrammarSymbolType;
  value: string;
}

type CFProduction = [GrammarSymbol, Array<GrammarSymbol>];

type CFGrammar = Array<CFProduction>;

type ParseTable = Record<string, Record<string, Array<GrammarSymbol>>>;
