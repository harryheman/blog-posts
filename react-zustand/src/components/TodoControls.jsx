import React from 'react'
import shallow from 'zustand/shallow'
import { nanoid } from 'nanoid'
import useStore from '../store'

export const TodoControls = () => {
  const {
    todos,
    completeActiveTodos,
    removeCompletedTodos,
    addTodo,
    updateTodo
  } = useStore(
    ({
      todos,
      completeActiveTodos,
      removeCompletedTodos,
      addTodo,
      updateTodo
    }) => ({
      todos,
      completeActiveTodos,
      removeCompletedTodos,
      addTodo,
      updateTodo
    }),
    shallow
  )

  const createManyTodos = () => {
    const times = []
    for (let i = 0; i < 25; i++) {
      const start = performance.now()
      for (let j = 0; j < 100; j++) {
        const id = nanoid()
        const todo = {
          id,
          text: `Todo ${id}`,
          done: false
        }
        addTodo(todo)
      }
      const difference = performance.now() - start
      times.push(difference)
    }
    const time = Math.round(times.reduce((a, c) => (a += c), 0) / 25)
    console.log('Create time:', time) // 6-7 ms
  }

  const updateAllTodos = () => {
    const todos = useStore.getState().todos
    const start = performance.now()
    for (let i = 0; i < todos.length; i++) {
      updateTodo(todos[i].id)
    }
    const time = Math.round(performance.now() - start)
    console.log('Update time:', time) // 1100-1200 ms
  }

  // if (!todos.length) return null

  return (
    <div className='todo-controls'>
      <button className='btn-complete' onClick={completeActiveTodos}>
        Complete all todos
      </button>
      <button className='btn-remove' onClick={removeCompletedTodos}>
        Remove completed todos
      </button>
      <button className='btn-create' onClick={createManyTodos}>
        Create 2500 todos
      </button>
      <button className='btn-update' onClick={updateAllTodos}>
        Update all todos
      </button>
    </div>
  )
}
