import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { Link } from 'react-router-dom'
import { authApi } from '../../api'
import { Button, Input, Card } from '../../components/ui'
import { Plane, ArrowLeft } from 'lucide-react'

export default function ForgotPasswordPage() {
  const [sent, setSent] = useState(false)
  const [error, setError] = useState('')
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm()

  const onSubmit = async ({ email }) => {
    try {
      await authApi.forgotPassword(email)
      setSent(true)
    } catch (e) {
      setError(e.response?.data?.message || 'Failed to send reset link')
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-blue-50 flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        <div className="flex flex-col items-center mb-8">
          <div className="w-14 h-14 bg-indigo-600 rounded-2xl flex items-center justify-center mb-3">
            <Plane className="w-7 h-7 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900">TripWise</h1>
        </div>

        <Card className="p-6 shadow-xl shadow-gray-100">
          {sent ? (
            <div className="text-center py-4">
              <div className="w-12 h-12 bg-emerald-100 rounded-2xl flex items-center justify-center mx-auto mb-3">
                <span className="text-2xl">✉️</span>
              </div>
              <h2 className="font-semibold text-gray-900 mb-2">Check your email</h2>
              <p className="text-sm text-gray-500">We've sent a password reset link to your email address.</p>
            </div>
          ) : (
            <>
              <h2 className="text-lg font-semibold text-gray-900 mb-1">Forgot password?</h2>
              <p className="text-sm text-gray-500 mb-5">Enter your email and we'll send a reset link.</p>
              {error && <p className="text-sm text-red-600 bg-red-50 rounded-xl px-4 py-3 mb-4">{error}</p>}
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <Input
                  label="Email"
                  type="email"
                  placeholder="you@example.com"
                  error={errors.email?.message}
                  {...register('email', { required: 'Email is required' })}
                />
                <Button type="submit" className="w-full" loading={isSubmitting}>Send Reset Link</Button>
              </form>
            </>
          )}
        </Card>

        <Link to="/login" className="flex items-center justify-center gap-2 text-sm text-indigo-600 mt-5 hover:underline">
          <ArrowLeft className="w-4 h-4" /> Back to login
        </Link>
      </div>
    </div>
  )
}
