import { STORAGE_KEY } from './constants'

export function verifySupport() {
  const unsupportedFeatures = []

  if (!('mediaDevices' in navigator)) {
    unsupportedFeatures.push('mediaDevices')
  }

  if (
    !('captureStream' in HTMLAudioElement.prototype) &&
    !('mozCaptureStream' in HTMLAudioElement.prototype)
  ) {
    unsupportedFeatures.push('captureStream')
  }

  ;['MediaStream', 'MediaRecorder', 'Blob', 'File', 'ImageCapture'].forEach(
    (f) => {
      if (!(f in window)) {
        unsupportedFeatures.push(f)
      }
    }
  )

  if (!('speechSynthesis' in window)) {
    unsupportedFeatures.push('speechSynthesis')
  }

  if (
    !('SpeechRecognition' in window) &&
    !('webkitSpeechRecognition' in window)
  ) {
    unsupportedFeatures.push('SpeechRecognition')
  }

  return unsupportedFeatures
}

// https://w3c.github.io/mediacapture-main/#dom-mediadevices-enumeratedevices
export async function enumerateDevices() {
  try {
    const devices = sessionStorage.getItem(STORAGE_KEY)
      ? JSON.parse(sessionStorage.getItem(STORAGE_KEY))
      : await navigator.mediaDevices.enumerateDevices()

    if (!sessionStorage.getItem(STORAGE_KEY)) {
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify(devices))
    }

    return { devices }
  } catch (error) {
    return { error }
  }
}

// https://w3c.github.io/mediacapture-main/#dom-mediadevices-getsupportedconstraints
export async function getSupportedConstraints() {
  try {
    const constraints = await navigator.mediaDevices.getSupportedConstraints()
    return { constraints }
  } catch (error) {
    return { error }
  }
}

export const createNewStream = (tracks) => new MediaStream(tracks)

export const stringify = (data) => JSON.stringify(data, null, 2)

export const handleError = (e) => {
  console.error(e)
}
