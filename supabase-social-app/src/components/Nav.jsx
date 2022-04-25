import { Link, useNavigate } from 'react-router-dom'
import useStore from 'h/useStore'
import userApi from '../api/user'
import { Loader } from './Loader'

export const Nav = () => {
  const { user, loading, setUser, setLoading, setError } = useStore(
    ({ user, loading, setUser, setLoading, setError }) => ({
      user,
      loading,
      setUser,
      setLoading,
      setError
    })
  )
  const navigate = useNavigate()

  const logout = () => {
    setLoading(true)
    userApi
      .logout()
      .then((user) => {
        setUser(user)
        navigate('/')
      })
      .catch(setError)
  }

  return (
    <nav>
      <ul>
        <li>
          <Link to='/'>Home</Link>
        </li>
        <li>
          <Link to='/blog'>Blog</Link>
        </li>
        <li>
          <Link to='/about'>About</Link>
        </li>
        {!user ? (
          <>
            <li>
              <Link to='/register'>Register</Link>
            </li>
            <li>
              <Link to='/login'>Login</Link>
            </li>
          </>
        ) : (
          <>
            <li>
              <button onClick={logout} className='danger'>
                Logout
              </button>
            </li>
            <li>
              <Link to='/profile'>
                {user.avatar_url ? (
                  loading ? (
                    <Loader width={20} />
                  ) : (
                    <img
                      src={user.avatar_url}
                      alt={user.username}
                      className='avatar'
                      title='Profile'
                    />
                  )
                ) : (
                  'Profile'
                )}
              </Link>
            </li>
          </>
        )}
      </ul>
    </nav>
  )
}
