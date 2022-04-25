import { ProcStatementNode, Program } from './parser'

export type TransformedProgram = ProcStatementNode[]

export interface ASTTransformer {
  (ast: Program): TransformedProgram
}
