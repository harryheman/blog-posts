import './style.css'
import { useEffect, useRef, useState, useContext, createContext } from 'react'
import gsap from 'gsap'

// контекст
const SelectedContext = createContext()

// провайдер
const SelectedProvider = ({ children }) => {
  const [selected, setSelected] = useState(2)

  return (
    <SelectedContext.Provider value={{ selected, setSelected }}>
      {children}
    </SelectedContext.Provider>
  )
}

// хук для потребления контекста
const useSelectedContext = () => useContext(SelectedContext)

const colorByOrder = {
  1: 'green',
  2: 'blue',
  3: 'red'
}

function Square({ label, order }) {
  const el = useRef()
  const { selected } = useSelectedContext()

  useEffect(() => {
    gsap.to(el.current, {
      // сдвигаем элемент на `200px` влево, если его `id`
      // совпадает со значением `order` из контекста
      x: selected === order ? 200 : 0
    })
  }, [selected, order])

  return (
    <div className={`shape square ${colorByOrder[order]}`} ref={el}>
      {label}
    </div>
  )
}

const Squares = () =>
  [1, 2, 3].map((i) => <Square key={i} order={i} label={`Square ${i}`} />)

const MenuItem = ({ label, checked, onChange }) => {
  const order = label.split(' ')[1]

  return (
    <div className='menu-item'>
      <input
        type='radio'
        id={order}
        checked={checked}
        value={order}
        onChange={onChange}
        name='order'
      />
      <label htmlFor={order}>{label}</label>
    </div>
  )
}

const Menu = () => {
  const { selected, setSelected } = useSelectedContext()

  const onChange = ({ target: { value } }) => {
    setSelected(Number(value))
  }

  return (
    <div className='menu'>
      {[1, 2, 3].map((i) => (
        <MenuItem
          key={i}
          label={`Square ${i}`}
          checked={selected === i}
          onChange={onChange}
        />
      ))}
    </div>
  )
}

export const PassingTimelineThroughContext = () => {
  return (
    <SelectedProvider>
      <Menu />
      <Squares />
    </SelectedProvider>
  )
}
