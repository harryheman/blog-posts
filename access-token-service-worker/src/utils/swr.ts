import type { Todo, User } from '@prisma/client'
import useSWRImmutable from 'swr/immutable'

function fetcher<T>(
  input: RequestInfo | URL,
  init?: RequestInit | undefined
): Promise<T> {
  return fetch(input, init).then((res) => res.json())
}

// хук для получения данных пользователя
export function useUser() {
  const { data, error, mutate } = useSWRImmutable<Pick<User, 'id' | 'email'>>(
    '/api/auth/user',
    (url) => fetcher(url, { credentials: 'include' }),
    {
      onErrorRetry(err, key, config, revalidate, revalidateOpts) {
        return false
      }
    }
  )

  if (error) {
    console.log(error)
  }

  return {
    user: data?.email ? data : undefined,
    mutateUser: mutate
  }
}

// хук для получения задач пользователя
export function useTodos(shouldFetch: boolean) {
  const { data, error, mutate } = useSWRImmutable<
    Pick<Todo, 'id' | 'title' | 'content'>[]
  >(shouldFetch ? '/api/todo' : null, (url) => fetcher(url), {
    onErrorRetry(err, key, config, revalidate, revalidateOpts) {
      return false
    }
  })

  if (error) {
    console.log(error)
  }

  return {
    todos: Array.isArray(data) ? data : [],
    mutateTodos: mutate
  }
}
