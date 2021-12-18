import './style.css'
import { useEffect, useRef, useState, useCallback } from 'react'
import gsap from 'gsap'

function Square({ children, addAnimation, index }) {
  const el = useRef()
  // создаем анимацию `x: -100` и добавляем ее в `timeline`
  useEffect(() => {
    const animation = gsap.to(el.current, { x: -100 })
    addAnimation(animation, index)

    return () => animation.progress(0).kill()
  }, [addAnimation, index])

  return (
    <div className='shape square green' ref={el}>
      {children}
    </div>
  )
}

function Circle({ children, addAnimation, index, rotation }) {
  const el = useRef()
  // создаем анимацию `x: 100, rotate: rotation` и добавляем ее в `timeline`
  useEffect(() => {
    const animation = gsap.to(el.current, { x: 100, rotate: rotation })
    addAnimation(animation, index)

    return () => animation.progress(0).kill()
  }, [addAnimation, rotation, index])

  return (
    <div className='shape circle blue' ref={el}>
      {children}
    </div>
  )
}

export const PassingCallbackThroughProps = () => {
  const [reversed, setReversed] = useState(false)
  const { current: timeline } = useRef(gsap.timeline())

  // функция для добавления анимации в `timeline`
  const addAnimation = useCallback(
    (animation, index) => {
      timeline.add(animation, index * 0.01)
    },
    [timeline]
  )

  useEffect(() => {
    // меняем направление анимации
    timeline.reversed(reversed)
  }, [timeline, reversed])

  return (
    <>
      <button className='btn' onClick={() => setReversed(!reversed)}>
        Toggle
      </button>
      {/* передаем `addAnimation` как проп */}
      <Square addAnimation={addAnimation} index={0}>
        Square
      </Square>
      {/* передаем `addAnimation` как проп */}
      <Circle addAnimation={addAnimation} rotation={360} index={1}>
        Circle
      </Circle>
    </>
  )
}
