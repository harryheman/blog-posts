import { useAuth0 } from '@auth0/auth0-react'
import { LoginButton } from './LoginButton/LoginButton'
import { LogoutButton } from './LogoutButton/LogoutButton'

export const AuthButton = () => {
  const { isAuthenticated } = useAuth0()

  return isAuthenticated ? <LogoutButton /> : <LoginButton />
}
