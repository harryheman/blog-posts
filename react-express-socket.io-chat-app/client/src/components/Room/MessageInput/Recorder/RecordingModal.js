import useStore from 'hooks/useStore'
import { useRef, useState } from 'react'
import { BsFillPauseFill, BsFillPlayFill, BsFillStopFill } from 'react-icons/bs'
import {
  audioConstraints,
  isRecordingStarted,
  pauseRecording,
  resumeRecording,
  startRecording,
  stopRecording,
  videoConstraints
} from 'utils/recording'

export default function RecordingModal({ setShowModal }) {
  const setFile = useStore(({ setFile }) => setFile)
  const [constraints, setConstraints] = useState(audioConstraints)
  const [recording, setRecording] = useState(false)
  const selectBlockRef = useRef()
  const videoRef = useRef()

  const onChange = ({ target: { value } }) =>
    value === 'audio'
      ? setConstraints(audioConstraints)
      : setConstraints(videoConstraints)

  const pauseResume = () => {
    if (recording) {
      pauseRecording()
    } else {
      resumeRecording()
    }
    setRecording(!recording)
  }

  const start = async () => {
    if (isRecordingStarted()) {
      return pauseResume()
    }

    const stream = await startRecording(constraints)

    setRecording(true)

    selectBlockRef.current.style.display = 'none'

    if (constraints.video && stream) {
      videoRef.current.style.display = 'block'
      videoRef.current.srcObject = stream
    }
  }

  const stop = () => {
    const file = stopRecording()

    setRecording(false)

    setFile(file)

    setShowModal(false)
  }

  return (
    <div
      className='overlay'
      onClick={(e) => {
        if (e.target.className !== 'overlay') return
        setShowModal(false)
      }}
    >
      <div className='modal'>
        <div ref={selectBlockRef}>
          <h2>Select type</h2>
          <select onChange={onChange}>
            <option value='audio'>Audio</option>
            <option value='video'>Video</option>
          </select>
        </div>

        {isRecordingStarted() && <p>{recording ? 'Recording...' : 'Paused'}</p>}

        <video ref={videoRef} autoPlay muted />

        <div className='controls'>
          <button className='btn play' onClick={start}>
            {recording ? (
              <BsFillPauseFill className='icon' />
            ) : (
              <BsFillPlayFill className='icon' />
            )}
          </button>
          {isRecordingStarted() && (
            <button className='btn stop' onClick={stop}>
              <BsFillStopFill className='icon' />
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
