'use client'

import { User, LogOut, Settings, Bell } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { SummaryCards } from '@/components/dashboard/summary-cards'
import { Recommendations } from '@/components/dashboard/recommendations'
import { DietPlanTimeline } from '@/components/dashboard/diet-plan-timeline'
import { HealthInsights } from '@/components/dashboard/health-insights'
import { YogaLifestyle } from '@/components/dashboard/yoga-lifestyle'
import { ProgressCharts } from '@/components/dashboard/progress-charts'

export default function DashboardPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      {/* Top Navigation Bar */}
      <nav className="sticky top-0 z-50 bg-white border-b border-slate-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-teal-600 rounded-full flex items-center justify-center text-white font-bold">
                NF
              </div>
              <div>
                <h1 className="text-xl font-bold text-slate-900">NutriFusion</h1>
                <p className="text-xs text-slate-500">Personal Dashboard</p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <Button variant="ghost" size="icon" className="text-slate-600 hover:text-slate-900">
                <Bell className="w-5 h-5" />
              </Button>
              <Button variant="ghost" size="icon" className="text-slate-600 hover:text-slate-900">
                <Settings className="w-5 h-5" />
              </Button>
              <div className="h-8 w-8 bg-gradient-to-br from-orange-400 to-pink-400 rounded-full flex items-center justify-center text-white font-bold text-sm cursor-pointer hover:opacity-80 transition-opacity">
                U
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="mb-8 animate-fade-in">
          <h2 className="text-3xl font-bold text-slate-900 mb-2">Welcome back, Sarah!</h2>
          <p className="text-lg text-slate-600">Today is Wednesday, February 5th. Let's continue your wellness journey.</p>
        </div>

        {/* Dashboard Sections */}
        <div className="space-y-8">
          <SummaryCards />
          <Recommendations />
          <DietPlanTimeline />
          <HealthInsights />
          <YogaLifestyle />
          <ProgressCharts />
        </div>

        {/* Footer CTA */}
        <div className="mt-12 text-center">
          <p className="text-slate-600 mb-4">Need personalized guidance?</p>
          <Button className="bg-gradient-to-r from-blue-600 to-teal-600 hover:from-blue-700 hover:to-teal-700 text-white rounded-full px-8">
            Consult with Practitioner
          </Button>
        </div>
      </main>

      {/* Animations */}
      <style jsx>{`
        @keyframes fade-in {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .animate-fade-in {
          animation: fade-in 0.6s ease-out;
        }
      `}</style>
    </div>
  )
}
