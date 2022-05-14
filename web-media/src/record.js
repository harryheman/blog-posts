import { DEFAULT_RECORD_MIME_TYPE, DEFAULT_RECORD_TIMESLICE } from './constants'

let mediaRecorder
let mediaDataChunks = []

export async function startRecording({
  mediaStream,
  mimeType,
  timeslice = DEFAULT_RECORD_TIMESLICE,
  ...restOptions
}) {
  if (mediaRecorder) return

  // https://www.w3.org/TR/mediastream-recording/#mediarecorder-api
  mediaRecorder = new MediaRecorder(mediaStream, {
    mimeType: MediaRecorder.isTypeSupported(mimeType)
      ? mimeType
      : DEFAULT_RECORD_MIME_TYPE,
    ...restOptions
  })
  console.log('@media recorder', mediaRecorder)

  mediaRecorder.onerror = ({ error }) => {
    return error
  }

  mediaRecorder.ondataavailable = ({ data }) => {
    mediaDataChunks.push(data)
  }

  mediaRecorder.start(timeslice)
}

export const pauseOrResumeRecording = (function () {
  let paused = false

  return function () {
    if (!mediaRecorder) return

    paused ? mediaRecorder.resume() : mediaRecorder.pause()
    paused = !paused

    return paused
  }
})()

export function stopRecording() {
  if (!mediaRecorder) return

  mediaRecorder.stop()

  const _mediaDataChunks = mediaDataChunks
  console.log('@media data chunks', _mediaDataChunks)

  mediaRecorder.ondataavailable = null
  mediaRecorder = null
  mediaDataChunks = []

  return _mediaDataChunks
}
