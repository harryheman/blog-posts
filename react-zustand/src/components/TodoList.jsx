import React, { useLayoutEffect, useRef } from 'react'
import { gsap } from 'gsap'
import useStore from '../store'
import { TodoItem } from './TodoItem'

export const TodoList = () => {
  const todos = useStore(({ todos }) => todos)
  const todoListRef = useRef()
  const q = gsap.utils.selector(todoListRef)

  useLayoutEffect(() => {
    if (todoListRef.current) {
      gsap.fromTo(
        q('.todo-item'),
        {
          x: 100,
          opacity: 0
        },
        {
          x: 0,
          opacity: 1,
          stagger: 1 / todos.length
        }
      )
    }
  }, [])

  return (
    todos.length > 0 && (
      <ul className='todo-list' ref={todoListRef}>
        {todos.map((todo) => (
          <TodoItem key={todo.id} todo={todo} />
        ))}
      </ul>
    )
  )
}
