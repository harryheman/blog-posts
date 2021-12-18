import './style.css'
import { useEffect, useLayoutEffect, useRef, forwardRef, useState } from 'react'
import gsap from 'gsap'

gsap.config({
  trialWarn: false
})

gsap.registerEffect({
  name: 'pulse',
  effect(targets) {
    return gsap.fromTo(
      targets,
      {
        scale: 1
      },
      {
        scale: 1.5,
        repeat: 1,
        ease: 'bounce',
        yoyoEase: 'power3'
      }
    )
  }
})

gsap.registerEffect({
  name: 'spin',
  effect(targets) {
    return gsap.to(targets, {
      rotation: (i, el) =>
        gsap.utils.snap(360, gsap.getProperty(el, 'rotation') + 360)
    })
  }
})

gsap.registerEffect({
  name: 'blink',
  effect(targets) {
    return gsap.fromTo(
      targets,
      {
        opacity: 0
      },
      {
        opacity: 1,
        repeat: 2,
        ease: 'bounce',
        yoyoEase: 'power3'
      }
    )
  }
})

const GsapEffect = forwardRef(({ children, targetRef, effect, args }, ref) => {
  const animation = useRef()

  useLayoutEffect(() => {
    if (gsap.effects[effect]) {
      animation.current = gsap.effects[effect](targetRef.current, args)
    }
  }, [targetRef, effect, args])

  useEffect(() => {
    // передаем экземпляр анимации, если передан `ref`
    if (typeof ref === 'function') {
      return ref(animation.current)
    } else if (ref) {
      ref.current = animation.current
    }
  }, [ref])

  return <>{children}</>
})

const Square = forwardRef(({ children }, ref) => (
  <div className='shape square green' ref={ref}>
    {children}
  </div>
))

const wrap = gsap.utils.wrap(['pulse', 'spin', 'blink'])

export const ReusableAnimationRegisterEffect = () => {
  const el = useRef()
  const count = useRef(1)
  const [effect, setEffect] = useState(wrap(0))

  const toggle = () => {
    setEffect(wrap(count.current++))
  }

  return (
    <>
      <button className='btn' onClick={toggle}>
        Toggle
      </button>
      <GsapEffect targetRef={el} effect={effect}>
        <Square ref={el}>{effect}</Square>
      </GsapEffect>
    </>
  )
}
