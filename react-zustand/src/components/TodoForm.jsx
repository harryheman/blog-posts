import { nanoid } from 'nanoid'
import React, { useEffect, useState } from 'react'
import useStore from '../store'

export const TodoForm = () => {
  const [text, setText] = useState('')
  const [submitDisabled, setSubmitDisabled] = useState(true)
  const addTodo = useStore(({ addTodo }) => addTodo)

  useEffect(() => {
    setSubmitDisabled(!text.trim())
  }, [text])

  const onChange = ({ target: { value } }) => {
    setText(value)
  }

  const onSubmit = (e) => {
    e.preventDefault()
    if (submitDisabled) return
    const newTodo = {
      id: nanoid(),
      text,
      done: false
    }
    addTodo(newTodo)
    setText('')
  }

  return (
    <form className='todo-form' onSubmit={onSubmit}>
      <label htmlFor='text'>New todo text</label>
      <div>
        <input
          type='text'
          required
          value={text}
          onChange={onChange}
          style={
            !submitDisabled ? { borderBottom: '2px solid var(--success)' } : {}
          }
        />
        <button className='btn-add' disabled={submitDisabled}>
          Add
        </button>
      </div>
    </form>
  )
}
