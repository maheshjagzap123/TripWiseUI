import { NavLink, useNavigate, Outlet, useLocation } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { useTheme } from '../../context/ThemeContext'
import { Bell, User, LogOut, Plane, Menu, X, LayoutDashboard, Sun, Moon } from 'lucide-react'
import { useState } from 'react'

const navItems = [
  { to: '/',              icon: LayoutDashboard, label: 'My Trips',      end: true },
  { to: '/notifications', icon: Bell,            label: 'Notifications'           },
  { to: '/profile',       icon: User,            label: 'Profile'                 },
]

const PAGE_TITLES = {
  '/':              'My Trips',
  '/notifications': 'Notifications',
  '/profile':       'Profile',
}

function NavItem({ to, icon: Icon, label, end, onClick }) {
  return (
    <NavLink
      to={to}
      end={end}
      onClick={onClick}
      className={({ isActive }) =>
        `flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
          isActive
            ? 'bg-indigo-50 dark:bg-indigo-900/40 text-indigo-700 dark:text-indigo-400'
            : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700/50 hover:text-gray-900 dark:hover:text-gray-100'
        }`
      }
    >
      <Icon className="w-5 h-5 flex-shrink-0" />
      <span>{label}</span>
    </NavLink>
  )
}

function ThemeToggle() {
  const { dark, toggle } = useTheme()
  return (
    <button
      onClick={toggle}
      aria-label={dark ? 'Switch to light mode' : 'Switch to dark mode'}
      className="relative w-12 h-6 rounded-full transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 dark:focus:ring-offset-gray-900"
      style={{ backgroundColor: dark ? '#6366f1' : '#d1d5db' }}
    >
      <span className="absolute inset-0 flex items-center justify-between px-1 pointer-events-none">
        <Sun  className="w-3 h-3 text-amber-400" />
        <Moon className="w-3 h-3 text-indigo-200" />
      </span>
      <span
        className="absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow-sm transition-transform duration-300"
        style={{ transform: dark ? 'translateX(24px)' : 'translateX(0)' }}
      />
    </button>
  )
}

export default function AppLayout() {
  const { user, logout } = useAuth()
  const navigate    = useNavigate()
  const location    = useLocation()
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const handleLogout = () => { logout(); navigate('/login') }

  // Derive a page title for the top bar
  const pageTitle = PAGE_TITLES[location.pathname] ?? ''

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="flex items-center gap-3 px-5 py-5 border-b border-gray-100 dark:border-gray-700">
        <div className="w-9 h-9 bg-indigo-600 rounded-xl flex items-center justify-center flex-shrink-0">
          <Plane className="w-5 h-5 text-white" />
        </div>
        <div>
          <span className="font-bold text-gray-900 dark:text-gray-100 text-lg leading-none">TripWise</span>
          <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">Smart Travel Finance</p>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {navItems.map((item) => (
          <NavItem key={item.to} {...item} onClick={() => setSidebarOpen(false)} />
        ))}
      </nav>

      {/* Footer */}
      <div className="px-3 py-4 border-t border-gray-100 dark:border-gray-700 space-y-3">
        {/* Theme toggle */}
        <div className="flex items-center justify-between px-3 py-1">
          <span className="text-xs font-medium text-gray-500 dark:text-gray-400">Appearance</span>
          <ThemeToggle />
        </div>

        {/* User */}
        <div className="flex items-center gap-3 px-3 py-2 rounded-xl bg-gray-50 dark:bg-gray-700/40">
          <div className="w-8 h-8 bg-indigo-100 dark:bg-indigo-900/50 rounded-full flex items-center justify-center flex-shrink-0">
            <span className="text-sm font-bold text-indigo-600 dark:text-indigo-400">
              {user?.fullName?.[0]?.toUpperCase() || '?'}
            </span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-semibold text-gray-800 dark:text-gray-200 truncate">{user?.fullName || 'User'}</p>
            <p className="text-xs text-gray-400 dark:text-gray-500 truncate">{user?.email}</p>
          </div>
        </div>

        {/* Logout */}
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all"
        >
          <LogOut className="w-4 h-4" /> Sign Out
        </button>
      </div>
    </div>
  )

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-200 overflow-hidden">

      {/* ── Desktop Sidebar ─────────────────────────────────────────────── */}
      <aside className="hidden lg:flex flex-col w-64 bg-white dark:bg-gray-800 border-r border-gray-100 dark:border-gray-700 flex-shrink-0">
        <SidebarContent />
      </aside>

      {/* ── Mobile Sidebar Overlay ──────────────────────────────────────── */}
      {sidebarOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setSidebarOpen(false)} />
          <aside
            className="relative w-72 bg-white dark:bg-gray-800 h-full shadow-2xl"
            style={{ animation: 'slideInLeft 220ms cubic-bezier(0.34,1.56,0.64,1) forwards' }}
          >
            <button
              className="absolute top-4 right-4 p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
              onClick={() => setSidebarOpen(false)}
            >
              <X className="w-5 h-5 text-gray-500 dark:text-gray-400" />
            </button>
            <SidebarContent />
          </aside>
        </div>
      )}

      {/* ── Content area ────────────────────────────────────────────────── */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">

        {/* Top bar — visible on ALL screen sizes */}
        <header className="flex-shrink-0 flex items-center justify-between
                           px-4 sm:px-6 h-14
                           bg-white dark:bg-gray-800
                           border-b border-gray-100 dark:border-gray-700">
          {/* Left: hamburger (mobile) OR page title (desktop) */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700"
            >
              <Menu className="w-5 h-5 text-gray-600 dark:text-gray-300" />
            </button>

            {/* Mobile brand */}
            <div className="lg:hidden flex items-center gap-2">
              <div className="w-7 h-7 bg-indigo-600 rounded-lg flex items-center justify-center">
                <Plane className="w-4 h-4 text-white" />
              </div>
              <span className="font-bold text-gray-900 dark:text-gray-100">TripWise</span>
            </div>

            {/* Desktop page title */}
            {pageTitle && (
              <h1 className="hidden lg:block text-base font-semibold text-gray-800 dark:text-gray-200">
                {pageTitle}
              </h1>
            )}
          </div>

          {/* Right: theme toggle + bell */}
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <NavLink
              to="/notifications"
              className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500 dark:text-gray-400 transition-colors"
            >
              <Bell className="w-5 h-5" />
            </NavLink>
          </div>
        </header>

        {/* Scrollable page content */}
        <main className="flex-1 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
