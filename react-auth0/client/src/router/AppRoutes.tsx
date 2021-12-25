import { Routes, Route } from 'react-router-dom'
import {
  AboutPage,
  HomePage,
  MessagePage,
  ProfilePage
} from 'pages/index.pages'

export const AppRoutes = () => (
  <Routes>
    <Route path='/' element={<HomePage />} />
    <Route path='/profile' element={<ProfilePage />} />
    <Route path='/message' element={<MessagePage />} />
    <Route path='/about' element={<AboutPage />} />
  </Routes>
)
