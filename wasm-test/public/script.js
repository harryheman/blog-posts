const logC = document.querySelector('.log-c')
const logJS = document.querySelector('.log-js')
const logComparison = document.querySelector('.log-comparison')

// let fibC

// async function loadWasmOld(url) {
//   const response = await fetch(url)
//   const buffer = await response.arrayBuffer()
//   const module = await WebAssembly.compile(buffer)
//   return new WebAssembly.Instance(module)
// }

// async function initFibC() {
//   const instance = await loadWasmOld('http://localhost:5000/fib.wasm')
//   fibC = instance.exports._Z3fibi
// }

async function loadWasmNew(url, exportedFn) {
  const fetchPromise = fetch(url)
  const { /*module,*/ instance } = await WebAssembly.instantiateStreaming(
    fetchPromise
  )
  return instance.exports[exportedFn]
}

function fibJS(n) {
  if (n < 2) return n
  return fibJS(n - 1) + fibJS(n - 2)
}

function howLong(fn, ...args) {
  const start = performance.now()
  fn(...args)
  const timeTaken = ~~(performance.now() - start)
  return timeTaken
}

async function run() {
  const fibC = await loadWasmNew('http://localhost:5000/fib.wasm', '_Z3fibi')

  const fibCTime = howLong(fibC, 42)
  logC.innerHTML = `На выполнение C++-кода потребовалось <b>${fibCTime}</b> мс`

  const fibJSTime = howLong(fibJS, 42)
  logJS.innerHTML = `На выполнение JS-кода потребовалось <b>${fibJSTime}</b> мс`

  const differenceInMs = fibJSTime - fibCTime
  const perfomancePercent = ~~(100 - (fibCTime / fibJSTime) * 100)
  logComparison.innerHTML = `Код на С++ выполнился быстрее кода на JS на <i>${differenceInMs}</i> мс,<br /> что дает прирост в производительности в размере <b>${perfomancePercent}%</b>`
}
run()
