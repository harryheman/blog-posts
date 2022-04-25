import {
  CallStatementNode,
  ExpressionNode,
  IdentifierNode,
  IfStatementNode,
  Operator,
  Parser,
  ParserStep,
  PrintStatementNode,
  ProcStatementNode,
  StatementNode,
  VariableAssignmentNode,
  VariableDeclarationNode,
  WhileStatementNode
} from './types/parser'
import { Token } from './types/tokenizer'

export class ParseError extends Error {
  token: Token

  constructor(message: string, token: Token) {
    super(message)
    this.token = token
  }
}

const asOperator = (value: string): Operator => value as Operator

export const parse: Parser = (tokens) => {
  const tokenIterator = tokens[Symbol.iterator]()
  let currentToken = tokenIterator.next().value
  let nextToken = tokenIterator.next().value

  const currentTokenIsKeyword = (name: string) =>
    currentToken.value === name && currentToken.type === 'keyword'

  const eatToken = (value?: string) => {
    if (value && value !== currentToken.value) {
      throw new ParseError(
        `Unexpected token value, expected ${value}, received ${currentToken.value}`,
        currentToken
      )
    }
    currentToken = nextToken
    nextToken = tokenIterator.next().value
  }

  const parseExpression: ParserStep<ExpressionNode> = () => {
    let node: ExpressionNode
    switch (currentToken.type) {
      case 'number':
        node = {
          type: 'numberLiteral',
          value: Number(currentToken.value)
        }
        eatToken()
        return node
      case 'identifier':
        node = { type: 'identifier', value: currentToken.value }
        eatToken()
        return node
      case 'parens':
        eatToken('(')
        const left = parseExpression()
        const operator = currentToken.value
        eatToken()
        const right = parseExpression()
        eatToken(')')
        return {
          type: 'binaryExpression',
          left,
          right,
          operator: asOperator(operator)
        }
      default:
        throw new ParseError(
          `Unexpected token type ${currentToken.type}`,
          currentToken
        )
    }
  }

  const parsePrintStatement: ParserStep<PrintStatementNode> = () => {
    eatToken('print')
    return {
      type: 'printStatement',
      expression: parseExpression()
    }
  }

  const parseIfStatement: ParserStep<IfStatementNode> = () => {
    eatToken('if')

    const expression = parseExpression()

    let elseStatements = false
    const consequent: StatementNode[] = []
    const alternate: StatementNode[] = []
    while (!currentTokenIsKeyword('endif')) {
      if (currentTokenIsKeyword('else')) {
        eatToken('else')
        elseStatements = true
      }
      if (elseStatements) {
        alternate.push(parseStatement())
      } else {
        consequent.push(parseStatement())
      }
    }

    eatToken('endif')

    return {
      type: 'ifStatement',
      expression,
      consequent,
      alternate
    }
  }

  const parseWhileStatement: ParserStep<WhileStatementNode> = () => {
    eatToken('while')

    const expression = parseExpression()

    const statements: StatementNode[] = []
    while (!currentTokenIsKeyword('endwhile')) {
      statements.push(parseStatement())
    }

    eatToken('endwhile')

    return {
      type: 'whileStatement',
      expression,
      statements
    }
  }

  const parseVariableAssignment: ParserStep<VariableAssignmentNode> = () => {
    const name = currentToken.value
    eatToken()
    eatToken('=')
    return {
      type: 'variableAssignment',
      name,
      value: parseExpression()
    }
  }

  const parseVariableDeclarationStatement: ParserStep<
    VariableDeclarationNode
  > = () => {
    eatToken('var')
    const name = currentToken.value
    eatToken()
    eatToken('=')
    return {
      type: 'variableDeclaration',
      name,
      initializer: parseExpression()
    }
  }

  const parseCallStatement: ParserStep<CallStatementNode> = () => {
    const name = currentToken.value
    eatToken()

    const args = parseCommaSeparatedList(parseExpression)

    return {
      type: 'callStatement',
      name,
      args
    }
  }

  function parseCommaSeparatedList<T>(fn: () => T): T[] {
    const args: T[] = []
    eatToken('(')
    while (currentToken.value !== ')') {
      args.push(fn())
      if (currentToken.value !== ')') {
        eatToken(',')
      }
    }
    eatToken(')')
    return args
  }

  const parseProcStatement: ParserStep<ProcStatementNode> = () => {
    eatToken('proc')

    const name = currentToken.value
    eatToken()

    const args = parseCommaSeparatedList(() => {
      const arg: IdentifierNode = {
        type: 'identifier',
        value: currentToken.value
      }
      eatToken()
      return arg
    })

    const statements: StatementNode[] = []
    while (!currentTokenIsKeyword('endproc')) {
      statements.push(parseStatement())
    }
    eatToken('endproc')

    return {
      type: 'procStatement',
      name,
      args,
      statements
    }
  }

  const parseStatement: ParserStep<StatementNode> = () => {
    if (currentToken.type === 'keyword') {
      switch (currentToken.value) {
        case 'print':
          return parsePrintStatement()
        case 'var':
          return parseVariableDeclarationStatement()
        case 'while':
          return parseWhileStatement()
        case 'if':
          return parseIfStatement()
        case 'proc':
          return parseProcStatement()
        default:
          throw new ParseError(
            `Unknown keyword ${currentToken.value}`,
            currentToken
          )
      }
    } else if (currentToken.type === 'identifier') {
      if (nextToken.value === '=') {
        return parseVariableAssignment()
      }
      return parseCallStatement()
    } else {
      throw new ParseError(
        `Unknown token type ${currentToken.type}`,
        currentToken
      )
    }
  }

  const nodes: StatementNode[] = []
  while (currentToken) {
    nodes.push(parseStatement())
  }

  return nodes
}
