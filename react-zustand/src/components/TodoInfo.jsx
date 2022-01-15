import React, { useEffect } from 'react'
import shallow from 'zustand/shallow'
import useStore from '../store'

export const TodoInfo = () => {
  const { todos, info, updateInfo } = useStore(
    ({ todos, info, updateInfo }) => ({ todos, info, updateInfo }),
    shallow
  )

  useEffect(() => {
    updateInfo()
  }, [todos])

  if (!info || !todos.length) return null

  return (
    <div className='todo-info'>
      {['Total', 'Active', 'Done', 'Left'].map((k) => (
        <span key={k}>
          {k}: {info[k.toLowerCase()]}
        </span>
      ))}
    </div>
  )
}
