import { invoke, process } from '@tauri-apps/api'
import React, { useState } from 'react'

function App() {
  const [text, setText] = useState('')

  const addTask = async (e: React.KeyboardEvent) => {
    switch (e.key) {
      case 'Enter':
        try {
          await invoke('add_task', { text })
          setText('')
        } catch (e) {
          console.error(e)
        }
        break
      case 'Escape':
        return process.exit()
      default:
        return
    }
  }

  return (
    <input
      type='text'
      className='w-[600px] h-[60px] px-4 bg-gray-800 text-2xl text-green-600 rounded-sm'
      value={text}
      onChange={(e) => setText(e.target.value)}
      onKeyDown={addTask}
    />
  )
}

export default App
