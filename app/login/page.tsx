'use client'

import React from "react"

import Link from 'next/link'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [rememberMe, setRememberMe] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    console.log('Login attempt:', { email, password, rememberMe })
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-teal-50 flex items-center justify-center p-4">
      {/* Background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-blue-100/20 to-teal-100/20 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-gradient-to-tr from-blue-100/20 to-emerald-100/20 rounded-full blur-3xl" />
      </div>

      {/* Login Card */}
      <div className="relative w-full max-w-md animate-in fade-in slide-in-from-bottom-4 duration-500">
        <div className="bg-white rounded-2xl shadow-lg border border-slate-200/50 overflow-hidden">
          {/* Header section with subtle gradient */}
          <div className="bg-gradient-to-r from-blue-50 to-teal-50 px-8 py-8 border-b border-slate-200/50">
            <h1 className="text-3xl font-bold text-slate-900 mb-2 text-center">NutriFusion</h1>
            <h2 className="text-xl font-semibold text-slate-700 mb-1 text-center">Login to your account</h2>
            <p className="text-sm text-slate-600 text-center">
              Access your personalized nutrition dashboard
            </p>
          </div>

          {/* Form section */}
          <form onSubmit={handleSubmit} className="px-8 py-8 space-y-5">
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
                onChange={(e) => setEmail(e.target.value)}
                className="h-11 rounded-lg border-slate-200 focus:border-blue-400 focus:ring-blue-400/20 transition-all"
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
                onChange={(e) => setPassword(e.target.value)}
                className="h-11 rounded-lg border-slate-200 focus:border-blue-400 focus:ring-blue-400/20 transition-all"
                required
              />
            </div>

            {/* Remember me and Forgot password */}
            <div className="flex items-center justify-between pt-2">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="remember"
                  checked={rememberMe}
                  onCheckedChange={(checked) => setRememberMe(checked as boolean)}
                  className="rounded-md border-slate-300"
                />
                <Label
                  htmlFor="remember"
                  className="text-sm text-slate-600 font-normal cursor-pointer"
                >
                  Remember me
                </Label>
              </div>
              <Link
                href="#"
                className="text-sm text-blue-600 hover:text-blue-700 font-medium transition-colors"
              >
                Forgot password?
              </Link>
            </div>

            {/* Login Button */}
            <Button
              type="submit"
              className="w-full h-11 bg-gradient-to-r from-blue-500 to-teal-500 hover:from-blue-600 hover:to-teal-600 text-white font-semibold rounded-lg transition-all duration-200 transform hover:scale-105 mt-6"
            >
              Login
            </Button>
          </form>

          {/* Footer with Register link */}
          <div className="px-8 py-6 bg-slate-50 border-t border-slate-200/50 text-center">
            <p className="text-sm text-slate-600">
              Don't have an account?{' '}
              <Link
                href="/register"
                className="font-semibold text-blue-600 hover:text-blue-700 transition-colors"
              >
                Register
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
