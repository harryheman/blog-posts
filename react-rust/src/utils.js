export async function loadWasm(url, exportedFn) {
  const fetchPromise = fetch(url)
  const { /*module,*/ instance } = await WebAssembly.instantiateStreaming(
    fetchPromise,
    { imports: { alert: window.alert } }
  )
  console.log(instance)
  // return instance.exports[exportedFn]
}
