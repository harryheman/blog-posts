import {
  captureStreamFromMediaElement,
  getDisplayMedia,
  getUserMedia,
  stopTracks
} from './src/capture'
import {
  DEFAULT_AUDIO_CONSTRAINTS,
  DEFAULT_PHOTO_CONSTRAINTS,
  DEFAULT_RECORD_MIME_TYPE,
  DEFAULT_VIDEO_CONSTRAINTS
} from './src/constants'
import { getPhotoCapabilitiesAndSettings, takePhoto } from './src/photo'
import {
  pauseOrResumeRecording,
  startRecording,
  stopRecording
} from './src/record'
import {
  abortRecognition,
  pauseOrResumeSpeaking,
  startSpeechRecognition,
  startSpeechSynthesis,
  stopRecognition,
  stopSpeaking
} from './src/speech'
import {
  createNewStream,
  enumerateDevices,
  getSupportedConstraints,
  handleError,
  stringify,
  verifySupport
} from './src/utils'
import './style.css'

const unsupportedFeatures = verifySupport()
if (unsupportedFeatures.length) {
  console.error(unsupportedFeatures)
}

enumerateDevicesBtn.onclick = async () => {
  const { devices, error } = await enumerateDevices()
  if (error) return handleError(error)

  logBox.textContent = stringify(devices)
}

getSupportedConstraintsBtn.onclick = async () => {
  const { constraints, error } = await getSupportedConstraints()
  if (error) return handleError(error)

  logBox.textContent = stringify(constraints)
}

// stream capturing
getUserMediaBtn.onclick = async () => {
  const { devices, error: devicesError } = await enumerateDevices()
  if (devicesError) return handleError(devicesError)

  let constraints
  if (devices.some((device) => device.kind === 'audioinput')) {
    constraints = { audio: DEFAULT_AUDIO_CONSTRAINTS }
  }
  if (devices.some((device) => device.kind === 'videoinput')) {
    constraints = { ...constraints, video: DEFAULT_VIDEO_CONSTRAINTS }
  }
  if (!constraints) {
    return handleError('User has no devices to capture.')
  }

  const { stream, tracks, error: mediaError } = await getUserMedia(constraints)
  if (mediaError) return handleError(mediaError)
  console.log('@media stream', stream)

  streamReceiver.srcObject = stream

  const [firstTrack] = tracks
  console.log('@media first track', firstTrack)

  const trackCapabilities = firstTrack.getCapabilities()
  const trackConstraints = firstTrack.getConstraints()
  const trackSettings = firstTrack.getSettings()

  logBox.textContent = stringify({
    trackCapabilities,
    trackConstraints,
    trackSettings
  })
}

getDisplayMediaBtn.onclick = async () => {
  const { stream, tracks, error } = await getDisplayMedia()
  if (error) return handleError(error)
  console.log('@display stream', stream)

  streamReceiver.srcObject = stream

  const [firstTrack] = tracks
  console.log('@display first track', firstTrack)

  const [trackCapabilities, trackConstraints, trackSettings] = [
    firstTrack.getCapabilities(),
    firstTrack.getConstraints(),
    firstTrack.getSettings()
  ]

  logBox.textContent = stringify({
    trackCapabilities,
    trackConstraints,
    trackSettings
  })
}

getStreamFromMediaElementBtn.onclick = async () => {
  const { stream, tracks, error } = await captureStreamFromMediaElement(videoEl)
  if (error) return handleError(error)
  console.log('@media element stream', stream)

  streamReceiver.srcObject = stream

  const [firstTrack] = tracks
  console.log('@media element first track', firstTrack)

  const [trackCapabilities, trackConstraints, trackSettings] = [
    firstTrack.getCapabilities(),
    firstTrack.getConstraints(),
    firstTrack.getSettings()
  ]

  logBox.textContent = stringify({
    trackCapabilities,
    trackConstraints,
    trackSettings
  })
}

stopTracksBtn.onclick = () => {
  stopTracks()
}

// taking photo
getPhotoCapabilitiesAndSettingsBtn.onclick = async () => {
  const { videoTracks, error: mediaError } = await getUserMedia()
  if (mediaError) return handleError(mediaError)

  const [firstVideoTrack] = videoTracks

  const {
    photoCapabilities,
    photoSettings,
    error: photoError
  } = await getPhotoCapabilitiesAndSettings(firstVideoTrack)
  if (photoError) return handleError(photoError)

  logBox.textContent = stringify({
    photoCapabilities,
    photoSettings
  })
}

takePhotoBtn.onclick = async () => {
  const { videoTracks, error: mediaError } = await getUserMedia({
    video: { ...DEFAULT_VIDEO_CONSTRAINTS, ...DEFAULT_PHOTO_CONSTRAINTS }
  })
  if (mediaError) return handleError(mediaError)

  const [videoTrack] = videoTracks

  // await videoTrack.applyConstraints({
  //   advanced: [advancedConstraints]
  // })

  const { blob, error: photoError } = await takePhoto({ videoTrack })
  if (photoError) return handleError(photoError)

  const imgSrc = URL.createObjectURL(blob)
  imgBox.src = imgSrc
  // imgBox.addEventListener(
  //   'load',
  //   () => {
  //     URL.revokeObjectURL(imgSrc)
  //   },
  //   { once: true }
  // )
}

// stream recording
startRecordingBtn.onclick = async () => {
  const { devices, error: devicesError } = await enumerateDevices()
  if (devicesError) return handleError(devicesError)

  let _audioTracks = []
  if (devices.some(({ kind }) => kind === 'audioinput')) {
    const { audioTracks, error: mediaError } = await getUserMedia()
    if (mediaError) return handleError(mediaError)

    _audioTracks = audioTracks
  }

  const { videoTracks, error: displayError } = await getDisplayMedia()
  if (displayError) return handleError(displayError)

  const mediaStream = createNewStream([..._audioTracks, ...videoTracks])

  streamReceiver.srcObject = mediaStream

  const recordError = await startRecording({ mediaStream })
  if (recordError) return handleError(recordError)
}

pauseOrResumeRecordingBtn.onclick = () => {
  const paused = pauseOrResumeRecording()
  console.log('@recording paused', paused)
}

stopRecordingBtn.onclick = () => {
  const chunks = stopRecording()

  // https://w3c.github.io/FileAPI/#blob-section
  const blob = new Blob(chunks, {
    type: DEFAULT_RECORD_MIME_TYPE
  })

  // https://w3c.github.io/FileAPI/#file-section
  // const file = new File(
  //   chunks,
  //   `new-record-${Date.now()}.${DEFAULT_RECORD_MIME_TYPE.split('/').at(-1)}`,
  //   {
  //     type: DEFAULT_RECORD_MIME_TYPE
  //   }
  // )

  recordBox.src = URL.createObjectURL(blob)
  URL.revokeObjectURL(blob)

  stopTracks()
}

// converting text to speech
startSpeechSynthesisBtn.onclick = () => {
  startSpeechSynthesis()
}

pauseOrResumeSpeakingBtn.onclick = () => {
  const paused = pauseOrResumeSpeaking()
  console.log('@speaking paused', paused)
}

stopSpeakingBtn.onclick = () => {
  stopSpeaking()
}

// convert speech to text
startSpeechRecognitionBtn.onclick = () => {
  startSpeechRecognition()
}

stopRecognitionBtn.onclick = () => {
  stopRecognition()
}

abortRecognitionBtn.onclick = () => {
  abortRecognition()
}
