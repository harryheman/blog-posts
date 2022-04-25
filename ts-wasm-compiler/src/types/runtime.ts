export interface Runtime {
  (src: string, env: Environment): Promise<TickFunction>
}

export interface TickFunction {
  (): void
}

export interface Environment {
  print: PrintFunction
  display: Uint8Array
}

interface PrintFunction {
  (output: string | number): void
}
