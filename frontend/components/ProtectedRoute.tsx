'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/context/AuthContext'

interface ProtectedRouteProps {
  children: React.ReactNode
  requiredRole?: 'user' | 'practitioner'
}

export function ProtectedRoute({ children, requiredRole }: ProtectedRouteProps) {
  const { user, loading, isAuthenticated } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!loading) {
      // If not authenticated, redirect to login
      if (!isAuthenticated) {
        router.push('/login')
        return
      }

      // If a specific role is required and user doesn't have it, redirect
      if (requiredRole && user?.role !== requiredRole) {
        // Redirect to appropriate dashboard based on user's role
        if (user?.role === 'practitioner') {
          router.push('/practitioner')
        } else {
          router.push('/dashboard')
        }
      }
    }
  }, [loading, isAuthenticated, user, requiredRole, router])

  // Show loading spinner while checking auth
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#0A0F1E] via-[#1a1f35] to-[#0A0F1E]">
        <div className="flex flex-col items-center gap-4">
          <svg
            className="animate-spin h-12 w-12 text-[#FFB800]"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
          <p className="text-gray-400 text-sm">Loading...</p>
        </div>
      </div>
    )
  }

  // If not authenticated or wrong role, don't render children (redirect happens in useEffect)
  if (!isAuthenticated || (requiredRole && user?.role !== requiredRole)) {
    return null
  }

  // User is authenticated and has correct role, render protected content
  return <>{children}</>
}
