import { createContext, useContext, useState, useEffect } from 'react'
import { authApi } from '../api'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const u = localStorage.getItem('user')
    return u ? JSON.parse(u) : null
  })
  const [token, setToken] = useState(() => localStorage.getItem('token') || null)

  const login = async (credentials) => {
    const res = await authApi.login(credentials)
    const { token, userId, role } = res.data.data
    localStorage.setItem('token', token)
    localStorage.setItem('user', JSON.stringify({ userId, role }))
    setToken(token)
    setUser({ userId, role })
    return res.data
  }

  const register = async (data) => {
    const res = await authApi.register(data)
    const { token, userId } = res.data.data
    localStorage.setItem('token', token)
    localStorage.setItem('user', JSON.stringify({ userId, role: 'User' }))
    setToken(token)
    setUser({ userId, role: 'User' })
    return res.data
  }

  const logout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    setToken(null)
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ user, token, login, register, logout, isAuthenticated: !!token }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
