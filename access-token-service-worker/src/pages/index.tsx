import CreateTodoForm from '@/components/CreateTodoForm'
import TodoList from '@/components/TodoList'
import { useUser } from '@/utils/swr'

export default function Home() {
  // запрашиваем данные пользователя
  const { user } = useUser()

  return (
    <>
      <h1>Welcome, {user ? user.email : 'stranger'}</h1>
      <CreateTodoForm />
      <TodoList />
    </>
  )
}
