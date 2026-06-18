import { Navigate, Route, Routes } from 'react-router-dom'
import Layout from './components/Layout'
import Feed from './routes/Feed'
import Home from './routes/Home'
import Login from './routes/Login'
import Profile from './routes/Profile'
import ProfileSetup from './routes/ProfileSetup'
import ProtectedRoute from './components/ProtectedRoute'
import AdminDashboard from './routes/AdminDashboard'
import Basecamp from './routes/Basecamp'
import CollectionTracker from './routes/CollectionTracker'
import Community from './routes/Community'
import LogFind from './routes/LogFind'
import SavedLocations from './routes/SavedLocations'
import PublicPage from './routes/PublicPage'

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/create-account" element={<Login initialMode="createAccount" />} />
        <Route path="/create-basecamp" element={<Login initialMode="createAccount" />} />
        <Route path="/feed" element={<Feed />} />
        <Route path="/discoveries" element={<Feed />} />
        <Route path="/members" element={<PublicPage page="members" />} />
        <Route path="/founding-members" element={<PublicPage page="founding-members" />} />
        <Route path="/clubs" element={<PublicPage page="clubs" />} />
        <Route path="/events" element={<PublicPage page="events" />} />
        <Route path="/businesses" element={<PublicPage page="businesses" />} />
        <Route path="/challenges" element={<PublicPage page="challenges" />} />
        <Route path="/about" element={<PublicPage page="about" />} />
        <Route path="/membership" element={<PublicPage page="membership" />} />
        <Route path="/community" element={<Community />} />
        <Route
          path="/profile"
          element={
            <ProtectedRoute requireProfile={false}>
              <ProfileSetup />
            </ProtectedRoute>
          }
        />
        <Route
          path="/create-profile"
          element={
            <ProtectedRoute requireProfile={false}>
              <ProfileSetup />
            </ProtectedRoute>
          }
        />
        <Route
          path="/onboarding/profile"
          element={
            <ProtectedRoute requireProfile={false}>
              <ProfileSetup />
            </ProtectedRoute>
          }
        />
        <Route
          path="/profile/edit"
          element={
            <ProtectedRoute requireProfile={false}>
              <ProfileSetup />
            </ProtectedRoute>
          }
        />
        <Route path="/profile/:handle" element={<Profile />} />
        <Route
          path="/basecamp"
          element={
            <ProtectedRoute>
              <Basecamp />
            </ProtectedRoute>
          }
        />
        <Route
          path="/collection"
          element={
            <ProtectedRoute>
              <CollectionTracker />
            </ProtectedRoute>
          }
        />
        <Route
          path="/collections"
          element={
            <ProtectedRoute>
              <CollectionTracker />
            </ProtectedRoute>
          }
        />
        <Route
          path="/map"
          element={
            <ProtectedRoute>
              <SavedLocations />
            </ProtectedRoute>
          }
        />
        <Route
          path="/spots"
          element={
            <ProtectedRoute>
              <SavedLocations />
            </ProtectedRoute>
          }
        />
        <Route
          path="/saved-locations"
          element={
            <ProtectedRoute>
              <SavedLocations />
            </ProtectedRoute>
          }
        />
        <Route
          path="/log-find"
          element={
            <ProtectedRoute>
              <LogFind />
            </ProtectedRoute>
          }
        />
        <Route
          path="/field-guides"
          element={
            <ProtectedRoute>
              <Feed />
            </ProtectedRoute>
          }
        />
        <Route
          path="/messages"
          element={
            <ProtectedRoute>
              <Community />
            </ProtectedRoute>
          }
        />
        <Route
          path="/notifications"
          element={
            <ProtectedRoute>
              <Community />
            </ProtectedRoute>
          }
        />
        <Route
          path="/settings"
          element={
            <ProtectedRoute requireProfile={false}>
              <ProfileSetup />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin"
          element={
            <ProtectedRoute adminOnly>
              <AdminDashboard />
            </ProtectedRoute>
          }
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  )
}
