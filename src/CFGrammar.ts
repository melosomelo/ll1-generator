export default class CFGrammar {
  private _startingSymbol: string;
  private _terminals: Set<string>;
  private _nonTerminals: Set<string>;
  private _productions: Set<CFProduction>;
  public constructor(
    startingSymbol: string,
    terminals: Set<string>,
    nonTerminals: Set<string>,
    productions: Set<CFProduction>
  ) {
    this._startingSymbol = startingSymbol;
    this._terminals = terminals;
    this._nonTerminals = nonTerminals;
    this._productions = productions;
  }

  public get terminals(): Set<string> {
    return new Set(this._terminals);
  }

  public get nonTerminals(): Set<string> {
    return new Set(this._nonTerminals);
  }

  public get startingSymbol(): string {
    return this._startingSymbol;
  }

  public get productions(): Set<CFProduction> {
    return new Set(this._productions);
  }
}
