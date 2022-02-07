const defaultConstraints = {
  video: {
    pan: true,
    tilt: true,
    zoom: true
  }
}

async function getMedia(constraints = defaultConstraints) {
  try {
    const stream = await navigator.mediaDevices.getUserMedia(constraints)
    video$.srcObject = stream
    videoTrack = stream.getVideoTracks()[0]
    imageCapture = new ImageCapture(videoTrack)

    const photoCapabilities = await imageCapture.getPhotoCapabilities()
    console.log('*** Photo capabilities', photoCapabilities)
    const photoSettings = await imageCapture.getPhotoSettings()
    console.log('*** Photo settings', photoSettings)
    const trackCapabilities = videoTrack.getCapabilities()
    console.log('*** Track capabilities', trackCapabilities)
    const trackSettings = videoTrack.getSettings()
    console.log('*** Track settings', trackSettings)

    Object.keys(settingDictionary).forEach((key) => {
      if (key in trackSettings) {
        const fieldTemplate = `
          <div class="field">
            <label for="${key}">
              ${settingDictionary[key]}
            </label>
            <input
              type="range"
              id=${key}
              name=${key}
              min=${trackCapabilities[key].min}
              max=${trackCapabilities[key].max}
              step=${trackCapabilities[key].step}
              value=${trackSettings[key]}
            />
            <p>${trackSettings[key]}</p>
          </div>
        `
        const field$ = create$(fieldTemplate)
        const [_, input$, info$] = field$.children
        input$.oninput = ({ target: { value } }) => {
          info$.textContent = value
        }
        inputs$.push(input$)
        render$(settings$, field$)
      }
    })

    loader$.style.display = 'none'
    app$.style.display = 'flex'
  } catch (e) {
    console.error(e)
  }
}

export default getMedia
