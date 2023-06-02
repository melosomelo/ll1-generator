export default class ParseTableGenerator {
  private nullableSymbols = new Set<string>();
  private firsts = new Map<string, Set<string>>();
  private follows = new Map<string, Set<string>>();

  public constructor(G: CFGrammar) {
    this.validateGrammar(G);
  }

  public generateTable(): ParseTable {
    return {};
  }

  private validateGrammar(G: CFGrammar): void {
    G.forEach((rule, i) => {
      if (rule[0].type === "TERMINAL")
        throw new TypeError(
          `Invalid context-free grammar. Production number ${i} has a terminal on its left-hand side.`
        );
      if (rule[0].type === "EMPTY")
        throw new TypeError(
          `Invalid grammar. Production number ${i} has empty string on its left-hand side.`
        );
    });
  }
}
