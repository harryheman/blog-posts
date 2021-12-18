import './style.css'
import {
  useRef,
  useEffect,
  useLayoutEffect,
  useState,
  useMemo,
  useCallback
} from 'react'
import { gsap } from 'gsap'

// функция для получения фиктивных данных
const getFakeData = () =>
  new Promise((resolve) => {
    const timer = setTimeout(() => {
      resolve([
        { id: 1, color: 'red' },
        { id: 2, color: 'green' },
        { id: 3, color: 'blue' }
      ])
      clearTimeout(timer)
    }, 1000)
  })

// дочерний компонент
const Square = ({ children, color, invert }) => (
  <div
    className={`square shape pointer ${color}`}
    onMouseEnter={(e) => invert(e, 100)}
    onMouseLeave={(e) => invert(e, 0)}
  >
    {children}
  </div>
)

export const AnimationWithoutFlash = ({ update }) => {
  const el = useRef()
  const q = useMemo(() => gsap.utils.selector(el), [])

  // данные
  const [data, setData] = useState([])
  // состояние
  const [state, setState] = useState(null)

  // запускается при выполнении принудительного обновления
  useEffect(() => {
    setData([])
    setState(null)
  }, [update])

  // запускается при значении состояния равном `start`
  useEffect(() => {
    if (state !== 'start') return // получаем фиктивные данные
    ;(async () => {
      const data = await getFakeData()
      // записываем данные
      setData(data)
      // обновляем состояние
      setState('complete')
    })()
  }, [state])

  // запускается при значении состояния равном `complete`
  useLayoutEffect(() => {
    if (state !== 'complete') return

    // анимируем дочерние компоненты
    gsap.fromTo(
      q('.square'),
      {
        opacity: 0
      },
      {
        opacity: 1,
        // продолжительность анимации
        duration: 1,
        stagger: 0.33
      }
    )
  }, [q, state])

  // функция для установки состояния в значение `start`
  const start = () => {
    if (!state) {
      setState('start')
    }
  }

  // функция для инверсии цветов
  const invert = useCallback(({ currentTarget }, value) => {
    gsap.to(currentTarget, {
      filter: `invert(${value}%)`
    })
  }, [])

  // если состояние отсутствует
  if (!state) {
    return (
      <button onClick={start} className='btn'>
        Start
      </button>
    )
  }

  // если состояние имеет значение `start`
  if (state === 'start') {
    return (
      <div className='text'>
        <p>Loading...</p>
      </div>
    )
  }

  // если состояние имеет значение `complete`
  return (
    <div ref={el} className='row'>
      {data.map(({ id, color }) => (
        <Square key={id} color={color} invert={invert}>
          {id}
        </Square>
      ))}
    </div>
  )
}
