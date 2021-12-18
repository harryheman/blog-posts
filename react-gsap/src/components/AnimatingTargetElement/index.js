import './style.css'
import { useRef, useEffect } from 'react'
import { gsap } from 'gsap'

export const AnimatingTargetElement = () => {
  // ссылка на элемент
  const el = useRef()

  // запускаем `gsap` после рендеринга
  useEffect(() => {
    gsap.to(el.current, {
      // полный поворот
      rotation: '+=360'
    })
  })

  return (
    <div className='shape square green' ref={el}>
      Square
    </div>
  )
}
