import formToObj from '@/utils/formToObj'
import { useUser } from '@/utils/swr'
import { User } from '@prisma/client'
import { useRouter } from 'next/router'
import { useState } from 'react'

export default function Register() {
  const router = useRouter()
  const { mutateUser } = useUser()

  const [errors, setErrors] = useState<{
    email?: boolean
    password?: boolean
  }>({})

  const onSubmit: React.FormEventHandler = async (e) => {
    e.preventDefault()

    // получаем данные формы в виде объекта
    const formData = formToObj<Pick<User, 'email' | 'password'>>(
      e.target as HTMLFormElement
    )

    try {
      // выполняем запрос
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        body: JSON.stringify(formData)
      })

      if (!res.ok) {
        switch (res.status) {
          // пользователь не найден
          case 404:
            return setErrors({ email: true })
          // пользователь ввел неправильный пароль
          case 403:
            return setErrors({ password: true })
          default:
            throw res
        }
      }

      const userData = (await res.json()) as Pick<User, 'id' | 'email'>
      // инвалидируем кэш
      mutateUser(userData)
      // выполняем перенаправление на главную страницу
      router.push('/')
    } catch (e) {
      console.error(e)
    }
  }

  const onInput = () => {
    setErrors({})
  }

  return (
    <>
      <form onSubmit={onSubmit} onInput={onInput}>
        <label>
          Email:{' '}
          <input
            type='email'
            name='email'
            pattern='[^@\s]+@[^@\s]+\.[^@\s]+'
            required
          />
          {errors.email && (
            <p style={{ color: 'red' }}>
              <small>User not found</small>
            </p>
          )}
        </label>
        <label>
          Password:{' '}
          <input type='password' name='password' minLength={6} required />
          {errors.password && (
            <p style={{ color: 'red' }}>
              <small>Wrong password</small>
            </p>
          )}
        </label>
        <button>Login</button>
      </form>
    </>
  )
}
