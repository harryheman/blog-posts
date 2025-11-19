import { useState } from 'react'
import { compressImage, type CompressImageOptions } from '../utils'

const defaultOptions: CompressImageOptions = {
  maxWidth: 1920,
  maxHeight: 1080,
  quality: 0.8,
}

export default function CompressImageForm() {
  const [file, setFile] = useState<File>()
  const [src, setSrc] = useState<string>()
  const [compressedSize, setCompressedSize] = useState(0)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (src) {
      URL.revokeObjectURL(src)
      setSrc(undefined)
    }
    if (file) {
      const formData = new FormData(e.target as HTMLFormElement)
      const options = Object.fromEntries(formData.entries())
      const blob = await compressImage(file, {
        maxWidth: Number(options.maxWidth),
        maxHeight: Number(options.maxHeight),
        quality: Number(options.quality),
      })
      setCompressedSize(blob.size)
      const url = URL.createObjectURL(blob)
      setSrc(url)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setFile(file)
      setCompressedSize(0)
    }
  }

  const fileSize = file?.size || 0

  return (
    <>
      <input type='file' onChange={handleChange} accept='image/*' />
      <form
        onSubmit={handleSubmit}
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'start',
          gap: 8,
          marginTop: 8,
        }}
      >
        <label>
          Max width{' '}
          <input
            type='number'
            name='maxWidth'
            defaultValue={defaultOptions.maxWidth}
          />
        </label>
        <label>
          Max height{' '}
          <input
            type='number'
            name='maxHeight'
            defaultValue={defaultOptions.maxHeight}
          />
        </label>
        <label>
          Quality{' '}
          <input
            type='number'
            name='quality'
            defaultValue={defaultOptions.quality}
            min={0}
            max={1}
            step={0.1}
          />
        </label>

        <button>Compress</button>
      </form>
      <div>
        <p>Original size: {(fileSize / 1024).toFixed(2)} KB</p>
        <p>Compressed size: {(compressedSize / 1024).toFixed(2)} KB</p>
        <p>
          Compressed size:{' '}
          {compressedSize && fileSize
            ? Math.round((1 - compressedSize / fileSize) * 100)
            : 0}
          %
        </p>
      </div>
      <img src={src} alt='' style={{ marginTop: 16 }} />
    </>
  )
}
