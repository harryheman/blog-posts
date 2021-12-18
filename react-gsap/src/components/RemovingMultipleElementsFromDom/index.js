import './style.css'
import { useState, useEffect } from 'react'
import gsap from 'gsap'
import { TextPlugin } from 'gsap/TextPlugin'

gsap.registerPlugin(TextPlugin)

const initialItems = [
  { id: 0, color: 'blue' },
  { id: 1, color: 'red' },
  { id: 2, color: 'green' }
]

export const RemovingMultipleElementsFromDom = ({ update }) => {
  const [items, setItems] = useState(initialItems)

  useEffect(() => {
    setItems(initialItems)
  }, [update])

  const removeItem = (value) => {
    setItems((prev) => prev.filter((item) => item !== value))
  }

  const remove = (item, target) => {
    gsap.fromTo(
      target,
      { text: 'bye' },
      {
        opacity: 0,
        onComplete: () => removeItem(item)
      }
    )
  }

  return (
    <div className='row'>
      {items.map((item) => (
        <div
          className={`shape square pointer ${item.color}`}
          key={item.id}
          onClick={(e) => remove(item, e.currentTarget)}
        >
          Click Me
        </div>
      ))}
    </div>
  )
}
