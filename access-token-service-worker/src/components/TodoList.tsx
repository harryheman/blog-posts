import { useTodos, useUser } from '@/utils/swr'

export default function TodoList() {
  const { user } = useUser()
  const { todos, mutateTodos } = useTodos(Boolean(user))

  if (!user || !todos.length) return null

  const onClick = async (id: string) => {
    try {
      // выполняем запрос на удаление задачи
      const res = await fetch(`/api/todo?id=${id}`, {
        method: 'DELETE'
      })
      if (!res.ok) throw res
      const newTodos = todos.filter((todo) => todo.id !== id)
      // инвалидируем кэш
      mutateTodos(newTodos)
    } catch (e) {
      console.log(e)
    }
  }

  return (
    <div>
      <h2>Todo List</h2>
      <ul>
        {todos.map((todo) => (
          <li key={todo.id}>
            <p>
              <b>{todo.title}</b>
            </p>
            <p>{todo.content}</p>
            <button onClick={() => onClick(todo.id)}>X</button>
          </li>
        ))}
      </ul>
    </div>
  )
}
