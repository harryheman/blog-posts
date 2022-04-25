import { parse } from './parser'
import { tokenize } from './tokenizer'
import { transformer } from './transformer'
import {
  ExpressionNode,
  ProcStatementNode,
  StatementNode
} from './types/parser'
import { Environment, Runtime } from './types/runtime'
import { TransformedProgram } from './types/transformer'

const applyOperator = (operator: string, left: number, right: number) => {
  switch (operator) {
    case '+':
      return left + right
    case '-':
      return left - right
    case '*':
      return left * right
    case '/':
      return left / right
    case '==':
      return left === right ? 1 : 0
    case '>':
      return left > right ? 1 : 0
    case '<':
      return left < right ? 1 : 0
    case '&&':
      return left && right
  }
  throw new Error(`Unknown binary operator ${operator}`)
}

const executeProc = (
  node: ProcStatementNode,
  env: Environment,
  program: TransformedProgram,
  args?: number[]
) => {
  const symbols = new Map(
    // `args` может иметь значение `undefined`
    node.args.map((arg, index) => [arg.value, args![index]])
  )

  const evaluateExpression = (expression: ExpressionNode): number => {
    switch (expression.type) {
      case 'numberLiteral':
        return expression.value
      case 'binaryExpression':
        return applyOperator(
          expression.operator,
          evaluateExpression(expression.left),
          evaluateExpression(expression.right)
        )
      case 'identifier':
        return symbols.get(expression.value) as number
    }
  }

  const executeStatements = (statements: StatementNode[]) => {
    statements.forEach((statement) => {
      switch (statement.type) {
        case 'printStatement':
          env.print(evaluateExpression(statement.expression))
          break
        case 'variableDeclaration':
          symbols.set(statement.name, evaluateExpression(statement.initializer))
          break
        case 'variableAssignment':
          symbols.set(statement.name, evaluateExpression(statement.value))
          break
        case 'whileStatement':
          while (evaluateExpression(statement.expression)) {
            executeStatements(statement.statements)
          }
          break
        case 'ifStatement':
          if (evaluateExpression(statement.expression)) {
            executeStatements(statement.consequent)
          } else {
            executeStatements(statement.alternate)
          }
          break
        case 'callStatement':
          if (statement.name === 'setpixel') {
            const x = evaluateExpression(statement.args[0])
            const y = evaluateExpression(statement.args[1])
            const color = evaluateExpression(statement.args[2])
            env.display[y * 100 + x] = color
          } else {
            const procName = statement.name
            const argValues = statement.args.map((arg) =>
              evaluateExpression(arg)
            )
            const proc = program.find(
              (f) => f.name === procName
            ) as ProcStatementNode
            executeProc(proc, env, program, argValues)
          }
          break
      }
    })
  }

  executeStatements(node.statements)
}

export const runtime: Runtime = async (src, env) => () => {
  const tokens = tokenize(src)
  // console.log(tokens)

  const program = parse(tokens)
  // console.log(program)

  const transformedProgram = transformer(program)
  // console.log(transformedProgram)

  const main = transformedProgram.find(
    (f) => f.name === 'main'
  ) as ProcStatementNode

  executeProc(main, env, transformedProgram)
}
