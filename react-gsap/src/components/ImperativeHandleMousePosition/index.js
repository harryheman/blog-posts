import './style.css'
import { useEffect, useRef, useImperativeHandle, forwardRef } from 'react'
import gsap from 'gsap'

const Circle = forwardRef(({ size, delay }, ref) => {
  const el = useRef()

  useImperativeHandle(
    ref,
    () => {
      // возвращаем `API`
      return {
        moveTo(x, y) {
          gsap.to(el.current, { x, y, delay })
        }
      }
    },
    [delay]
  )

  return <div className={`shape circle blue fixed ${size}`} ref={el}></div>
})

const CIRCLES = [
  { size: 'sm', delay: 0 },
  { size: 'md', delay: 0.1 },
  { size: 'lg', delay: 0.2 }
]

export const ImperativeHandleMousePosition = () => {
  const circleRefs = useRef([])

  // выполняем сброс при повторном рендеринге
  circleRefs.current = []

  useEffect(() => {
    // повторный рендеринг не запускается!
    circleRefs.current.forEach((ref) => {
      ref.moveTo(window.innerWidth / 2, window.innerHeight / 2)
    })

    const onMove = ({ clientX, clientY }) => {
      console.log(clientX, clientY)
      circleRefs.current.forEach((ref) => {
        ref.moveTo(clientX, clientY)
      })
    }

    window.addEventListener('pointermove', onMove)

    return () => {
      window.removeEventListener('pointermove', onMove)
    }
  }, [])

  return (
    <>
      <h2>Move your mouse around</h2>
      {CIRCLES.map((circle, i) => (
        <Circle
          {...circle}
          key={i}
          ref={(el) => {
            if (el) {
              circleRefs.current.push(el)
            }
          }}
        />
      ))}
    </>
  )
}
