import { encodeString, ieee754, signedLEB128, unsignedLEB128 } from './encoding'
import { traverse } from './traverse'
import { Emitter } from './types/emitter'
import {
  ExpressionNode,
  ProcStatementNode,
  StatementNode
} from './types/parser'
import { TransformedProgram } from './types/transformer'

const flatten = (arr: any[]) => [].concat.apply([], arr)

// https://webassembly.github.io/spec/core/binary/modules.html#sections
enum Section {
  custom = 0,
  type = 1,
  import = 2,
  func = 3,
  table = 4,
  memory = 5,
  global = 6,
  export = 7,
  start = 8,
  element = 9,
  code = 10,
  data = 11
}

// https://webassembly.github.io/spec/core/binary/types.html
enum Valtype {
  i32 = 0x7f,
  f32 = 0x7d
}

// https://webassembly.github.io/spec/core/binary/types.html#binary-blocktype
enum Blocktype {
  void = 0x40
}

// https://webassembly.github.io/spec/core/binary/instructions.html
enum Opcodes {
  block = 0x02,
  loop = 0x03,
  br = 0x0c,
  br_if = 0x0d,
  end = 0x0b,
  call = 0x10,
  get_local = 0x20,
  set_local = 0x21,
  i32_store_8 = 0x3a,
  i32_const = 0x41,
  f32_const = 0x43,
  i32_eqz = 0x45,
  i32_eq = 0x46,
  f32_eq = 0x5b,
  f32_lt = 0x5d,
  f32_gt = 0x5e,
  i32_and = 0x71,
  f32_add = 0x92,
  f32_sub = 0x93,
  f32_mul = 0x94,
  f32_div = 0x95,
  i32_trunc_f32_s = 0xa8
}

const binaryOpcode = {
  '+': Opcodes.f32_add,
  '-': Opcodes.f32_sub,
  '*': Opcodes.f32_mul,
  '/': Opcodes.f32_div,
  '==': Opcodes.f32_eq,
  '>': Opcodes.f32_gt,
  '<': Opcodes.f32_lt,
  '&&': Opcodes.i32_and
}

// http://webassembly.github.io/spec/core/binary/modules.html#export-section
enum ExportType {
  func = 0x00,
  table = 0x01,
  mem = 0x02,
  global = 0x03
}

// http://webassembly.github.io/spec/core/binary/types.html#function-types
const functionType = 0x60

const emptyArray = 0x0

// https://webassembly.github.io/spec/core/binary/modules.html#binary-module
const magicModuleHeader = [0x00, 0x61, 0x73, 0x6d]
const moduleVersion = [0x01, 0x00, 0x00, 0x00]

// https://webassembly.github.io/spec/core/binary/conventions.html#binary-vec
// векторы кодируются с помощью их длины, за которой следует последовательность элементов
const encodeVector = (data: any[]) => [
  ...unsignedLEB128(data.length),
  ...flatten(data)
]

// https://webassembly.github.io/spec/core/binary/modules.html#code-section
const encodeLocal = (count: number, type: Valtype) => [
  ...unsignedLEB128(count),
  type
]

// https://webassembly.github.io/spec/core/binary/modules.html#sections
// разделы кодируются с помощью их типа, за которым следует содержимое их векторов
const createSection = (sectionType: Section, data: any[]) => [
  sectionType,
  ...encodeVector(data)
]

const codeFromProc = (node: ProcStatementNode, program: TransformedProgram) => {
  const code: number[] = []

  const symbols = new Map<string, number>(
    node.args.map((arg, index) => [arg.value, index])
  )

  const localIndexForSymbol = (name: string) => {
    if (!symbols.has(name)) {
      symbols.set(name, symbols.size)
    }
    return symbols.get(name) as number
  }

  const emitExpression = (node: ExpressionNode) =>
    traverse(node, (node: ExpressionNode) => {
      switch (node.type) {
        case 'numberLiteral':
          code.push(Opcodes.f32_const)
          code.push(...ieee754(node.value))
          break
        case 'identifier':
          code.push(Opcodes.get_local)
          code.push(...unsignedLEB128(localIndexForSymbol(node.value)))
          break
        case 'binaryExpression':
          code.push(binaryOpcode[node.operator])
          break
      }
    })

  const emitStatements = (statements: StatementNode[]) =>
    statements.forEach((statement) => {
      switch (statement.type) {
        case 'printStatement':
          emitExpression(statement.expression)
          code.push(Opcodes.call)
          code.push(...unsignedLEB128(0))
          break
        case 'variableDeclaration':
          emitExpression(statement.initializer)
          code.push(Opcodes.set_local)
          code.push(...unsignedLEB128(localIndexForSymbol(statement.name)))
          break
        case 'variableAssignment':
          emitExpression(statement.value)
          code.push(Opcodes.set_local)
          code.push(...unsignedLEB128(localIndexForSymbol(statement.name)))
          break
        case 'whileStatement':
          // внешний блок
          code.push(Opcodes.block)
          code.push(Blocktype.void)
          // внутренний цикл
          code.push(Opcodes.loop)
          code.push(Blocktype.void)
          // вычисляем выражение `while`
          emitExpression(statement.expression)
          code.push(Opcodes.i32_eqz)
          // br_if $label0
          code.push(Opcodes.br_if)
          code.push(...signedLEB128(1))
          // вложенная логика
          emitStatements(statement.statements)
          // br $label1
          code.push(Opcodes.br)
          code.push(...signedLEB128(0))
          // конец цикла
          code.push(Opcodes.end)
          // конец блока
          code.push(Opcodes.end)
          break
        case 'ifStatement':
          // блок `if`
          code.push(Opcodes.block)
          code.push(Blocktype.void)
          // вычисляем выражение `if`
          emitExpression(statement.expression)
          code.push(Opcodes.i32_eqz)
          // br_if $label0
          code.push(Opcodes.br_if)
          code.push(...signedLEB128(0))
          // вложенная логика
          emitStatements(statement.consequent)
          // конец блока
          code.push(Opcodes.end)

          // блок `else`
          code.push(Opcodes.block)
          code.push(Blocktype.void)
          // вычисляем выражение `if`
          emitExpression(statement.expression)
          code.push(Opcodes.i32_const)
          code.push(...signedLEB128(1))
          code.push(Opcodes.i32_eq)
          // br_if $label0
          code.push(Opcodes.br_if)
          code.push(...signedLEB128(0))
          // вложенная логика
          emitStatements(statement.alternate)
          // конец блока
          code.push(Opcodes.end)
          break
        case 'callStatement':
          if (statement.name === 'setpixel') {
            // вычисляем и кешируем параметры `setpixel`
            emitExpression(statement.args[0])
            code.push(Opcodes.set_local)
            code.push(...unsignedLEB128(localIndexForSymbol('x')))

            emitExpression(statement.args[1])
            code.push(Opcodes.set_local)
            code.push(...unsignedLEB128(localIndexForSymbol('y')))

            emitExpression(statement.args[2])
            code.push(Opcodes.set_local)
            code.push(...unsignedLEB128(localIndexForSymbol('color')))

            // вычисляем отступ (offset) `(x * 100) + y`
            code.push(Opcodes.get_local)
            code.push(...unsignedLEB128(localIndexForSymbol('y')))
            code.push(Opcodes.f32_const)
            code.push(...ieee754(100))
            code.push(Opcodes.f32_mul)

            code.push(Opcodes.get_local)
            code.push(...unsignedLEB128(localIndexForSymbol('x')))
            code.push(Opcodes.f32_add)

            // преобразуем в целое число
            code.push(Opcodes.i32_trunc_f32_s)

            // извлекаем цвет
            code.push(Opcodes.get_local)
            code.push(...unsignedLEB128(localIndexForSymbol('color')))
            code.push(Opcodes.i32_trunc_f32_s)

            // выполняем запись
            code.push(Opcodes.i32_store_8)
            code.push(...[0x00, 0x00]) // выравнивание (align) и отступ
          } else {
            statement.args.forEach((arg) => {
              emitExpression(arg)
            })
            const index = program.findIndex((f) => f.name === statement.name)
            code.push(Opcodes.call)
            code.push(...unsignedLEB128(index + 1))
          }
          break
      }
    })
  emitStatements(node.statements)

  const localCount = symbols.size
  const locals = localCount > 0 ? [encodeLocal(localCount, Valtype.f32)] : []

  return encodeVector([...encodeVector(locals), ...code, Opcodes.end])
}

export const emitter: Emitter = (ast: TransformedProgram) => {
  // тип функции - это вектор, состоящий из параметров и возвращаемого типа
  // в настоящее время `WA` поддерживает только единичное возвращаемое значение
  const printFunctionType = [
    functionType,
    ...encodeVector([Valtype.f32]),
    emptyArray
  ]

  const funcTypes = ast.map((proc) => [
    functionType,
    ...encodeVector(proc.args.map((_) => Valtype.f32)),
    emptyArray
  ])

  // раздел `type` - это вектор из типов функций
  const typeSection = createSection(
    Section.type,
    encodeVector([printFunctionType, ...funcTypes])
  )

  // раздел `function` - это вектор из индексов типов,
  // которые определяют тип каждой функции в разделе `code`
  const funcSection = createSection(
    Section.func,
    encodeVector(ast.map((_, index) => index + 1)) // индекс типа
  )

  // раздел `import` - это вектор импортированных функций
  const printFunctionImport = [
    ...encodeString('env'),
    ...encodeString('print'),
    ExportType.func,
    0x00 // индекс типа
  ]

  const memoryImport = [
    ...encodeString('env'),
    ...encodeString('memory'),
    ExportType.mem,
    // ограничения определяют минимальный размер памяти для одной страницы
    // https://webassembly.github.io/spec/core/binary/types.html#limits
    0x00,
    0x01
  ]

  const importSection = createSection(
    Section.import,
    encodeVector([printFunctionImport, memoryImport])
  )

  // раздел `export` - это вектор экспортируемых функций
  const exportSection = createSection(
    Section.export,
    encodeVector([
      [
        ...encodeString('run'),
        ExportType.func,
        ast.findIndex((a) => a.name === 'main') + 1
      ]
    ])
  )

  // раздел `code` содержит векторы функций
  const codeSection = createSection(
    Section.code,
    encodeVector(ast.map((a) => codeFromProc(a, ast)))
  )

  return Uint8Array.from([
    ...magicModuleHeader,
    ...moduleVersion,
    ...typeSection,
    ...importSection,
    ...funcSection,
    ...exportSection,
    ...codeSection
  ])
}
