import create from 'zustand'
import settingsApi from '../api/settings.api'
import todoApi from '../api/todo.api'

const useStore = create((set, get) => ({
  settings: {},
  todos: [],
  loading: false,
  error: null,
  fetchSettings() {
    set({ loading: true })
    settingsApi
      .fetchSettings()
      .then((settings) => {
        if (settings) {
          set({ settings })
        }
      })
      .catch((error) => {
        set({ error })
      })
      .finally(() => {
        set({ loading: false })
      })
  },
  fetchTodos() {
    set({ loading: true })
    todoApi
      .fetchTodos()
      .then((todos) => {
        set({ todos })
      })
      .catch((error) => {
        set({ error })
      })
      .finally(() => {
        set({ loading: false })
      })
  },
  addTodo(newTodo) {
    set({ loading: true })
    todoApi
      .addTodo(newTodo)
      .then((newTodo) => {
        const todos = [...get().todos, newTodo]
        set({ todos })
      })
      .catch((error) => {
        set({ error })
      })
      .finally(() => {
        set({ loading: false })
      })
  },
  updateTodo(id, changes) {
    set({ loading: true })
    todoApi
      .updateTodo(id, changes)
      .then((updatedTodo) => {
        const todos = get().todos.map((todo) =>
          todo.id === updatedTodo.id ? updatedTodo : todo
        )
        set({ todos })
      })
      .catch((error) => {
        set({ error })
      })
      .finally(() => {
        set({ loading: false })
      })
  },
  removeTodo(id) {
    set({ loading: true })
    todoApi
      .removeTodo(id)
      .then(() => {
        const todos = get().todos.filter((todo) => todo.id !== id)
        set({ todos })
      })
      .catch((error) => {
        set({ error })
      })
      .finally(() => {
        set({ loading: false })
      })
  }
}))

export default useStore
