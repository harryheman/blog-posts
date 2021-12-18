import './style.css'
import { useRef, useEffect, useState } from 'react'
import { gsap } from 'gsap'

import { TextPlugin } from 'gsap/TextPlugin'

gsap.registerPlugin(TextPlugin)

// функция генерации случайного целого числа от `-200` до `200`
const getRandomX = gsap.utils.random(-200, 200, 1, true)

// передаем проп `randomX` дочернему компоненту
function Square({ children, randomX }) {
  const el = useRef()

  // запускается при каждом изменении пропа `randomX`
  useEffect(() => {
    gsap.to(el.current, {
      x: randomX,
      text: randomX
    })
  }, [randomX])

  return (
    <div className='shape square green' ref={el}>
      {children}
    </div>
  )
}

export const AnimationStartPropChange = ({ update }) => {
  const [randomX, setRandomX] = useState()

  useEffect(() => {
    setRandomX(0)
  }, [update])

  return (
    <>
      <button className='btn' onClick={() => setRandomX(getRandomX())}>
        Generate random X
      </button>
      <Square randomX={randomX}>0</Square>
    </>
  )
}
