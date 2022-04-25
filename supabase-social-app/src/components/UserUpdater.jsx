import { Form, AvatarUploader } from 'c'
import useStore from 'h/useStore'
import userApi from 'a/user'

export const UserUpdater = () => {
  const { user, setUser, setLoading, setError } = useStore(
    ({ user, setUser, setLoading, setError }) => ({
      user,
      setUser,
      setLoading,
      setError
    })
  )

  const updateUser = async (data) => {
    setLoading(true)
    userApi.update(data).then(setUser).catch(setError)
  }

  const fields = [
    {
      id: 'first_name',
      label: 'First Name',
      type: 'text',
      value: user.first_name
    },
    {
      id: 'last_name',
      label: 'Last Name',
      type: 'text',
      value: user.last_name
    },
    {
      id: 'age',
      label: 'Age',
      type: 'number',
      value: user.age
    }
  ]

  return (
    <div className='user-updater'>
      <h2>Update User</h2>
      <AvatarUploader />
      <h3>User Bio</h3>
      <Form fields={fields} submit={updateUser} button='Update' />
    </div>
  )
}
