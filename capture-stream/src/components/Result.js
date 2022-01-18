import { useStore } from 'App'

export function Result() {
  const { result } = useStore()

  if (!result) return null

  const url = URL.createObjectURL(result)

  return (
    <div className='container result'>
      <video src={url} controls></video>
      <a href={url} download={`${Date.now()}.webm`}>
        Download
      </a>
    </div>
  )
}
