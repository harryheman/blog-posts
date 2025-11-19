export default function downloadConfigAsFile(config: unknown) {
  const serialized = JSON.stringify(config, null, 2)
  const blob = new Blob([serialized], {
    type: 'application/json',
  })

  const url = URL.createObjectURL(blob)
  const anchor = document.createElement('a')

  anchor.href = url
  anchor.download = 'config.json'
  document.body.append(anchor)
  anchor.click()
  anchor.remove()

  URL.revokeObjectURL(url)
}
