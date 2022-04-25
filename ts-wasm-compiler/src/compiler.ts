import { emitter } from './emitter'
import { parse } from './parser'
import { tokenize } from './tokenizer'
import { transformer } from './transformer'
import { Compiler } from './types/compiler'
import { Runtime } from './types/runtime'

export const compile: Compiler = (src) => {
  const tokens = tokenize(src)
  // console.log(tokens)

  const ast = parse(tokens)
  // console.log(ast)

  const transformedAst = transformer(ast)
  // console.log(transformedAst)

  const wasm = emitter(transformedAst)
  // console.log(wasm)

  return wasm
}

export const runtime: Runtime = async (src, env) => {
  const wasm = compile(src)

  const memory = new WebAssembly.Memory({ initial: 1 })

  const result: any = await WebAssembly.instantiate(wasm, {
    // @ts-ignore
    env: { ...env, memory }
  })

  return () => {
    result.instance.exports.run()
    env.display.set(new Uint8Array(memory.buffer, 0, 10000))
  }
}
