import { ProcStatementNode, Program } from './types/parser'
import { ASTTransformer } from './types/transformer'

export const transformer: ASTTransformer = (ast: Program) => {
  // имеется ли у нас основной `proc`?
  if (!ast.find((a) => a.type === 'procStatement' && a.name === 'main')) {
    // если нет, собираем все "свободные" инструкции и оборачиваем их в основной `proc`
    const freeStatements = ast.filter((a) => a.type !== 'procStatement')
    const mainProc: ProcStatementNode = {
      type: 'procStatement',
      name: 'main',
      args: [],
      statements: freeStatements
    }

    ast = [mainProc, ...ast.filter((a) => a.type === 'procStatement')]
  }

  return ast.map((a) => a as ProcStatementNode)
}
