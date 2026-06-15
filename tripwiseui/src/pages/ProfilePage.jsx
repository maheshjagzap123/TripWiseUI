import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { useAuth } from '../context/AuthContext'
import { userApi, tripApi, expenseApi } from '../api'
import { Button, Card, Input, Spinner, StatCard } from '../components/ui'
import { User, Mail, Phone, Save, LogOut, Map, Receipt } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

function fmt(n) { return `₹${Number(n || 0).toLocaleString()}` }

export default function ProfilePage() {
  const { user, logout, updateUser } = useAuth()
  const navigate = useNavigate()
  const [stats, setStats] = useState(null)
  const [loadingStats, setLoadingStats] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState('')

  const { register, handleSubmit, formState: { errors } } = useForm({
    defaultValues: {
      fullName: user?.fullName || '',
      email: user?.email || '',
      phoneNumber: user?.phoneNumber || '',
    },
  })

  // Load trip + expense stats
  useEffect(() => {
    Promise.all([tripApi.getAll(), expenseApi.getAll('all')])
      .then(([tripsRes, expRes]) => {
        const trips = tripsRes.data.data || []
        const exps  = expRes.data.data  || []
        setStats({
          totalTrips:  trips.length,
          activeTrips: trips.filter(t => t.status === 'Active').length,
          totalSpend:  exps.reduce((s, e) => s + (e.amount || 0), 0),
        })
      })
      .catch(() => {})
      .finally(() => setLoadingStats(false))
  }, [])

  const onSubmit = async (data) => {
    setSaving(true)
    setError('')
    try {
      await userApi.updateProfile(user?.userId, data)
      updateUser(data)
      setSaved(true)
      setTimeout(() => setSaved(false), 2500)
    } catch (e) {
      setError(e.response?.data?.message || 'Failed to update profile')
    } finally {
      setSaving(false)
    }
  }

  const handleLogout = () => { logout(); navigate('/login') }

  return (
    <div className="page-enter px-4 sm:px-8 py-8 max-w-lg mx-auto">
      <h1 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-6">Profile</h1>

      {/* Stats */}
      {loadingStats ? (
        <div className="flex justify-center py-6"><Spinner /></div>
      ) : stats && (
        <div className="grid grid-cols-3 gap-3 mb-5">
          <StatCard label="Total Trips"  value={stats.totalTrips}           icon={Map}     color="indigo" />
          <StatCard label="Active"       value={stats.activeTrips}          icon={Map}     color="green"  />
          <StatCard label="Total Spent"  value={fmt(stats.totalSpend)}      icon={Receipt} color="amber"  />
        </div>
      )}

      {/* Avatar */}
      <Card className="p-5 mb-5 flex items-center gap-4">
        <div className="w-16 h-16 bg-indigo-100 dark:bg-indigo-900/40 rounded-2xl flex items-center justify-center flex-shrink-0">
          <span className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">
            {user?.fullName?.[0]?.toUpperCase() || '?'}
          </span>
        </div>
        <div>
          <p className="font-bold text-gray-900 dark:text-gray-100 text-lg">{user?.fullName || '—'}</p>
          <p className="text-sm text-gray-500 dark:text-gray-400">{user?.email}</p>
        </div>
      </Card>

      {/* Edit form */}
      <Card className="p-5 mb-4">
        <h2 className="text-sm font-semibold text-gray-800 dark:text-gray-200 mb-4">Personal Details</h2>
        {error && <p className="text-sm text-red-600 bg-red-50 rounded-xl px-4 py-3 mb-4">{error}</p>}
        {saved  && <p className="text-sm text-emerald-600 bg-emerald-50 rounded-xl px-4 py-3 mb-4">Profile updated!</p>}
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <Input
            label="Full Name"
            placeholder="John Doe"
            error={errors.fullName?.message}
            {...register('fullName', { required: 'Full name is required' })}
          />
          <Input
            label="Email"
            type="email"
            placeholder="you@example.com"
            error={errors.email?.message}
            {...register('email', { required: 'Email is required' })}
          />
          <Input
            label="Phone Number"
            type="tel"
            placeholder="+91 98765 43210"
            {...register('phoneNumber')}
          />
          <Button type="submit" className="w-full" loading={saving}>
            <Save className="w-4 h-4" /> Save Changes
          </Button>
        </form>
      </Card>

      {/* Sign out */}
      <Card className="p-5">
        <button
          onClick={handleLogout}
          className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium text-red-600 dark:text-red-400 border border-red-200 dark:border-red-800 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all"
        >
          <LogOut className="w-4 h-4" /> Sign Out
        </button>
      </Card>
    </div>
  )
}
