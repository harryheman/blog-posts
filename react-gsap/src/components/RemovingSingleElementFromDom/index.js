import './style.css'
import { useRef, useState, useEffect } from 'react'
import gsap from 'gsap'
import { TextPlugin } from 'gsap/TextPlugin'

gsap.registerPlugin(TextPlugin)

export const RemovingSingleElementFromDom = ({ update }) => {
  const el = useRef()
  const [active, setActive] = useState(true)

  const remove = () => {
    gsap.fromTo(
      el.current,
      { text: 'bye' },
      {
        opacity: 0,
        duration: 1,
        onComplete: () => setActive(false)
      }
    )
  }

  useEffect(() => {
    setActive(true)
  }, [update])

  return active ? (
    <>
      <div className='shape square green pointer' ref={el} onClick={remove}>
        Square
      </div>
    </>
  ) : (
    <h3>Removed</h3>
  )
}
