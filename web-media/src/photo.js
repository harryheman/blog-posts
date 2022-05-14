import { DEFAULT_PHOTO_SETTINGS } from './constants'

export async function getPhotoCapabilitiesAndSettings(videoTrack) {
  // https://www.w3.org/TR/image-capture/#imagecaptureapi
  const imageCapture = new ImageCapture(videoTrack)
  console.log('@image capture', imageCapture)

  try {
    const [photoCapabilities, photoSettings] = await Promise.all([
      imageCapture.getPhotoCapabilities(),
      imageCapture.getPhotoSettings()
    ])
    return { photoCapabilities, photoSettings }
  } catch (error) {
    return { error }
  }
}

export async function takePhoto({
  videoTrack,
  photoSettings = DEFAULT_PHOTO_SETTINGS
}) {
  const imageCapture = new ImageCapture(videoTrack)

  try {
    const blob = await imageCapture.takePhoto(photoSettings)
    return { blob }
  } catch (error) {
    return { error }
  }
}
