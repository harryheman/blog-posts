async function grabFrame() {
  try {
    const imageBitmap = await imageCapture.grabFrame()

    canvas$.width = imageBitmap.width
    canvas$.height = imageBitmap.height

    // рендерим фрейм
    ctx.drawImage(imageBitmap, 0, 0)

    // читаем пиксели и инвертируем цвета
    const imageData = ctx.getImageData(0, 0, canvas$.width, canvas$.height)
    const { data } = imageData
    for (let i = 0; i < data.length; i += 4) {
      data[i] ^= 255 // красный
      data[i + 1] ^= 255 // зеленый
      data[i + 2] ^= 255 // синий
    }

    // перерисовываем изображение
    ctx.putImageData(imageData, 0, 0)

    setAttrs(canvasLink$, {
      href: canvas$.toDataURL(),
      download: `my-frame-${Date.now()}.png`,
      style: 'display: block;'
    })
  } catch (e) {
    console.error(e)
  }
}

export default grabFrame
