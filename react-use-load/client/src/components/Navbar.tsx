import { Link } from 'react-router-dom'
import { TRoute } from 'types'

type Props = {
  routes: TRoute[]
}

export const Navbar: React.FC<Props> = ({ routes }) => (
  <nav>
    <ul>
      {routes.map(({ path, name }, i) => (
        <li key={i}>
          <Link to={path}>{name}</Link>
        </li>
      ))}
    </ul>
  </nav>
)
