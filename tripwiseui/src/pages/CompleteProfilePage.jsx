import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { useAuth } from '../context/AuthContext'
import { userApi } from '../api'
import { Button, Input, Card } from '../components/ui'
import { Plane, UserCircle } from 'lucide-react'

export default function CompleteProfilePage() {
  const { user, updateUser } = useAuth()
  const navigate = useNavigate()
  const [error, setError] = useState('')
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm({
    defaultValues: { fullName: '', phoneNumber: '' },
  })

  const onSubmit = async (data) => {
    setError('')
    try {
      await userApi.updateProfile(user?.userId, data)
      updateUser(data)
      navigate('/', { replace: true })
    } catch (e) {
      setError(e.response?.data?.message || 'Failed to save profile')
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-blue-50 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800 flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="flex flex-col items-center mb-8">
          <div className="w-14 h-14 bg-indigo-600 rounded-2xl flex items-center justify-center mb-3 shadow-lg shadow-indigo-200">
            <Plane className="w-7 h-7 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">TripWise</h1>
        </div>

        <Card className="p-6 shadow-xl shadow-gray-100 dark:shadow-gray-900">
          {/* Icon + heading */}
          <div className="flex flex-col items-center mb-5">
            <div className="w-14 h-14 bg-indigo-100 dark:bg-indigo-900/40 rounded-2xl flex items-center justify-center mb-3">
              <UserCircle className="w-8 h-8 text-indigo-600 dark:text-indigo-400" />
            </div>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Complete your profile</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 text-center">
              Tell us your name before you start planning trips.
            </p>
          </div>

          {user?.email && (
            <p className="text-xs text-gray-400 dark:text-gray-500 text-center mb-4">
              Signed in as <span className="font-medium text-gray-600 dark:text-gray-300">{user.email}</span>
            </p>
          )}

          {error && (
            <p className="text-sm text-red-600 bg-red-50 rounded-xl px-4 py-3 mb-4">{error}</p>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <Input
              label="Full Name"
              placeholder="John Doe"
              autoFocus
              error={errors.fullName?.message}
              {...register('fullName', { required: 'Please enter your full name' })}
            />
            <Input
              label="Phone Number"
              type="tel"
              placeholder="+91 98765 43210"
              error={errors.phoneNumber?.message}
              {...register('phoneNumber', { required: 'Please enter your phone number' })}
            />
            <Button type="submit" className="w-full" loading={isSubmitting}>
              Save &amp; Continue
            </Button>
          </form>
        </Card>
      </div>
    </div>
  )
}
