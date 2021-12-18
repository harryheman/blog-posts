import './style.css'
import { useRef, useEffect } from 'react'
import { gsap } from 'gsap'

// обычный контейнер
const Regular = ({ children, color }) => (
  <div className={`shape square ${color ? color : 'green'}`}>{children}</div>
)

// вложенный контейнер
const Inner = ({ children }) => (
  <div>
    <Regular color='blue'>{children}</Regular>
  </div>
)

export const AnimatingAllDescendantElements = () => {
  const el = useRef()
  // передаем предка анимируемых элементов
  const q = gsap.utils.selector(el)

  useEffect(() => {
    // селектором анимируемых элементов является CSS-класс `shape`
    gsap.to(q('.shape'), {
      // смещение на `100px` по оси `x`
      x: 100,
      // задержка между анимациями, применяемыми к нескольким элементам
      // у нас 3 элемента -> 1 / 3 примерно 0.33
      stagger: 0.33,
      // 1 повтор
      repeat: 1,
      // задержка между циклами в секундах
      repeatDelay: 1,
      // туда и обратно
      yoyo: true
    })
  }, [q])

  return (
    <div ref={el}>
      <Regular>Regular</Regular>
      <Inner>Inner</Inner>
      <Regular>Regular</Regular>
    </div>
  )
}
