import { useEffect, useState } from 'react'
import { useParams, NavLink, Outlet, useNavigate } from 'react-router-dom'
import { tripApi } from '../../api'
import { Badge, Spinner, Button } from '../../components/ui'
import { ArrowLeft, MapPin, Calendar, LayoutDashboard, DollarSign, Receipt, Users, Handshake, Wallet, BarChart2, Trash2 } from 'lucide-react'

const statusColor = { Active: 'green', Completed: 'blue', Cancelled: 'red' }

const tabs = [
  { to: '', label: 'Dashboard', icon: LayoutDashboard, end: true },
  { to: 'budget', label: 'Budget', icon: DollarSign },
  { to: 'expenses', label: 'Expenses', icon: Receipt },
  { to: 'members', label: 'Members', icon: Users },
  { to: 'settlements', label: 'Settlements', icon: Handshake },
  { to: 'wallet', label: 'Wallet', icon: Wallet },
  { to: 'analytics', label: 'Analytics', icon: BarChart2 },
]

export default function TripLayout() {
  const { tripId } = useParams()
  const navigate = useNavigate()
  const [trip, setTrip] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    tripApi.getById(tripId)
      .then(res => setTrip(res.data.data))
      .catch(() => navigate('/'))
      .finally(() => setLoading(false))
  }, [tripId])

  if (loading) return <div className="flex justify-center items-center h-64"><Spinner /></div>
  if (!trip) return null

  return (
    <div className="flex flex-col h-full">
      {/* Trip Header */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-100 dark:border-gray-700 px-4 sm:px-6 py-4 flex-shrink-0">
        <div className="max-w-6xl mx-auto">
          <button onClick={() => navigate('/')} className="flex items-center gap-1 text-sm text-gray-500 dark:text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 mb-3 transition-colors">
            <ArrowLeft className="w-4 h-4" /> All Trips
          </button>
          <div className="flex items-start justify-between gap-4 flex-wrap">
            <div>
              <div className="flex items-center gap-2 flex-wrap mb-1">
                <h1 className="text-lg font-bold text-gray-900 dark:text-slate-100">{trip.tripName}</h1>
                <Badge color={statusColor[trip.status] || 'gray'}>{trip.status}</Badge>
                <Badge color="purple">{trip.tripType}</Badge>
              </div>
              <div className="flex items-center gap-3 text-sm text-gray-500 dark:text-slate-400 flex-wrap">
                <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5" />{trip.destination}</span>
                <span className="flex items-center gap-1"><Calendar className="w-3.5 h-3.5" />{trip.startDate?.slice(0, 10)} – {trip.endDate?.slice(0, 10)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tab Nav */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-100 dark:border-gray-700 flex-shrink-0">
        <div className="max-w-6xl mx-auto px-2 sm:px-6">
          <div className="flex overflow-x-auto scrollbar-hide gap-1 py-1">
            {tabs.map(({ to, label, icon: Icon, end }) => (
              <NavLink
                key={label}
                to={to === '' ? `/trips/${tripId}` : `/trips/${tripId}/${to}`}
                end={end}
                className={({ isActive }) =>
                  `flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium whitespace-nowrap transition-all ${
                    isActive
                      ? 'bg-indigo-50 dark:bg-indigo-900/40 text-indigo-700 dark:text-indigo-400'
                      : 'text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700/50'
                  }`
                }
              >
                <Icon className="w-3.5 h-3.5" /> {label}
              </NavLink>
            ))}
          </div>
        </div>
      </div>

      {/* Tab Content */}
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-6xl mx-auto px-4 sm:px-8 py-6">
          <Outlet context={{ trip, setTrip }} />
        </div>
      </div>
    </div>
  )
}
