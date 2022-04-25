import useStore from 'h/useStore'
import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'

export const Protected = ({ children, className }) => {
  const { user, loading } = useStore(({ user, loading }) => ({ user, loading }))
  const navigate = useNavigate()

  useEffect(() => {
    if (!loading && !user) {
      navigate('/')
    }
  }, [user, loading])

  if (!user) return null

  return <div className={className ? className : ''}>{children}</div>
}
