import { TransformedProgram } from './transformer'

export interface Emitter {
  (ast: TransformedProgram): Uint8Array
}
