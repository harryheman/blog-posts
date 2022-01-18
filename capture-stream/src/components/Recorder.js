import { useState } from 'react'
import { useSetters, useStore } from 'App'
import { usePrevious } from 'hooks/usePrevious'

import {
  startRecording,
  stopRecording,
  pauseRecording,
  resumeRecording,
  replaceAudioInStream
} from 'utils/recording'

export const Recorder = () => {
  const { setResult } = useSetters()
  const { audio, video } = useStore()
  const previousAudio = usePrevious(audio)

  const [paused, setPaused] = useState(false)
  const [recordingStarted, setRecordingStarted] = useState(false)

  const toggleAudioVideo = (action) => {
    switch (action) {
      case 'play': {
        if (audio.paused) {
          audio.play()
        }
        if (video.paused) {
          video.play()
        }
        break
      }
      case 'pause': {
        if (!audio.paused) {
          audio.pause()
        }
        if (!video.paused) {
          video.pause()
        }
        break
      }
      case 'stop': {
        toggleAudioVideo('pause')
        audio.currentTime = 0
        video.currentTime = 0
        break
      }
      default:
        return
    }
  }

  const start = () => {
    if (video && audio && !recordingStarted.current) {
      toggleAudioVideo('play')
      startRecording({ audio, video })
      setRecordingStarted(true)
    }
  }

  const pauseResume = () => {
    if (!paused) {
      toggleAudioVideo('pause')
      pauseRecording()
    } else {
      toggleAudioVideo('play')

      if (previousAudio !== audio) {
        console.log('*** New audio')
        replaceAudioInStream(audio)
      }

      resumeRecording()
    }
    setPaused(!paused)
  }

  const stop = () => {
    toggleAudioVideo('stop')
    const result = stopRecording()
    setResult(result)
    setRecordingStarted(false)
  }

  if (!audio || !video) return null

  return (
    <div className='container recorder'>
      {!recordingStarted ? (
        <button onClick={start} className='start'>
          Start recording
        </button>
      ) : (
        <>
          <button onClick={pauseResume} className={paused ? 'resume' : 'pause'}>
            {paused ? 'Resume' : 'Pause'}
          </button>
          <button onClick={stop} className='stop'>
            Stop
          </button>
        </>
      )}
    </div>
  )
}
