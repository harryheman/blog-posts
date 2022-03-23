const BASE_IMAGE_URL = 'http://localhost:8080/imgproxy/insecure'

export const getImageUrl = ({ rt = 'fill', width = 480, height = 320, src = 'fallback.jpeg' }) =>
  `${BASE_IMAGE_URL}/rs:${rt}:${width}:${height}/plain/local:///images/${src}`
