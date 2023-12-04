function calculateAverageTime(fn, n) {
  let totalTime = 0

  for (let i = 0; i < n; i++) {
    const start = performance.now()
    fn()
    const time = performance.now() - start
    totalTime += time
  }

  const averageTime = totalTime / n
  return averageTime
}

function longRunningFunction(n) {
  let result = 0

  for (let i = 0; i < n; i++) {
    result += i
  }

  return result
}

function main() {
  const startJS = performance.now()
  const resultJS = longRunningFunction(100_000_000)
  console.log('[JS] Результат:', resultJS)
  const timeJS = performance.now() - startJS
  console.log('[JS] Время:', timeJS)

  // return

  let startWasm = performance.now()
  // https://developer.mozilla.org/en-US/docs/WebAssembly/JavaScript_interface/instantiateStreaming_static
  WebAssembly.instantiateStreaming(
    fetch('http://localhost:3000/rust_code_bg.wasm'),
  ).then((obj) => {
    const { long_running_function } = obj.instance.exports
    const resultWasm = long_running_function(BigInt(100_000_000))
    console.log('[WASM] Результат:', Number(resultWasm))
    const timeWasm = performance.now() - startWasm
    console.log('[WASM] Время:', timeWasm)
    console.log('Разница:', (timeJS / timeWasm).toFixed(2))

    const averageTimeJS = calculateAverageTime(function () {
      longRunningFunction(100_000_000)
    }, 100)
    const averageTimeWasm = calculateAverageTime(function () {
      long_running_function(BigInt(100_000_000))
    }, 100)
    console.log('[JS] Среднее время:', averageTimeJS)
    console.log('[WASM] Среднее время:', averageTimeWasm)
    console.log('Разница:', (averageTimeJS / averageTimeWasm).toFixed(2))
  })
}
main()
