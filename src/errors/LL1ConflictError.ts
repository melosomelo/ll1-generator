export default class LL1ConflictError extends Error {
  public nonTerminal: string;
  public terminal: string | Symbol;
  public currentRhs: Array<RHSSymbol>;
  public newRhs: Array<RHSSymbol>;
  constructor(
    nonTerminal: string,
    terminal: string | Symbol,
    currentRhs: Array<RHSSymbol>,
    newRhs: Array<RHSSymbol>
  ) {
    super(
      `LL(1) conflict in grammar. Entry (${nonTerminal},${terminal}) was already set previously.
       This may happen because:
        1. There is another production ${nonTerminal} -> β such that ${terminal} is in First(β).
        2. ${terminal} is in Follow(${nonTerminal}) and there is another production 
           ${nonTerminal} -> β such that the empty string is in First(β).
        Check if your grammar isn't left-recursive and that it is left-factored.`
    );
    this.nonTerminal = nonTerminal;
    this.terminal = terminal;
    this.currentRhs = currentRhs;
    this.newRhs = newRhs;
  }
}
