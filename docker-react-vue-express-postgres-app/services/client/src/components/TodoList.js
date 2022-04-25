import useStore from '../hooks/useStore'

export default function TodoList() {
  const { todos, updateTodo, removeTodo } = useStore(
    ({ todos, updateTodo, removeTodo }) => ({ todos, updateTodo, removeTodo })
  )

  return (
    <ul>
      {todos.map(({ id, text, done }) => (
        <li key={id}>
          <input
            type='checkbox'
            checked={done}
            onChange={() => {
              updateTodo(id, { done: !done })
            }}
          />
          <span>{text}</span>
          <button
            onClick={() => {
              removeTodo(id)
            }}
          >
            Remove
          </button>
        </li>
      ))}
    </ul>
  )
}
