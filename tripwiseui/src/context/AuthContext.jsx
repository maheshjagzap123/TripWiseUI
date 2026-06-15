import { createContext, useContext, useState } from 'react'
import { authApi } from '../api'

const AuthContext = createContext(null)

// Seed mock auth — simulate a freshly logged-in user with NO name yet
// (remove this block entirely when real backend is wired up)
const MOCK_USER  = { userId: 'user-1', fullName: '', email: 'aditya@example.com', phoneNumber: '' }
const MOCK_TOKEN = 'mock-token'
if (!localStorage.getItem('token')) {
  localStorage.setItem('token', MOCK_TOKEN)
  localStorage.setItem('user', JSON.stringify(MOCK_USER))
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const u = localStorage.getItem('user')
    return u ? JSON.parse(u) : null
  })
  const [token, setToken] = useState(() => localStorage.getItem('token') || null)

  // login({ step: 'send', email }) → sends OTP (mock: always succeeds)
  // login({ step: 'verify', email, otp }) → verifies and logs in
  const login = async (payload) => {
    const res = await authApi.login(payload)
    if (payload.step === 'verify') {
      const { token, userId, fullName, email, phoneNumber } = res.data.data
      const userData = { userId, fullName, email, phoneNumber }
      localStorage.setItem('token', token)
      localStorage.setItem('user', JSON.stringify(userData))
      setToken(token)
      setUser(userData)
    }
    return res.data
  }

  const updateUser = (updates) => {
    const updated = { ...user, ...updates }
    localStorage.setItem('user', JSON.stringify(updated))
    setUser(updated)
  }

  const logout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    setToken(null)
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ user, token, login, logout, updateUser, isAuthenticated: !!token }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
