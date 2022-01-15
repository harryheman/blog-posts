import './App.css'
import React from 'react'
import useStore from './store'
import {
  Boundary,
  TodoForm,
  TodoControls,
  TodoInfo,
  TodoList
} from './components'

// useStore.getState().fetchTodos()

const App = () => (
  <>
    <header>
      <h1>Zustand Todo App</h1>
    </header>
    <main>
      <Boundary>
        <TodoForm />
        <TodoInfo />
        <TodoControls />
        <TodoList />
      </Boundary>
    </main>
    <footer>
      <p>&copy; 2022. Not all rights reserved. Sad, but true</p>
    </footer>
  </>
)

export default App
