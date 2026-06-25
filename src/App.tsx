import { lazy, Suspense } from 'react'
import { Navigate, Route, Routes } from 'react-router-dom'
import Layout from './components/Layout'
import Feed from './routes/Feed'
import ForumBoard from './routes/ForumBoard'
import Home from './routes/Home'
import Login from './routes/Login'
import Profile from './routes/Profile'
import ProfileSetup from './routes/ProfileSetup'
import ProtectedRoute from './components/ProtectedRoute'
import Basecamp from './routes/Basecamp'
import BusinessDirectory from './routes/BusinessDirectory'
import BusinessManage from './routes/BusinessManage'
import BusinessProfile from './routes/BusinessProfile'
import CollectionTracker from './routes/CollectionTracker'
import Community from './routes/Community'
import DestinationDetail from './routes/DestinationDetail'
import Destinations from './routes/Destinations'
import LogFind from './routes/LogFind'
import Guides from './routes/Guides'
import Materials from './routes/Materials'
import Messages from './routes/Messages'
import PublicPage from './routes/PublicPage'
import PublicCollection from './routes/PublicCollection'
import Settings from './routes/Settings'
import SpecimenDetail from './routes/SpecimenDetail'
import TripDetail from './routes/TripDetail'
import TripPlanner from './routes/TripPlanner'
import Trips from './routes/Trips'

const AdminDashboard = lazy(() => import('./routes/AdminDashboard'))

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route
          path="/create-account"
          element={<Login initialMode="createAccount" />}
        />
        <Route
          path="/create-basecamp"
          element={<Login initialMode="createAccount" />}
        />
        <Route path="/feed" element={<Feed />} />
        <Route path="/discoveries" element={<Feed />} />
        <Route path="/destinations" element={<Destinations />} />
        <Route path="/destinations/:slug" element={<DestinationDetail />} />
        <Route path="/materials" element={<Materials />} />
        <Route path="/trip-planner" element={<TripPlanner />} />
        <Route path="/trips/:slug" element={<TripDetail />} />
        <Route path="/guides" element={<Guides />} />
        <Route path="/members" element={<PublicPage page="members" />} />
        <Route
          path="/founding-members"
          element={<PublicPage page="founding-members" />}
        />
        <Route path="/businesses" element={<BusinessDirectory />} />
        <Route path="/businesses/:slug" element={<BusinessProfile />} />
        <Route
          path="/business/manage"
          element={
            <ProtectedRoute requireProfile={false}>
              <BusinessManage />
            </ProtectedRoute>
          }
        />
        <Route path="/about" element={<PublicPage page="about" />} />
        <Route path="/membership" element={<PublicPage page="membership" />} />
        <Route path="/community" element={<Community />} />
        <Route path="/community/:forumSlug" element={<ForumBoard />} />
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
          path="/profile/:handle/collection"
          element={<PublicCollection />}
        />
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
          path="/collections/:specimenId"
          element={
            <ProtectedRoute>
              <SpecimenDetail />
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
          path="/messages"
          element={
            <ProtectedRoute>
              <Messages />
            </ProtectedRoute>
          }
        />
        <Route
          path="/trips"
          element={
            <ProtectedRoute>
              <Trips />
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
              <Settings />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin"
          element={
            <ProtectedRoute adminOnly>
              <Suspense
                fallback={<p className="empty-state">Loading admin...</p>}
              >
                <AdminDashboard />
              </Suspense>
            </ProtectedRoute>
          }
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  )
}
