const defaultSettings = {
  imageHeight: 480,
  imageWidth: 640
}

async function takePhoto(settings = defaultSettings) {
  const advancedConstraints = {}
  for (const { name, value } of inputs$) {
    advancedConstraints[name] = value
  }

  try {
    await videoTrack.applyConstraints({
      advanced: [advancedConstraints]
    })
  } catch (e) {
    console.error(e)
  }

  try {
    const blob = await imageCapture.takePhoto(settings)
    photoSrc = URL.createObjectURL(blob)

    image$.src = photoSrc
    setAttrs(photoLink$, {
      href: photoSrc,
      download: `my-photo-${Date.now()}.png`,
      style: 'display: block;'
    })
  } catch (e) {
    console.error(e)
  }
}

export default takePhoto
