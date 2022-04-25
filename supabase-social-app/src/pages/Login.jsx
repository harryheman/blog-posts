import userApi from 'a/user'
import { Form } from 'c'
import useStore from 'h/useStore'
import { useNavigate } from 'react-router-dom'

const fields = [
  {
    id: 'email',
    label: 'Email',
    type: 'email'
  },
  {
    id: 'password',
    label: 'Password',
    type: 'password'
  }
]

export const Login = () => {
  const { setUser, setLoading, setError } = useStore(
    ({ setUser, setLoading, setError }) => ({ setUser, setLoading, setError })
  )
  const navigate = useNavigate()

  const register = async (data) => {
    setLoading(true)
    userApi
      .login(data)
      .then((user) => {
        setUser(user)
        navigate('/')
      })
      .catch(setError)
  }

  return (
    <div className='page login'>
      <h1>Login</h1>
      <Form fields={fields} submit={register} button='Login' />
    </div>
  )
}
