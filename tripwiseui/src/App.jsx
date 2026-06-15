import { Routes, Route, Navigate, useLocation } from 'react-router-dom'
import { useAuth } from './context/AuthContext'

import AppLayout from './components/layout/AppLayout'
import LoginPage from './pages/auth/LoginPage'
import CompleteProfilePage from './pages/CompleteProfilePage'

import TripsPage from './pages/trips/TripsPage'
import TripLayout from './pages/trips/TripLayout'
import TripDashboard from './pages/trips/TripDashboard'
import BudgetPage from './pages/trips/BudgetPage'
import ExpensesPage from './pages/trips/ExpensesPage'
import MembersPage from './pages/trips/MembersPage'
import SettlementsPage from './pages/trips/SettlementsPage'
import WalletPage from './pages/trips/WalletPage'
import AnalyticsPage from './pages/trips/AnalyticsPage'

import NotificationsPage from './pages/NotificationsPage'
import ProfilePage from './pages/ProfilePage'

// Redirects to /login if not authenticated
function PrivateRoute({ children }) {
  const { isAuthenticated } = useAuth()
  return isAuthenticated ? children : <Navigate to="/login" replace />
}

// Redirects away from /login if already authenticated
function PublicRoute({ children }) {
  const { isAuthenticated } = useAuth()
  return isAuthenticated ? <Navigate to="/" replace /> : children
}

// Redirects to /complete-profile if user hasn't set their name yet.
// The profile page itself is always allowed through so they can save.
function ProfileGate({ children }) {
  const { user } = useAuth()
  const location = useLocation()
  const profileComplete = !!user?.fullName?.trim()
  const allowed = location.pathname === '/complete-profile' || location.pathname === '/profile'

  if (!profileComplete && !allowed) {
    return <Navigate to="/complete-profile" replace />
  }
  return children
}

export default function App() {
  return (
    <Routes>
      {/* Public */}
      <Route path="/login" element={<PublicRoute><LoginPage /></PublicRoute>} />

      {/* Complete profile — authenticated but no name yet */}
      <Route
        path="/complete-profile"
        element={
          <PrivateRoute>
            <CompleteProfilePage />
          </PrivateRoute>
        }
      />

      {/* All app routes — authenticated + profile complete */}
      <Route
        element={
          <PrivateRoute>
            <ProfileGate>
              <AppLayout />
            </ProfileGate>
          </PrivateRoute>
        }
      >
        <Route index element={<TripsPage />} />
        <Route path="notifications" element={<NotificationsPage />} />
        <Route path="profile" element={<ProfilePage />} />

        <Route path="trips/:tripId" element={<TripLayout />}>
          <Route index element={<TripDashboard />} />
          <Route path="budget" element={<BudgetPage />} />
          <Route path="expenses" element={<ExpensesPage />} />
          <Route path="members" element={<MembersPage />} />
          <Route path="settlements" element={<SettlementsPage />} />
          <Route path="wallet" element={<WalletPage />} />
          <Route path="analytics" element={<AnalyticsPage />} />
        </Route>
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
