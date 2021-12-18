import './style.css'
import { useLayoutEffect, useEffect, useRef, forwardRef } from 'react'
import gsap from 'gsap'

const FadeIn = forwardRef(({ children, stagger = 0, x = 0 }, ref) => {
  const el = useRef()
  const animation = useRef()

  useLayoutEffect(() => {
    animation.current = gsap.from(el.current.children, {
      opacity: 0,
      stagger,
      x
    })
  }, [])

  useEffect(() => {
    // передаем экземпляр анимации
    if (!ref) return
    if (typeof ref === 'function') {
      return ref(animation.current)
    }
    ref.current = animation.current
  }, [ref])

  return <span ref={el}>{children}</span>
})

export const ReusableAnimationWrapper = () => {
  const animation = useRef()

  const toggle = () => {
    animation.current.reversed(!animation.current.reversed())
  }

  return (
    <>
      <button className='btn' onClick={toggle}>
        Toggle
      </button>
      <FadeIn stagger={0.1} x={100} ref={animation}>
        <div className='shape circle blue'>Circle</div>
        <div className='shape square green'>Square</div>
      </FadeIn>
    </>
  )
}
