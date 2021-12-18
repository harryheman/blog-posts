import './style.css'
import { useEffect, useRef, useState } from 'react'
import gsap from 'gsap'

function Square({ children, timeline, index }) {
  const el = useRef()
  // добавляем анимацию `x: -100` в `timeline`
  useEffect(() => {
    timeline.to(el.current, { x: -100 }, index * 0.1)
  }, [timeline, index])

  return (
    <div className='shape square green' ref={el}>
      {children}
    </div>
  )
}

function Circle({ children, timeline, index, rotation }) {
  const el = useRef()
  // добавляем анимацию `x: 100, rotate: rotation` в `timeline`
  useEffect(() => {
    timeline.to(el.current, { x: 100, rotate: rotation }, index * 0.01)
  }, [timeline, rotation, index])

  return (
    <div className='shape circle blue' ref={el}>
      {children}
    </div>
  )
}

export const PassingTimelineThroughProps = () => {
  const [reversed, setReversed] = useState(false)
  const { current: timeline } = useRef(gsap.timeline())

  useEffect(() => {
    // меняем направление анимации
    timeline.reversed(reversed)
  }, [reversed, timeline])

  return (
    <>
      <button className='btn' onClick={() => setReversed(!reversed)}>
        Toggle
      </button>
      {/* передаем `timeline` как проп */}
      <Square timeline={timeline} index={0}>
        Square
      </Square>
      {/* передаем `timeline` как проп */}
      <Circle timeline={timeline} rotation={360} index={1}>
        Circle
      </Circle>
    </>
  )
}
