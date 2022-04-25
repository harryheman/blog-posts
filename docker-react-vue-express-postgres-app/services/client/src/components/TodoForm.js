import { useState, useEffect } from 'react'
import useStore from '../hooks/useStore'

export default function TodoForm() {
  const addTodo = useStore(({ addTodo }) => addTodo)
  const [text, setText] = useState('')
  const [disable, setDisable] = useState(true)

  useEffect(() => {
    setDisable(!text.trim())
  }, [text])

  const onChange = ({ target: { value } }) => {
    setText(value)
  }

  const onSubmit = (e) => {
    e.preventDefault()
    if (disable) return
    const newTodo = {
      text,
      done: false
    }
    addTodo(newTodo)
  }

  return (
    <form onSubmit={onSubmit}>
      <label htmlFor='text'>New todo text</label>
      <input type='text' id='text' value={text} onChange={onChange} />
      <button className='add'>Add</button>
    </form>
  )
}
