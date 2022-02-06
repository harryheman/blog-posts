import getMedia from './utils/getMedia'
import takePhoto from './utils/takePhoto'
import grabFrame from './utils/grabFrame'

getMedia()

settings$.onsubmit = (e) => {
  e.preventDefault()
  takePhoto()
  removePhoto$.disabled = false
}

controls$.onclick = ({ target }) => {
  if (target.localName !== 'button') return
  switch (target) {
    case removePhoto$:
      URL.revokeObjectURL(photoSrc)
      image$.removeAttribute('src')
      removeAttrs(photoLink$, ['href', 'download', 'style'])
      removePhoto$.disabled = true
      break
    case grabFrame$:
      grabFrame()
      clearCanvas$.disabled = false
      break
    case clearCanvas$:
      ctx.clearRect(0, 0, canvas$.width, canvas$.height)
      setAttrs(canvas$, { width: 0, height: 0 })
      removeAttrs(canvasLink$, ['href', 'download', 'style'])
      clearCanvas$.disabled = true
      break
    default:
      return
  }
}
