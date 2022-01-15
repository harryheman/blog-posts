import React from 'react'
import { gsap } from 'gsap'
import shallow from 'zustand/shallow'
import useStore from '../store'

export const TodoItem = ({ todo }) => {
  const { updateTodo, removeTodo } = useStore(
    ({ updateTodo, removeTodo }) => ({
      updateTodo,
      removeTodo
    }),
    shallow
  )

  const remove = (id, target) => {
    gsap.to(target, {
      opacity: 0,
      x: -100,
      onComplete() {
        removeTodo(id)
      }
    })
  }

  const { id, text, done } = todo

  return (
    <li className='todo-item'>
      <input type='checkbox' checked={done} onChange={() => updateTodo(id)} />
      <span
        style={done ? { textDecoration: 'line-through' } : {}}
        className='todo-text'
      >
        {text}
      </span>
      <button
        className='btn-remove'
        onClick={(e) => remove(id, e.target.parentElement)}
      >
        ✖
      </button>
    </li>
  )
}
