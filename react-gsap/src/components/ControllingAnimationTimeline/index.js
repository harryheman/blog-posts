import './style.css'
import { useRef, useEffect, useState, useMemo } from 'react'
import { gsap } from 'gsap'

// квадрат
const Square = ({ children }) => (
  <div className='shape square green'>{children}</div>
)

// круг
const Circle = ({ children }) => (
  <div className='shape circle blue'>{children} </div>
)

export const ControllingAnimationTimeline = () => {
  // направление анимации
  const [reversed, setReversed] = useState(false)
  const el = useRef()
  const q = useMemo(() => gsap.utils.selector(el), [])

  // переменная для состояния анимации
  const t = useRef()

  useEffect(() => {
    // сохраняем состояние анимации
    t.current = gsap
      .timeline()
      // анимируем квадрат
      .to(q('.square'), {
        // полный поворот
        rotate: 360
      })
      // анимируем круг
      .to(q('.circle'), {
        // смещение на `100px` по оси `x`
        x: 100
      })
  }, [q])

  useEffect(() => {
    // запускаем анимацию в обратном направлении при обновлении `reversed`
    t.current.reversed(reversed)
  }, [reversed])

  return (
    <>
      <button className='btn' onClick={() => setReversed(!reversed)}>
        Reverse
      </button>
      <div ref={el}>
        <Square>Square</Square>
        <Circle>Circle</Circle>
      </div>
    </>
  )
}
