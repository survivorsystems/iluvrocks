import { Navigate, Route, Routes } from 'react-router-dom'
import Layout from './components/Layout'
import Feed from './routes/Feed'
import Home from './routes/Home'
import Login from './routes/Login'
import Profile from './routes/Profile'
import ProfileSetup from './routes/ProfileSetup'

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/feed" element={<Feed />} />
        <Route path="/profile" element={<ProfileSetup />} />
        <Route path="/profile/:handle" element={<Profile />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  )
}
