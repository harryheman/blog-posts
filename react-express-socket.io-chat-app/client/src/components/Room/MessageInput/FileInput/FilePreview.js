import useStore from 'hooks/useStore'
import { useEffect, useState } from 'react'
import { AiOutlineClose } from 'react-icons/ai'

export default function FilePreview() {
  const { file, setFile } = useStore(({ file, setFile }) => ({ file, setFile }))
  const [src, setSrc] = useState()
  const [type, setType] = useState()

  useEffect(() => {
    if (file) {
      setSrc(URL.createObjectURL(file))
      setType(file.type.split('/')[0])
    }
  }, [file])

  let element

  switch (type) {
    case 'image':
      element = <img src={src} alt={file.name} />
      break
    case 'audio':
      element = <audio src={src} controls></audio>
      break
    case 'video':
      element = <video src={src} controls></video>
      break
    default:
      element = null
      break
  }

  return (
    <div className='container preview'>
      {element}
      <button type='button' className='btn close' onClick={() => setFile(null)}>
        <AiOutlineClose className='icon close' />
      </button>
    </div>
  )
}
