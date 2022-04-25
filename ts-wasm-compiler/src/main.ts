import { runtime as compilerRuntime } from './compiler'
import { runtime as interpreterRuntime } from './interpreter'
import { keywords } from './tokenizer'
import { Runtime, TickFunction } from './types/runtime'
import { Token } from './types/tokenizer'

declare var CodeMirror: any

const compileBtn = document.getElementById('compile') as HTMLButtonElement
const interpretBtn = document.getElementById('interpret') as HTMLButtonElement
const code$ = document.getElementById('code') as HTMLTextAreaElement
const output$ = document.getElementById('output') as HTMLTextAreaElement
const canvas$ = document.getElementById('canvas') as HTMLCanvasElement

// быстрое и грязное масштабирование данных изображения (imageData)
// https://stackoverflow.com/questions/3448347/how-to-scale-an-imagedata-in-html-canvas
const scaleImgData = (
  imgData: ImageData,
  scale: number,
  ctx: CanvasRenderingContext2D
) => {
  const scaled = ctx.createImageData(
    imgData.width * scale,
    imgData.height * scale
  )
  const subLine = ctx.createImageData(scale, 1).data
  for (let row = 0; row < imgData.height; row++) {
    for (let col = 0; col < imgData.width; col++) {
      const srcPixel = imgData.data.subarray(
        (row * imgData.width + col) * 4,
        (row * imgData.width + col) * 4 + 4
      )
      for (let x = 0; x < scale; x++) subLine.set(srcPixel, x * 4)
      for (let y = 0; y < scale; y++) {
        const destRow = row * scale + y
        const destCol = col * scale
        scaled.data.set(subLine, (destRow * scaled.width + destCol) * 4)
      }
    }
  }
  return scaled
}

CodeMirror.defineSimpleMode('simplemode', {
  start: [
    {
      regex: new RegExp(`(${keywords.join('|')})`),
      token: 'keyword'
    },
    {
      regex: /0x[a-f\d]+|[-+]?(?:\.\d+|\d+\.?\d*)(?:e[_+]?\d+)?/i,
      token: 'number'
    },
    {
      regex: /[-+\/*=<>!]+/,
      token: 'operator'
    },
    {
      regex: /[a-z$][\w$]*/,
      token: 'variable'
    }
  ]
})

const editor = CodeMirror.fromTextArea(code$, {
  mode: 'simplemode',
  theme: 'abcdef',
  lineNumbers: true
})

const logMsg = (msg: string | number) =>
  (output$.value = output$.value + msg + '\n')

let marker: any

const markError = (token: Token) => {
  marker = editor.markText(
    { line: token.line, ch: token.char },
    { line: token.line, ch: token.char! + token.value.length },
    { className: 'error' }
  )
}

const updateCanvas = (display: Uint8Array) => {
  const ctx = canvas$.getContext('2d') as CanvasRenderingContext2D
  const imgData = ctx.createImageData(100, 100)
  for (let i = 0; i < 100 * 100; i++) {
    imgData.data[i * 4] = display[i]
    imgData.data[i * 4 + 1] = display[i]
    imgData.data[i * 4 + 2] = display[i]
    imgData.data[i * 4 + 3] = 255
  }
  const data = scaleImgData(imgData, 3, ctx)
  ctx.putImageData(data, 0, 0)
}

const run = async (runtime: Runtime) => {
  if (marker) {
    marker.clear()
  }

  let tickFn: TickFunction

  try {
    const display = new Uint8Array(10000)

    tickFn = await runtime(editor.getValue(), {
      print: logMsg,
      display
    })

    output$.value = ''
    logMsg('Executing...')
    const start = performance.now()

    tickFn()
    updateCanvas(display)

    interpretBtn.classList.remove('active')
    compileBtn.classList.remove('active')

    const time = performance.now() - start
    logMsg(`Done in ${time.toFixed()} ms`)
  } catch (e: any) {
    logMsg(e.message)
    markError(e.token)
  }
}

interpretBtn.onclick = async () => {
  interpretBtn.classList.add('active')
  compileBtn.classList.remove('active')
  await run(interpreterRuntime)
}

compileBtn.onclick = async () => {
  compileBtn.classList.add('active')
  interpretBtn.classList.remove('active')
  await run(compilerRuntime)
}
