import { useEffect, useState } from 'react'
import { trpc } from './trpc'

function App() {
  // useEffect(() => {
  //   trpc.user.getUsers.query().then(console.log).catch(console.error)
  // }, [])

  const {
    data: usersData,
    isLoading: isUsersLoading,
    refetch,
  } = trpc.user.getUsers.useQuery()

  const [userId, setUserId] = useState('0')
  const {
    data: userData,
    isLoading: isUserLoading,
    error,
  } = trpc.user.getUserById.useQuery(userId, {
    retry: false,
    refetchOnWindowFocus: false,
  })

  const [userName, setUserName] = useState('Some Body')
  const createUserMutation = trpc.user.createUser.useMutation({
    onSuccess: () => refetch(),
  })

  if (isUsersLoading || isUserLoading) return <div>Loading...</div>

  const getUserById: React.FormEventHandler = (e) => {
    e.preventDefault()
    const input = (e.target as HTMLFormElement).elements[0] as HTMLInputElement
    const userId = input.value.replace(/\s+/g, '')
    if (userId) {
      setUserId(userId)
    }
  }

  const createUser: React.FormEventHandler = (e) => {
    e.preventDefault()
    const name = userName.trim()
    if (name) {
      createUserMutation.mutate({ name })
      setUserName('')
    }
  }

  return (
    <div>
      <ul>
        {(usersData ?? []).map((user) => (
          <li key={user.id}>{user.name}</li>
        ))}
      </ul>
      <div>
        <form onSubmit={getUserById}>
          <label>
            Get user by ID <input type='text' defaultValue={userId} />
          </label>
          <button>Get</button>
        </form>
        {userData && <div>{userData.name}</div>}
        {error && <div style={{ color: 'red' }}>{error.message}</div>}
      </div>
      <form onSubmit={createUser}>
        <label>
          Create new user{' '}
          <input
            type='text'
            value={userName}
            onChange={(e) => setUserName(e.target.value)}
          />
        </label>
        <button>Create</button>
      </form>
    </div>
  )
}

export default App
