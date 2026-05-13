import React, { createContext, useContext, useState, useEffect } from 'react'
import type { User } from '../types'
import { authApi } from '../services/api'
import toast from 'react-hot-toast'

interface AuthContextType {
  user: User | null
  loading: boolean
  login: (email: string, password: string) => Promise<void>
  register: (name: string, email: string, password: string) => Promise<void>
  logout: () => void
  isAdmin: boolean
}

const AuthContext = createContext<AuthContextType | null>(null)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const stored = localStorage.getItem('user')
    const token = localStorage.getItem('token')
    if (stored && token) {
      setUser({ ...JSON.parse(stored), token })
    }
    setLoading(false)
  }, [])

  const login = async (email: string, password: string) => {
    const res = await authApi.login(email, password)
    const userData: User = res.data
    localStorage.setItem('token', userData.token)
    localStorage.setItem('user', JSON.stringify({ ...userData, token: undefined }))
    setUser(userData)
    toast.success(`Welcome back, ${userData.name}!`)
  }

  const register = async (name: string, email: string, password: string) => {
    const res = await authApi.register(name, email, password)
    const userData: User = res.data
    localStorage.setItem('token', userData.token)
    localStorage.setItem('user', JSON.stringify({ ...userData, token: undefined }))
    setUser(userData)
    toast.success(`Welcome, ${userData.name}!`)
  }

  const logout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    setUser(null)
    toast.success('Logged out successfully')
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, isAdmin: user?.role === 'ADMIN' }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
