import { useState, useEffect, useRef } from 'react'
import { useSetters } from 'App'

export const AudioSelector = () => {
  const [fileUrls, setFileUrls] = useState()
  const inputRef = useRef()
  const { setAudio } = useSetters()

  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.click()
    }
  }, [fileUrls])

  const selectFiles = (e) => {
    if (e.target.files.length) {
      const urls = [...e.target.files].map((f) => URL.createObjectURL(f))
      setFileUrls(urls)
    }
  }

  const selectAudio = (e) => {
    setAudio(e.target.nextElementSibling)
  }

  const Input = () => (
    <div className='input audio'>
      <label htmlFor='file'>Choose audio files</label>
      <input
        type='file'
        id='file'
        accept='audio/*'
        multiple
        onChange={selectFiles}
      />
    </div>
  )

  const Files = () => (
    <div className='container audio'>
      <h2>Select audio</h2>
      {fileUrls?.map((u, i) => (
        <div key={i} className='item audio'>
          <input
            type='radio'
            name='audio'
            onChange={selectAudio}
            ref={i === 0 ? inputRef : null}
          />
          <audio src={u} controls />
        </div>
      ))}
    </div>
  )

  return (
    <div className='selector audio'>{fileUrls ? <Files /> : <Input />}</div>
  )
}
