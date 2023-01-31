import formToObj from '@/utils/formToObj'
import { useTodos, useUser } from '@/utils/swr'
import { Todo } from '@prisma/client'
import { useRef } from 'react'

export default function CreateTodoForm() {
  const { user } = useUser()
  const { todos, mutateTodos } = useTodos(Boolean(user))
  const formRef = useRef<HTMLFormElement | null>(null)

  if (!user) return null

  const onSubmit: React.FormEventHandler = async (e) => {
    e.preventDefault()
    // получаем данные формы в виде объекта
    const formData = formToObj<Pick<Todo, 'title' | 'content'>>(
      e.target as HTMLFormElement
    )

    try {
      // выполняем запрос на создание задачи
      const res = await fetch('/api/todo', {
        method: 'POST',
        body: JSON.stringify(formData)
      })
      if (!res.ok) throw res
      const newTodo = (await res.json()) as Pick<
        Todo,
        'id' | 'title' | 'content' | 'userId'
      >
      // инвалидируем кэш
      mutateTodos([...todos, newTodo])

      // сбрасываем форму
      if (formRef.current) {
        formRef.current.reset()
      }
    } catch (e) {
      console.log(e)
    }
  }

  return (
    <div>
      <h2>New Todo</h2>
      <form onSubmit={onSubmit} ref={formRef}>
        <label>
          Title: <input type='text' name='title' required />
        </label>
        <label>
          Content:{' '}
          <textarea name='content' cols={30} rows={5} required></textarea>
        </label>
        <button>Create</button>
      </form>
    </div>
  )
}
