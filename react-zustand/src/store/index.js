import create from 'zustand'

const SERVER_URI = 'http://localhost:3000/todos'

const useStore = create((set, get) => ({
  todos: [],
  loading: false,
  error: null,
  info: {},
  updateInfo() {
    const todos = get().todos
    const { length: total } = todos
    const active = todos.filter((t) => !t.done).length
    const done = total - active
    const left = Math.round((active / total) * 100) + '%'
    set({ info: { total, active, done, left } })
  },
  addTodo(newTodo) {
    const todos = [...get().todos, newTodo]
    set({ todos })
  },
  updateTodo(id) {
    const todos = get().todos.map((t) =>
      t.id === id ? { ...t, done: !t.done } : t
    )
    set({ todos })
  },
  removeTodo(id) {
    const todos = get().todos.filter((t) => t.id !== id)
    set({ todos })
  },
  completeActiveTodos() {
    const todos = get().todos.map((t) => (t.done ? t : { ...t, done: true }))
    set({ todos })
  },
  removeCompletedTodos() {
    const todos = get().todos.filter((t) => !t.done)
    set({ todos })
  },
  async fetchTodos() {
    set({ loading: true })
    try {
      const response = await fetch(SERVER_URI)
      if (!response.ok) throw response
      set({ todos: await response.json() })
    } catch (e) {
      let error = e
      // custom error
      if (e.status === 400) {
        error = await e.json()
      }
      set({ error })
    } finally {
      set({ loading: false })
    }
  }
}))

export default useStore
