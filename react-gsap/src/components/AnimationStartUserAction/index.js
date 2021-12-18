import './style.css'
import { gsap } from 'gsap'
import { TextPlugin } from 'gsap/TextPlugin'

gsap.registerPlugin(TextPlugin)

// генерация случайного целого числа
const getRandInt = () => gsap.utils.random(-100, 100, 1, true)

export const AnimationStartUserAction = () => {
  // вызывается при наведении курсора
  const onEnter = ({ currentTarget }) => {
    gsap.to(currentTarget, {
      backgroundColor: '#2c7ad2',
      scale: 1.25,
      text: 'click'
    })
  }

  // вызывается при "снятии" курсора
  const onLeave = ({ currentTarget }) => {
    gsap.to(currentTarget, {
      backgroundColor: '#28a92b',
      scale: 1,
      text: 'hover'
    })
  }

  // вызывается при клике
  const onClick = ({ currentTarget }) => {
    gsap.to(currentTarget, {
      x: getRandInt(),
      y: getRandInt()
    })
  }

  return (
    <>
      <div
        className='shape square green pointer'
        onMouseEnter={onEnter}
        onMouseLeave={onLeave}
        onClick={onClick}
      >
        hover
      </div>
    </>
  )
}
