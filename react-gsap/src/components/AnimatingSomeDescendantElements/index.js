import './style.css'
import { useRef, useEffect, forwardRef } from 'react'
import { gsap } from 'gsap'

// передаем ссылку
const Animating = forwardRef(({ children, color }, ref) => (
  <div className={`shape square ${color ? color : 'green'}`} ref={ref}>
    {children}
  </div>
))

const NotAnimating = ({ children }) => (
  <div>
    <Animating color='blue'>{children}</Animating>
  </div>
)

export const AnimatingSomeDescendantElements = ({ update }) => {
  const el1 = useRef()
  const el2 = useRef()

  useEffect(() => {
    // ссылки на анимируемые элементы
    const squares = [el1.current, el2.current]

    gsap.to(squares, {
      // + `20px` из-за `padding`
      x: 120,
      repeat: 1,
      repeatDelay: 1,
      yoyo: true
    })
  }, [update])

  return (
    <div>
      <Animating ref={el1}>Dynamic</Animating>
      <NotAnimating>Static</NotAnimating>
      <Animating ref={el2}>Dynamic</Animating>
    </div>
  )
}
