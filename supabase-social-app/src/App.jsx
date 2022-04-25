import './styles/app.scss'
import { Routes, Route } from 'react-router-dom'
import { Home, About, Register, Login, Profile, Blog, Post } from 'p'
import { Nav, Layout } from 'c'
import { useEffect } from 'react'
import useStore from 'h/useStore'
import userApi from 'a/user'

function App() {
  const { user, setUser, setLoading, setError, fetchAllData } = useStore(
    ({ user, setUser, setLoading, setError, fetchAllData }) => ({
      user,
      setUser,
      setLoading,
      setError,
      fetchAllData
    })
  )

  useEffect(() => {
    if (!user) {
      setLoading(true)
      userApi
        .get()
        .then((user) => {
          setUser(user)
          fetchAllData()
        })
        .catch(setError)
    }
  }, [])

  return (
    <div className='app'>
      <header>
        <Nav />
      </header>
      <main>
        <Layout>
          <Routes>
            <Route path='/' element={<Home />} />
            <Route path='/blog' element={<Blog />} />
            <Route path='/blog/post/:id' element={<Post />} />
            <Route path='/about' element={<About />} />
            <Route path='/register' element={<Register />} />
            <Route path='/login' element={<Login />} />
            <Route path='/profile' element={<Profile />} />
          </Routes>
        </Layout>
      </main>
      <footer>
        <p>&copy; 2022. Not all rights reserved</p>
      </footer>
    </div>
  )
}

export default App
