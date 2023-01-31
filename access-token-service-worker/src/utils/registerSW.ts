export default async function registerSW() {
  try {
    const reg = await navigator.serviceWorker.register('/sw.js')
    console.log(`Registration scope: ${reg.scope}`)
  } catch (e) {
    console.log(e)
  }
}
