import verifySupport from './verifySupport'

let mediaChunks = []
let mediaRecorder
let audioContext
let mediaStreamAudioDestinationNode
let mediaStreamAudioSourceNode

export const startRecording = ({ audio, video, timeslice = 250 }) => {
  const unsupportedFeatures = verifySupport()
  if (unsupportedFeatures.length)
    return console.error(`${unsupportedFeatures.join(', ')} not supported`)

  const videoStream = video.captureStream()
  const audioStream = audio.captureStream()

  audioContext = new AudioContext()
  mediaStreamAudioDestinationNode = new MediaStreamAudioDestinationNode(
    audioContext
  )
  mediaStreamAudioSourceNode = new MediaStreamAudioSourceNode(audioContext, {
    mediaStream: audioStream
  })
  mediaStreamAudioSourceNode.connect(mediaStreamAudioDestinationNode)

  const mediaStream = new MediaStream([
    ...videoStream.getVideoTracks(),
    ...mediaStreamAudioDestinationNode.stream.getAudioTracks()
  ])

  mediaRecorder = new MediaRecorder(mediaStream, { mimeType: 'video/webm' })

  mediaRecorder.ondataavailable = (e) => {
    mediaChunks.push(e.data)
  }

  console.log('*** Start recording')
  mediaRecorder.start(timeslice)
}

export const stopRecording = () => {
  if (!mediaRecorder) return

  console.log('*** Stop recording')
  mediaRecorder.stop()

  const result = new Blob(mediaChunks, { type: 'video/webm' })

  mediaRecorder = null
  mediaChunks = []

  return result
}

export const replaceAudioInStream = (audio) => {
  const audioStream = audio.captureStream()
  const newMediaStreamAudioSourceNode = new MediaStreamAudioSourceNode(
    audioContext,
    { mediaStream: audioStream }
  )
  newMediaStreamAudioSourceNode.connect(mediaStreamAudioDestinationNode)
  mediaStreamAudioSourceNode.disconnect()
  mediaStreamAudioSourceNode = newMediaStreamAudioSourceNode
}

export const pauseRecording = () => {
  if (!mediaRecorder) return
  console.log('*** Pause recording')
  mediaRecorder.pause()
}

export const resumeRecording = () => {
  if (!mediaRecorder) return
  console.log('*** Resume recording')
  mediaRecorder.resume()
}
