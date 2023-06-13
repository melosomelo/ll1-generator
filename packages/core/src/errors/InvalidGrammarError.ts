export default class InvalidGrammarError extends Error {
  constructor(msg: string) {
    super(msg);
  }
}
