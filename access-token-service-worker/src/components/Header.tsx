import { useUser } from '@/utils/swr'
import Link from 'next/link'

export default function Header() {
  const { user, mutateUser } = useUser()

  const onClick = async () => {
    try {
      // выполняем запрос
      const res = await fetch('/api/auth/logout')

      if (!res.ok) {
        throw res
      }

      // инвалидируем кэш
      mutateUser(undefined)
    } catch (e) {
      console.error(e)
    }
  }

  return (
    <header>
      <nav>
        <ul>
          <li>
            <Link href={'/'}>Home</Link>
          </li>
          {user ? (
            <li>
              <button onClick={onClick}>Logout</button>
            </li>
          ) : (
            <>
              <li>
                <Link href={'/register'}>Register</Link>
              </li>
              <li>
                <Link href={'/login'}>Login</Link>
              </li>
            </>
          )}
        </ul>
      </nav>
    </header>
  )
}
