import {
  ADDITIONAL_VIDEO_CONSTRAINTS,
  DEFAULT_AUDIO_CONSTRAINTS,
  DEFAULT_VIDEO_CONSTRAINTS
} from './constants'

let mediaStream
let displayStream
let mediaElementStreams = []

// https://w3c.github.io/mediacapture-main/
export async function getUserMedia(
  constraints = {
    audio: DEFAULT_AUDIO_CONSTRAINTS,
    video: DEFAULT_VIDEO_CONSTRAINTS
  }
) {
  try {
    // https://w3c.github.io/mediacapture-main/#dom-mediadevices-getusermedia
    // https://w3c.github.io/mediacapture-main/#webidl-1647796506
    const stream = mediaStream
      ? mediaStream
      : (mediaStream = await navigator.mediaDevices.getUserMedia(constraints))

    // https://w3c.github.io/mediacapture-main/#media-stream-track-interface-definition
    const tracks = stream.getTracks()
    const audioTracks = stream.getAudioTracks()
    const videoTracks = stream.getVideoTracks()

    return { stream, tracks, audioTracks, videoTracks }
  } catch (error) {
    return { error }
  }
}

// https://w3c.github.io/mediacapture-screen-share/
export async function getDisplayMedia(
  constraints = {
    video: { ...DEFAULT_VIDEO_CONSTRAINTS, ...ADDITIONAL_VIDEO_CONSTRAINTS }
  }
) {
  try {
    const stream = displayStream
      ? displayStream
      : (displayStream = await navigator.mediaDevices.getDisplayMedia(
          constraints
        ))

    const [tracks, audioTracks, videoTracks] = [
      stream.getTracks(),
      stream.getAudioTracks(),
      stream.getVideoTracks()
    ]

    return { stream, tracks, audioTracks, videoTracks }
  } catch (error) {
    return { error }
  }
}

export function stopTracks() {
  mediaStream?.getTracks().forEach((track) => {
    track.stop()
  })
  displayStream?.getTracks().forEach((track) => {
    track.stop()
  })
  for (const stream of mediaElementStreams) {
    stream?.getTracks().forEach((track) => {
      track.stop()
    })
  }
  mediaStream = null
  displayStream = null
  mediaElementStreams = []
}

// https://www.w3.org/TR/mediacapture-fromelement/
export async function captureStreamFromMediaElement(mediaElement) {
  if (!(mediaElement instanceof HTMLMediaElement)) {
    throw new Error('Argument must be an instance of HTMLMediaElement.')
  }
  if (mediaElement.readyState !== 4) {
    throw new Error(
      'Media element has not enough data to be played through the end without interruption.'
    )
  }
  try {
    // https://www.w3.org/TR/mediacapture-fromelement/#dom-htmlmediaelement-capturestream
    const stream = await mediaElement.captureStream()
    mediaElementStreams.push(stream)

    const [tracks, audioTracks, videoTracks] = [
      stream.getTracks(),
      stream.getAudioTracks(),
      stream.getVideoTracks()
    ]

    return { stream, tracks, audioTracks, videoTracks }
  } catch (error) {
    return { error }
  }
}
