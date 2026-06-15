import { useForm } from 'react-hook-form'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { Button, Input, Card } from '../../components/ui'
import { Plane } from 'lucide-react'
import { useState } from 'react'

export default function LoginPage() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const [error, setError] = useState('')
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm()

  const onSubmit = async (data) => {
    try {
      setError('')
      await login(data)
      navigate('/')
    } catch (e) {
      setError(e.response?.data?.message || 'Invalid credentials')
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-blue-50 flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="flex flex-col items-center mb-8">
          <div className="w-14 h-14 bg-indigo-600 rounded-2xl flex items-center justify-center mb-3 shadow-lg shadow-indigo-200">
            <Plane className="w-7 h-7 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900">TripWise</h1>
          <p className="text-sm text-gray-500 mt-1">Smart Travel Finance</p>
        </div>

        <Card className="p-6 shadow-xl shadow-gray-100">
          <h2 className="text-lg font-semibold text-gray-900 mb-5">Welcome back</h2>
          {error && <p className="text-sm text-red-600 bg-red-50 rounded-xl px-4 py-3 mb-4">{error}</p>}
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <Input
              label="Email"
              type="email"
              placeholder="you@example.com"
              error={errors.email?.message}
              {...register('email', { required: 'Email is required' })}
            />
            <Input
              label="Password"
              type="password"
              placeholder="••••••••"
              error={errors.password?.message}
              {...register('password', { required: 'Password is required' })}
            />
            <div className="flex justify-end">
              <Link to="/forgot-password" className="text-xs text-indigo-600 hover:underline">Forgot password?</Link>
            </div>
            <Button type="submit" className="w-full" loading={isSubmitting}>Sign In</Button>
          </form>
        </Card>

        <p className="text-center text-sm text-gray-500 mt-5">
          Don't have an account?{' '}
          <Link to="/register" className="text-indigo-600 font-medium hover:underline">Create one</Link>
        </p>
      </div>
    </div>
  )
}
