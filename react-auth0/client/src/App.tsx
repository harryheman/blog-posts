import './App.scss'
import { Navbar } from 'components/index.components'
import { AppRoutes } from 'router/AppRoutes'

export default function App() {
  return (
    <div className='app'>
      <header>
        <Navbar />
      </header>
      <main>
        <AppRoutes />
      </main>
      <footer>
        <p>&copy; 2021. Not all rights reserved.</p>
      </footer>
    </div>
  )
}
