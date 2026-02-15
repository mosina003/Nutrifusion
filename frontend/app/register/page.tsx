'use client'

import React from "react"
import Link from 'next/link'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { register } from '@/lib/api'
import { useAuth } from '@/context/AuthContext'

export default function RegisterPage() {
  const router = useRouter()
  const { setAuthUser } = useAuth()
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [role, setRole] = useState<'user' | 'practitioner'>('user')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    // Client-side validation
    if (password !== confirmPassword) {
      setError('Passwords do not match!')
      return
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters long')
      return
    }

    setLoading(true)

    try {
      const response = await register({
        name: fullName,
        email,
        password,
        role,
      })

      if (response.success && response.data) {
        // Update auth context with user data
        const userData = response.data.data
        if (userData) {
          setAuthUser(userData)
        }
        
        // Redirect based on user role
        const userRole = userData?.role || role
        
        if (userRole === 'practitioner') {
          router.push('/practitioner')
        } else {
          router.push('/dashboard')
        }
      } else {
        setError(response.error || 'Registration failed. Please try again.')
      }
    } catch (err) {
      setError('An unexpected error occurred. Please try again.')
      console.error('Registration error:', err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-teal-50 flex items-center justify-center p-4 py-12">
      {/* Background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-blue-100/20 to-teal-100/20 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-gradient-to-tr from-blue-100/20 to-emerald-100/20 rounded-full blur-3xl" />
      </div>

      {/* Register Card */}
      <div className="relative w-full max-w-md animate-in fade-in slide-in-from-bottom-4 duration-500">
        <div className="bg-white rounded-2xl shadow-lg border border-slate-200/50 overflow-hidden">
          {/* Header section with subtle gradient */}
          <div className="bg-gradient-to-r from-blue-50 to-teal-50 px-8 py-8 border-b border-slate-200/50">
            <h1 className="text-3xl font-bold text-slate-900 mb-2 text-center">NutriFusion</h1>
            <h2 className="text-xl font-semibold text-slate-700 mb-1 text-center">Create an account</h2>
            <p className="text-sm text-slate-600 text-center">
              Start your personalized nutrition journey
            </p>
          </div>

          {/* Form section */}
          <form onSubmit={handleSubmit} className="px-8 py-8 space-y-5">
            {/* Error Message */}
            {error && (
              <div className="p-4 rounded-lg bg-red-50 border border-red-200">
                <p className="text-sm text-red-600 font-medium">{error}</p>
              </div>
            )}

            {/* Full Name Field */}
            <div className="space-y-2">
              <Label htmlFor="fullName" className="text-slate-700 font-medium">
                Full Name
              </Label>
              <Input
                id="fullName"
                type="text"
                placeholder="John Doe"
                value={fullName}
                onChange={(e) => {
                  setFullName(e.target.value)
                  setError('')
                }}
                className="h-11 rounded-lg border-slate-200 focus:border-blue-400 focus:ring-blue-400/20 transition-all"
                disabled={loading}
                autoComplete="name"
                required
              />
            </div>

            {/* Email Field */}
            <div className="space-y-2">
              <Label htmlFor="email" className="text-slate-700 font-medium">
                Email address
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value)
                  setError('')
                }}
                className="h-11 rounded-lg border-slate-200 focus:border-blue-400 focus:ring-blue-400/20 transition-all"
                disabled={loading}
                autoComplete="email"
                required
              />
            </div>

            {/* Password Field */}
            <div className="space-y-2">
              <Label htmlFor="password" className="text-slate-700 font-medium">
                Password
              </Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value)
                  setError('')
                }}
                className="h-11 rounded-lg border-slate-200 focus:border-blue-400 focus:ring-blue-400/20 transition-all"
                disabled={loading}
                autoComplete="new-password"
                required
                minLength={6}
              />
              <p className="text-xs text-slate-500">Must be at least 6 characters</p>
            </div>

            {/* Confirm Password Field */}
            <div className="space-y-2">
              <Label htmlFor="confirmPassword" className="text-slate-700 font-medium">
                Confirm Password
              </Label>
              <Input
                id="confirmPassword"
                type="password"
                placeholder="••••••••"
                value={confirmPassword}
                onChange={(e) => {
                  setConfirmPassword(e.target.value)
                  setError('')
                }}
                className="h-11 rounded-lg border-slate-200 focus:border-blue-400 focus:ring-blue-400/20 transition-all"
                disabled={loading}
                autoComplete="new-password"
                required
              />
            </div>

            {/* Role Selection */}
            <div className="space-y-3 pt-2">
              <Label className="text-slate-700 font-medium">I am a:</Label>
              <RadioGroup 
                value={role} 
                onValueChange={(value: string) => setRole(value as 'user' | 'practitioner')}
              >
                <div className="flex items-center space-x-3 p-3 rounded-lg border border-slate-200 cursor-pointer hover:border-blue-300 hover:bg-blue-50/30 transition-all">
                  <RadioGroupItem value="user" id="user" className="text-blue-500" />
                  <Label
                    htmlFor="user"
                    className="flex-1 text-slate-700 font-medium cursor-pointer"
                  >
                    Individual User
                  </Label>
                </div>
                <div className="flex items-center space-x-3 p-3 rounded-lg border border-slate-200 cursor-pointer hover:border-blue-300 hover:bg-blue-50/30 transition-all">
                  <RadioGroupItem value="practitioner" id="practitioner" className="text-blue-500" />
                  <Label
                    htmlFor="practitioner"
                    className="flex-1 text-slate-700 font-medium cursor-pointer"
                  >
                    Healthcare Practitioner
                  </Label>
                </div>
              </RadioGroup>
            </div>

            {/* Register Button */}
            <Button
              type="submit"
              disabled={loading}
              className="w-full h-11 bg-gradient-to-r from-blue-500 to-teal-500 hover:from-blue-600 hover:to-teal-600 text-white font-semibold rounded-lg transition-all duration-200 transform hover:scale-105 mt-6 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Creating account...
                </span>
              ) : (
                'Register'
              )}
            </Button>
          </form>

          {/* Footer with Login link */}
          <div className="px-8 py-6 bg-slate-50 border-t border-slate-200/50 text-center">
            <p className="text-sm text-slate-600">
              Already have an account?{' '}
              <Link
                href="/login"
                className="font-semibold text-blue-600 hover:text-blue-700 transition-colors"
              >
                Login
              </Link>
            </p>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes fade-in {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }

        @keyframes slide-in-from-bottom {
          from {
            transform: translateY(16px);
            opacity: 0;
          }
          to {
            transform: translateY(0);
            opacity: 1;
          }
        }

        .animate-in.fade-in.slide-in-from-bottom-4 {
          animation: fade-in 0.5s ease-out, slide-in-from-bottom 0.5s ease-out;
        }
      `}</style>
    </div>
  )
}
