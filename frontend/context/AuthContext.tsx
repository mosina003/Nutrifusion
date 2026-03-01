'use client'

import React, { createContext, useContext, useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { getToken, removeToken, getCurrentUser, logout as apiLogout, setUser as saveUser } from '@/lib/api'

interface User {
  _id: string
  name?: string
  email: string
  role: 'user' | 'practitioner'
  verified?: boolean
  authorityLevel?: string
  hasCompletedAssessment?: boolean
  preferredMedicalFramework?: string
}

interface AuthContextType {
  user: User | null
  loading: boolean
  isAuthenticated: boolean
  logout: () => void
  refreshUser: () => Promise<void>
  setAuthUser: (user: User) => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  // Check authentication status on mount
  useEffect(() => {
    const initAuth = async () => {
      const token = getToken()
      
      if (!token) {
        setLoading(false)
        return
      }

      // Always fetch fresh user data from API
      try {
        const response = await getCurrentUser()
        if (response.success && response.data) {
          const userData = response.data.data || response.data
          console.log('✅ AuthContext: Fetched user data from API:', userData)
          setUser(userData)
          // Update localStorage with fresh data
          saveUser(userData)
        } else {
          // Invalid token, clear it
          removeToken()
        }
      } catch (error) {
        console.error('Auth initialization error:', error)
        removeToken()
      } finally {
        setLoading(false)
      }
    }

    initAuth()
  }, [])

  const logout = () => {
    apiLogout()
    setUser(null)
    router.push('/login')
  }

  const refreshUser = async () => {
    try {
      const response = await getCurrentUser()
      if (response.success && response.data) {
        const userData = response.data.data || response.data
        setUser(userData)
        // Update localStorage as well
        saveUser(userData)
      }
    } catch (error) {
      console.error('Error refreshing user:', error)
    }
  }

  const setAuthUser = (user: User) => {
    setUser(user)
    // Also update localStorage
    saveUser(user)
  }

  const value = {
    user,
    loading,
    isAuthenticated: !!user,
    logout,
    refreshUser,
    setAuthUser,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
