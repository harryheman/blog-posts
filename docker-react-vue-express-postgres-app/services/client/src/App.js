import { useEffect } from 'react'
import './App.css'
import useStore from './hooks/useStore'
import TodoForm from './components/TodoForm'
import TodoList from './components/TodoList'

useStore.getState().fetchSettings()
useStore.getState().fetchTodos()

function App() {
  const { settings, loading, error } = useStore(
    ({ settings, loading, error }) => ({ settings, loading, error })
  )

  useEffect(() => {
    if (Object.keys(settings).length) {
      document.documentElement.style.fontSize = settings.base_font_size
      document.body.className = settings.theme
    }
  }, [settings])

  if (loading) return <h2>Loading...</h2>

  if (error)
    return (
      <h3 className='error'>
        {error.message || 'Something went wrong. Try again later'}
      </h3>
    )

  return (
    <div className='App'>
      <h1>Client</h1>
      <h2>{settings.greetings}</h2>
      <TodoForm />
      <TodoList />
    </div>
  )
}

export default App
