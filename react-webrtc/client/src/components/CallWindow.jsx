import { useState, useEffect, useRef } from 'react'
import { BsCameraVideo, BsPhone } from 'react-icons/bs'
import { FiPhoneOff } from 'react-icons/fi'

export const CallWindow = ({
  remoteSrc,
  localSrc,
  config,
  mediaDevice,
  finishCall
}) => {
  const remoteVideo = useRef()
  const localVideo = useRef()
  const localVideoSize = useRef()
  const [video, setVideo] = useState(config?.video)
  const [audio, setAudio] = useState(config?.audio)

  const [dragging, setDragging] = useState(false)
  const [coords, setCoords] = useState({
    x: 0,
    y: 0
  })

  useEffect(() => {
    const { width, height } = localVideo.current.getBoundingClientRect()
    localVideoSize.current = { width, height }
  }, [])

  useEffect(() => {
    dragging
      ? localVideo.current.classList.add('dragging')
      : localVideo.current.classList.remove('dragging')
  }, [dragging])

  useEffect(() => {
    window.addEventListener('mousemove', onMouseMove)

    return () => {
      window.removeEventListener('mousemove', onMouseMove)
    }
  })

  useEffect(() => {
    if (remoteVideo.current && remoteSrc) {
      remoteVideo.current.srcObject = remoteSrc
    }
    if (localVideo.current && localSrc) {
      localVideo.current.srcObject = localSrc
    }
  }, [remoteSrc, localSrc])

  useEffect(() => {
    if (mediaDevice) {
      mediaDevice.toggle('Video', video)
      mediaDevice.toggle('Audio', audio)
    }
  }, [mediaDevice])

  const onMouseMove = (e) => {
    if (dragging) {
      setCoords({
        x: e.clientX - localVideoSize.current.width / 2,
        y: e.clientY - localVideoSize.current.height / 2
      })
    }
  }

  const toggleMediaDevice = (deviceType) => {
    if (deviceType === 'video') {
      setVideo(!video)
      mediaDevice.toggle('Video')
    }
    if (deviceType === 'audio') {
      setAudio(!audio)
      mediaDevice.toggle('Audio')
    }
  }

  return (
    <div className='call-window'>
      <div className='inner'>
        <div className='video'>
          <video className='remote' ref={remoteVideo} autoPlay />
          <video
            className='local'
            ref={localVideo}
            autoPlay
            muted
            onClick={() => setDragging(!dragging)}
            style={{
              top: `${coords.y}px`,
              left: `${coords.x}px`
            }}
          />
        </div>
        <div className='control'>
          <button
            className={video ? '' : 'reject'}
            onClick={() => toggleMediaDevice('video')}
          >
            <BsCameraVideo />
          </button>
          <button
            className={audio ? '' : 'reject'}
            onClick={() => toggleMediaDevice('audio')}
          >
            <BsPhone />
          </button>
          <button className='reject' onClick={() => finishCall(true)}>
            <FiPhoneOff />
          </button>
        </div>
      </div>
    </div>
  )
}
