export default function verifySupport() {
  const unsupportedFeatures = []

  if (
    !('captureStream' in HTMLAudioElement.prototype) ||
    !('captureStream' in HTMLVideoElement.prototype)
  ) {
    unsupportedFeatures.push('captureStream()')
  }

  ;[
    'MediaStream',
    'MediaRecorder',
    'Blob',
    'AudioContext',
    'MediaStreamAudioSourceNode',
    'MediaStreamAudioDestinationNode'
  ].forEach((f) => {
    if (!(f in window)) {
      unsupportedFeatures.push(f)
    }
  })
  return unsupportedFeatures
}
