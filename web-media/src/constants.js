export const STORAGE_KEY = 'user_media_devices'

// https://w3c.github.io/mediacapture-main/#constrainable-interface
// https://w3c.github.io/mediacapture-main/#dom-mediatracksupportedconstraints
export const DEFAULT_AUDIO_CONSTRAINTS = {
  echoCancellation: true,
  autoGainControl: true,
  noiseSuppression: true
}

export const DEFAULT_VIDEO_CONSTRAINTS = {
  width: 1920,
  height: 1080,
  frameRate: 60
}

// https://w3c.github.io/mediacapture-screen-share/#webidl-210984315
export const ADDITIONAL_VIDEO_CONSTRAINTS = {
  displaySurface: 'window',
  cursor: 'motion'
}

// https://www.w3.org/TR/image-capture/#mediatracksupportedconstraints-section
export const DEFAULT_PHOTO_CONSTRAINTS = {
  pan: true,
  tilt: true,
  zoom: true
}

// https://www.w3.org/TR/image-capture/#photosettings-section
export const DEFAULT_PHOTO_SETTINGS = {
  imageHeight: 480,
  imageWidth: 640
}

export const DEFAULT_RECORD_MIME_TYPE = 'video/webm'
export const DEFAULT_RECORD_TIMESLICE = 250
