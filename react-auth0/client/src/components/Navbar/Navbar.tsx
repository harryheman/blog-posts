import { AppLinks } from 'router/AppLinks'
import { AuthButton } from 'components/index.components'

export const Navbar = () => {
  return (
    <nav>
      <AppLinks />
      <AuthButton />
    </nav>
  )
}
