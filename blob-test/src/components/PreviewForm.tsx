import { useRef, useState } from 'react'
import { FilePreviewer } from '../utils'

export default function PreviewForm() {
  const [file, setFile] = useState<File>()
  const containerRef = useRef<HTMLDivElement>(null)
  const previewerRef = useRef<FilePreviewer>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!containerRef.current) return
    if (!previewerRef.current) {
      previewerRef.current = new FilePreviewer(containerRef.current)
    }
    if (file) {
      await previewerRef.current.preview(file)
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
        <input type='file' name='file' onChange={handleChange} />
        <button>Preview</button>
      </form>
      <div ref={containerRef} style={{ marginTop: '16px' }}></div>
    </>
  )
}
