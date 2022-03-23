let mediaRecorder = null
let mediaChunks = []
let mediaConstraints = null

export const audioConstraints = {
  audio: {
    echoCancellation: true,
    autoGainControl: true,
    noiseSuppression: true
  }
}

export const videoConstraints = {
  ...audioConstraints,
  video: {
    width: 1920,
    height: 1080,
    frameRate: 60.0
  }
}

export const isRecordingStarted = () => !!mediaRecorder

export const pauseRecording = () => {
  mediaRecorder.pause()
}

export const resumeRecording = () => {
  mediaRecorder.resume()
}

export const startRecording = async (constraints) => {
  mediaConstraints = constraints

  try {
    const stream = await navigator.mediaDevices.getUserMedia(constraints)
    const type = constraints.video ? 'video' : 'audio'

    mediaRecorder = new MediaRecorder(stream, { mimeType: `${type}/webm` })

    mediaRecorder.ondataavailable = ({ data }) => {
      mediaChunks.push(data)
    }

    mediaRecorder.start(250)

    return stream
  } catch (e) {
    console.error(e)
  }
}

export const stopRecording = () => {
  mediaRecorder.stop()
  mediaRecorder.stream.getTracks().forEach((t) => {
    t.stop()
  })

  const type = mediaConstraints.video ? 'video' : 'audio'
  const file = new File(mediaChunks, 'my_record.webm', {
    type: `${type}/webm`
  })

  mediaRecorder.ondataavailable = null
  mediaRecorder = null
  mediaChunks = []

  return file
}
