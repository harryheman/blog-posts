const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

export default async function processImageInChunks(
  file: File,
  chunkSize = 1024 * 1024, // 1 Мб по умолчанию
  onProgress?: (info: {
    current: number
    total: number
    percentage: number
  }) => void,
) {
  const totalChunks = Math.ceil(file.size / chunkSize)
  const results: { index: number; size: number; result: ArrayBuffer }[] = []

  for (let index = 0; index < totalChunks; index++) {
    const start = index * chunkSize
    const end = Math.min(start + chunkSize, file.size)
    const chunk = file.slice(start, end)

    const result = await readChunk(chunk, index)
    results.push(result)

    if (onProgress) {
      const percentage = Math.round(((index + 1) / totalChunks) * 100)
      onProgress({ current: index + 1, total: totalChunks, percentage })
    }

    await sleep(250)
  }

  return results
}

const readChunk = (
  chunk: Blob,
  index: number,
): Promise<{ index: number; size: number; result: ArrayBuffer }> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()

    reader.onload = (event) => {
      const result = event.target?.result as ArrayBuffer

      resolve({ index, size: chunk.size, result })
    }

    reader.onerror = (error) => {
      reject(error)
    }

    reader.readAsArrayBuffer(chunk)
  })
}
