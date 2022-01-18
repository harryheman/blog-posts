import { useState, useEffect, useRef } from 'react'
import { useSetters } from 'App'

export const VideoSelector = () => {
  const [fileUrl, setFileUrl] = useState()
  const videoRef = useRef()
  const { setVideo } = useSetters()

  useEffect(() => {
    if (fileUrl && videoRef.current) {
      setVideo(videoRef.current)
    }
  }, [fileUrl, setVideo])

  const selectFile = (e) => {
    if (e.target.files.length) {
      const url = URL.createObjectURL(e.target.files[0])
      setFileUrl(url)
    }
  }

  const Input = () => (
    <div className='input video'>
      <label htmlFor='file'>Choose video file</label>
      <input type='file' id='file' accept='video/*' onChange={selectFile} />
    </div>
  )

  const File = () => (
    <div className='container video'>
      <div className='item video'>
        <video src={fileUrl} controls muted ref={videoRef} />
      </div>
    </div>
  )

  return <div className='selector video'>{fileUrl ? <File /> : <Input />}</div>
}
