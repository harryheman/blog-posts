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
  }>({})

  const onSubmit: React.FormEventHandler = async (e) => {
    e.preventDefault()

    // получаем данные формы в виде объекта
    const formData = formToObj<Pick<User, 'email' | 'password'>>(
      e.target as HTMLFormElement
    )

    try {
      // выполняем запрос
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        body: JSON.stringify(formData)
      })

      if (!res.ok) {
        // пользователь уже зарегистрирован
        if (res.status === 409) {
          return setErrors({ email: true })
        }
        throw res
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
              <small>Email already in use</small>
            </p>
          )}
        </label>
        <label>
          Password:{' '}
          <input type='password' name='password' minLength={6} required />{' '}
        </label>
        <button>Register</button>
      </form>
    </>
  )
}
