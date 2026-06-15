import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './context/AuthContext'

// Layouts
import AppLayout from './components/layout/AppLayout'

// Auth pages
import LoginPage from './pages/auth/LoginPage'
import RegisterPage from './pages/auth/RegisterPage'
import ForgotPasswordPage from './pages/auth/ForgotPasswordPage'

// Trip pages
import TripsPage from './pages/trips/TripsPage'
import TripLayout from './pages/trips/TripLayout'
import TripDashboard from './pages/trips/TripDashboard'
import BudgetPage from './pages/trips/BudgetPage'
import ExpensesPage from './pages/trips/ExpensesPage'
import MembersPage from './pages/trips/MembersPage'
import SettlementsPage from './pages/trips/SettlementsPage'
import WalletPage from './pages/trips/WalletPage'
import AnalyticsPage from './pages/trips/AnalyticsPage'

// Other pages
import NotificationsPage from './pages/NotificationsPage'
import ProfilePage from './pages/ProfilePage'
import AdminPage from './pages/admin/AdminPage'

function PrivateRoute({ children }) {
  const { isAuthenticated } = useAuth()
  return isAuthenticated ? children : <Navigate to="/login" replace />
}

function PublicRoute({ children }) {
  const { isAuthenticated } = useAuth()
  return isAuthenticated ? <Navigate to="/" replace /> : children
}

function AdminRoute({ children }) {
  const { user } = useAuth()
  return user?.role === 'Admin' ? children : <Navigate to="/" replace />
}

export default function App() {
  return (
    <Routes>
      {/* Public routes */}
      <Route path="/login" element={<PublicRoute><LoginPage /></PublicRoute>} />
      <Route path="/register" element={<PublicRoute><RegisterPage /></PublicRoute>} />
      <Route path="/forgot-password" element={<PublicRoute><ForgotPasswordPage /></PublicRoute>} />

      {/* Protected routes */}
      <Route element={<PrivateRoute><AppLayout /></PrivateRoute>}>
        <Route index element={<TripsPage />} />
        <Route path="notifications" element={<NotificationsPage />} />
        <Route path="profile" element={<ProfilePage />} />
        <Route path="admin" element={<AdminRoute><AdminPage /></AdminRoute>} />

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

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
