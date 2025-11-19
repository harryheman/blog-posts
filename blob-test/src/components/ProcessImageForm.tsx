import { useState } from 'react'
import { processImageInChunks } from '../utils'

export default function ProcessImageForm() {
  const [file, setFile] = useState<File>()
  const [info, setInfo] = useState({
    current: 0,
    total: 0,
    percentage: 0,
  })
  const [src, setSrc] = useState<string>()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (src) {
      URL.revokeObjectURL(src)
      setSrc(undefined)
    }
    if (file) {
      const results = await processImageInChunks(file, undefined, setInfo)
      const buffer = results.map((r) => r.result).flat()
      const blob = new Blob(buffer, {
        type: file.type,
      })
      const url = URL.createObjectURL(blob)
      setSrc(url)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setFile(file)
    }
  }

  return (
    <>
      <form onSubmit={handleSubmit}>
        <input
          type='file'
          name='file'
          onChange={handleChange}
          accept='image/*'
        />
        <button>Process</button>
      </form>
      <div>
        <p>Total chunks: {info.total}</p>
        <p>Current chunk: {info.current}</p>
        <label
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 8,
          }}
        >
          <progress value={info.percentage} max={100} /> {info.percentage}%
        </label>
      </div>
      <img src={src} alt='' style={{ maxWidth: '100%', marginTop: 16 }} />
    </>
  )
}
