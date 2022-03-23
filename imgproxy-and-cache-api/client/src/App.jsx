import './App.css'
import { useEffect } from 'react'
import { getImageUrl } from './utils/image.utils'

function App() {
  useEffect(() => {
    const faviconTemplate = `<link rel="icon" href=${getImageUrl({
      src: 'favicon.png',
      width: 64,
      height: 64
    })} />`
    const favicon$ = new Range().createContextualFragment(faviconTemplate)
      .children[0]
    document.head.append(favicon$)
  }, [])

  return (
    <div className='App'>
      <h1>Imgproxy &amp; Cache API</h1>
      <div className='images'>
        <figure>
          <img src={getImageUrl({ src: '1.jpeg' })} alt='' />
          <figcaption>First image</figcaption>
        </figure>
        <figure>
          <img src={getImageUrl({ src: '2.jpeg', width: 320 })} alt='' />
          <figcaption>Second image with custom width</figcaption>
        </figure>
        <figure>
          <img src={getImageUrl({ src: '3.jpeg' })} alt='' />
          <figcaption>Fallback image</figcaption>
        </figure>
      </div>
    </div>
  )
}

export default App
