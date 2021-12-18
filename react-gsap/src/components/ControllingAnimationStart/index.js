import './style.css'
import { useRef, useEffect, useState, useMemo } from 'react'
import { gsap } from 'gsap'

export const ControllingAnimationStart = () => {
  const el = useRef()
  const q = useMemo(() => gsap.utils.selector(el), [])

  // состояние для рендеринга
  const [count, setCount] = useState(0)
  // состояние для изменения пропа
  const [delayedCount, setDelayedCount] = useState(0)

  // запускается только после первого рендеринга
  useEffect(() => {
    gsap.to(q('.square.red'), {
      rotation: '+=360'
    })
  }, [q])

  // запускается после первого рендеринга и после каждого изменения зависимости `delayedCount`
  useEffect(() => {
    gsap.to(q('.square.green'), {
      rotation: '+=360'
    })
  }, [q, delayedCount])

  // запускается после первого и каждого последующего рендеринга
  useEffect(() => {
    gsap.to(q('.square.blue'), {
      rotation: '+=360'
    })
  })

  // отложенное изменение значения `delayedCount`
  useEffect(() => {
    const timerId = setTimeout(() => {
      setDelayedCount(count)
    }, 1000)

    // очистка при размонтировании компонента
    return () => clearTimeout(timerId)
  }, [count])

  return (
    <>
      <button className='btn' onClick={() => setCount(count + 1)}>
        Rerender
      </button>
      <div className='text'>
        <p>Rendering count: {count + delayedCount}</p>
        <p>Prop changes count: {delayedCount}</p>
      </div>
      <div className='row' ref={el}>
        <div className='shape square red'>First render</div>
        <div className='shape square green'>First render &amp; prop change</div>
        <div className='shape square blue'>Every render</div>
      </div>
    </>
  )
}
