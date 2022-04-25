import { Token } from './tokenizer'

export interface Parser {
  (tokens: Token[]): Program
}

export interface ProgramNode {
  type: string
}

export type Operator = '+' | '-' | '/' | '*' | '==' | '>' | '<' | '&&'

export type ExpressionNode =
  | NumberLiteralNode
  | BinaryExpressionNode
  | IdentifierNode

export type StatementNode =
  | PrintStatementNode
  | VariableDeclarationNode
  | VariableAssignmentNode
  | WhileStatementNode
  | CallStatementNode
  | IfStatementNode
  | ProcStatementNode

export type Program = StatementNode[]

export interface VariableDeclarationNode extends ProgramNode {
  type: 'variableDeclaration'
  name: string
  initializer: ExpressionNode
}

export interface VariableAssignmentNode extends ProgramNode {
  type: 'variableAssignment'
  name: string
  value: ExpressionNode
}

export interface NumberLiteralNode extends ProgramNode {
  type: 'numberLiteral'
  value: number
}

export interface IdentifierNode extends ProgramNode {
  type: 'identifier'
  value: string
}

export interface BinaryExpressionNode extends ProgramNode {
  type: 'binaryExpression'
  left: ExpressionNode
  right: ExpressionNode
  operator: Operator
}

export interface PrintStatementNode extends ProgramNode {
  type: 'printStatement'
  expression: ExpressionNode
}

export interface CallStatementNode extends ProgramNode {
  type: 'callStatement'
  name: string
  args: ExpressionNode[]
}

export interface WhileStatementNode extends ProgramNode {
  type: 'whileStatement'
  expression: ExpressionNode
  statements: StatementNode[]
}

export interface ProcStatementNode extends ProgramNode {
  type: 'procStatement'
  name: string
  args: IdentifierNode[]
  statements: StatementNode[]
}

export interface IfStatementNode extends ProgramNode {
  type: 'ifStatement'
  expression: ExpressionNode
  consequent: StatementNode[]
  alternate: StatementNode[]
}

export interface ParserStep<T extends ProgramNode> {
  (): T
}
