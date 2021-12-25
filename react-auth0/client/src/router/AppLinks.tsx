import { Link } from 'react-router-dom'

export const AppLinks = () => {
  return (
    <ul>
      <li>
        <Link to='/'>Home</Link>
      </li>
      <li>
        <Link to='/profile'>Profile</Link>
      </li>
      <li>
        <Link to='/message'>Message</Link>
      </li>
      <li>
        <Link to='/about'>About</Link>
      </li>
    </ul>
  )
}
