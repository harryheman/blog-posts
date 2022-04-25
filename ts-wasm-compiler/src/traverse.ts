import { ExpressionNode } from './types/parser'
import { Traverse } from './types/traverse'

export const traverse: Traverse = (nodes, visitor) => {
  nodes = Array.isArray(nodes) ? nodes : [nodes]
  nodes.forEach((node) => {
    Object.keys(node).forEach((prop) => {
      const value = node[prop as keyof ExpressionNode]
      const valueAsArray: string[] = Array.isArray(value) ? value : [value]
      valueAsArray.forEach((childNode: any) => {
        if (typeof childNode.type === 'string') {
          traverse(childNode, visitor)
        }
      })
    })
    visitor(node)
  })
}
