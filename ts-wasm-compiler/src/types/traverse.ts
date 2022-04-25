import { ExpressionNode } from './parser'

export interface Traverse {
  (nodes: ExpressionNode[] | ExpressionNode, visitor: Visitor): void
}

export interface Visitor {
  (node: ExpressionNode): void
}
