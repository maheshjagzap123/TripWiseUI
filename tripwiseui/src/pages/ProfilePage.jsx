import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { useAuth } from '../context/AuthContext'
import { userApi } from '../api'
import { Button, Card, Input, Spinner } from '../components/ui'
import { User, Mail, Phone, Shield, LogOut, Save } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

export default function ProfilePage() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState('')

  const { register, handleSubmit, reset, formState: { errors } } = useForm()

  useEffect(() => {
    if (!user?.userId) { setLoading(false); return }
    userApi.getProfile(user.userId)
      .then(res => {
        const data = res.data.data
        setProfile(data)
        reset({ fullName: data.fullName, email: data.email, phoneNumber: data.phoneNumber })
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [user?.userId])

  const onSubmit = async (data) => {
    setSaving(true)
    setError('')
    try {
      await userApi.updateProfile(user.userId, data)
      setSaved(true)
      setTimeout(() => setSaved(false), 2500)
    } catch (e) {
      setError(e.response?.data?.message || 'Failed to update profile')
    } finally {
      setSaving(false)
    }
  }

  const handleLogout = () => { logout(); navigate('/login') }

  if (loading) return <div className="flex justify-center py-16"><Spinner /></div>

  return (
    <div className="p-4 sm:p-6 max-w-lg mx-auto">
      <h1 className="text-xl font-bold text-gray-900 mb-6">Profile</h1>

      {/* Avatar + role banner */}
      <Card className="p-5 mb-5 flex items-center gap-4">
        <div className="w-16 h-16 bg-indigo-100 rounded-2xl flex items-center justify-center flex-shrink-0">
          <span className="text-2xl font-bold text-indigo-600">
            {profile?.fullName?.[0]?.toUpperCase() || user?.role?.[0]}
          </span>
        </div>
        <div>
          <p className="font-bold text-gray-900 text-lg">{profile?.fullName || '—'}</p>
          <div className="flex items-center gap-1.5 mt-0.5">
            <Shield className="w-3.5 h-3.5 text-indigo-500" />
            <span className="text-sm text-indigo-600 font-medium">{user?.role}</span>
          </div>
        </div>
      </Card>

      {/* Edit form */}
      <Card className="p-5 mb-4">
        <h2 className="text-sm font-semibold text-gray-800 mb-4">Edit Details</h2>
        {error && <p className="text-sm text-red-600 bg-red-50 rounded-xl px-4 py-3 mb-4">{error}</p>}
        {saved && <p className="text-sm text-emerald-600 bg-emerald-50 rounded-xl px-4 py-3 mb-4">Profile updated successfully!</p>}
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
            placeholder="+1 234 567 8900"
            {...register('phoneNumber')}
          />
          <Button type="submit" className="w-full" loading={saving}>
            <Save className="w-4 h-4" /> Save Changes
          </Button>
        </form>
      </Card>

      {/* Danger zone */}
      <Card className="p-5 border-red-100">
        <h2 className="text-sm font-semibold text-gray-800 mb-3">Account</h2>
        <button
          onClick={handleLogout}
          className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium text-red-600 border border-red-200 hover:bg-red-50 transition-all"
        >
          <LogOut className="w-4 h-4" /> Sign Out
        </button>
      </Card>
    </div>
  )
}
