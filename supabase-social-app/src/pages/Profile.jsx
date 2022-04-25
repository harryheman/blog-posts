import { Protected, UserUpdater } from 'c'
import useStore from 'h/useStore'

export const Profile = () => {
  const user = useStore(({ user }) => user)
  const userCopy = { ...user }
  delete userCopy.avatar_url

  return (
    <Protected className='page profile'>
      <h1>Profile</h1>
      <div className='user-data'>
        <pre>{JSON.stringify(userCopy, null, 2)}</pre>
      </div>
      <UserUpdater />
    </Protected>
  )
}
