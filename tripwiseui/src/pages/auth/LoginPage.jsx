import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { Button, Input, Card } from '../../components/ui'
import { Plane, Mail, Hash } from 'lucide-react'

export default function LoginPage() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const [step, setStep] = useState('email') // 'email' | 'otp'
  const [email, setEmail] = useState('')
  const [otp, setOtp] = useState('')
  const [error, setError] = useState('')
  const [sending, setSending] = useState(false)
  const [verifying, setVerifying] = useState(false)

  const handleSendOtp = async (e) => {
    e.preventDefault()
    if (!email.trim()) { setError('Please enter your email'); return }
    setSending(true)
    setError('')
    try {
      await login({ step: 'send', email })
      setStep('otp')
    } catch (err) {
      setError(err.message || 'Failed to send OTP')
    } finally {
      setSending(false)
    }
  }

  const handleVerifyOtp = async (e) => {
    e.preventDefault()
    if (!otp.trim()) { setError('Please enter the OTP'); return }
    setVerifying(true)
    setError('')
    try {
      await login({ step: 'verify', email, otp })
      navigate('/')
    } catch (err) {
      setError(err.message || 'Invalid OTP')
    } finally {
      setVerifying(false)
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
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Smart Travel Finance</p>
        </div>

        <Card className="p-6 shadow-xl shadow-gray-100">
          {step === 'email' ? (
            <>
              <div className="flex items-center gap-2 mb-1">
                <Mail className="w-4 h-4 text-indigo-600" />
                <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Sign in</h2>
              </div>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-5">We'll send a one-time code to your email.</p>
              {error && <p className="text-sm text-red-600 bg-red-50 rounded-xl px-4 py-3 mb-4">{error}</p>}
              <form onSubmit={handleSendOtp} className="space-y-4">
                <Input
                  label="Email address"
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  autoFocus
                />
                <Button type="submit" className="w-full" loading={sending}>
                  Send OTP
                </Button>
              </form>
            </>
          ) : (
            <>
              <div className="flex items-center gap-2 mb-1">
                <Hash className="w-4 h-4 text-indigo-600" />
                <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Enter OTP</h2>
              </div>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-5">
                Code sent to <span className="font-medium text-gray-700 dark:text-gray-300">{email}</span>
              </p>
              {error && <p className="text-sm text-red-600 bg-red-50 rounded-xl px-4 py-3 mb-4">{error}</p>}
              <form onSubmit={handleVerifyOtp} className="space-y-4">
                <Input
                  label="One-time password"
                  type="text"
                  inputMode="numeric"
                  placeholder="123456"
                  maxLength={6}
                  value={otp}
                  onChange={e => setOtp(e.target.value.replace(/\D/g, ''))}
                  autoFocus
                />
                <Button type="submit" className="w-full" loading={verifying}>
                  Verify & Sign In
                </Button>
                <button
                  type="button"
                  onClick={() => { setStep('email'); setOtp(''); setError('') }}
                  className="w-full text-sm text-indigo-600 hover:underline text-center"
                >
                  ← Change email
                </button>
              </form>
            </>
          )}
        </Card>
      </div>
    </div>
  )
}
