export type CompressImageOptions = {
  maxWidth?: number
  maxHeight?: number
  quality?: number
  outputType?: string
}

export default function compressImage(
  file: File,
  options: CompressImageOptions = {},
) {
  const {
    maxWidth = 1980,
    maxHeight = 1080,
    quality = 0.8,
    outputType = file.type,
  } = options

  return new Promise<Blob>((resolve, reject) => {
    const img = new Image()
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')

    if (!ctx) {
      reject(new Error('Canvas 2D context not available'))
      return
    }

    img.onload = () => {
      const { width, height } = fitIntoBox(
        img.width,
        img.height,
        maxWidth,
        maxHeight,
      )

      canvas.width = width
      canvas.height = height
      ctx.drawImage(img, 0, 0, width, height)

      canvas.toBlob(
        (blob) => {
          if (blob) {
            resolve(blob)
            URL.revokeObjectURL(img.src)
          } else {
            reject(new Error('Image compression failed'))
          }
        },
        outputType,
        quality,
      )
    }

    img.onerror = (err) => {
      reject(err)
    }
    img.src = URL.createObjectURL(file)
  })
}

const fitIntoBox = (
  srcWidth: number,
  srcHeight: number,
  maxWidth: number,
  maxHeight: number,
) => {
  let width = srcWidth
  let height = srcHeight

  if (width > maxWidth) {
    height = (height * maxWidth) / width
    width = maxWidth
  }
  if (height > maxHeight) {
    width = (width * maxHeight) / height
    height = maxHeight
  }

  return { width: Math.round(width), height: Math.round(height) }
}
