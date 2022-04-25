export interface Tokenizer {
  (input: string): Token[]
}

export type TokenType =
  | 'number'
  | 'keyword'
  | 'whitespace'
  | 'parens'
  | 'operator'
  | 'identifier'
  | 'assignment'

export interface Token {
  type: TokenType
  value: string
  line?: number
  char?: number
}

export interface Matcher {
  (input: string, index: number): Token
}
