import { User } from '@prisma/client'
import useSWRImmutable from 'swr/immutable'

async function fetcher<T>(
  input: RequestInfo | URL,
  init?: RequestInit | undefined
): Promise<T> {
  return fetch(input, init).then((res) => res.json())
}

export function useUser() {
  const { data, error, mutate } = useSWRImmutable<any>(
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

    return {
      user: undefined,
      accessToken: undefined,
      mutate
    }
  }

  const message = data?.message

  if (message) {
    console.log(message)

    return {
      user: undefined,
      accessToken: undefined,
      mutate
    }
  }

  return {
    user: data?.user as User,
    accessToken: data?.accessToken as string,
    mutate
  }
}
