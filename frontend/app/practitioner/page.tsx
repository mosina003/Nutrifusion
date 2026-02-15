'use client'

import { useState } from 'react'
import { StatsOverview } from '@/components/practitioner/stats-overview'
import { PatientList } from '@/components/practitioner/patient-list'
import { PatientDetailTabs } from '@/components/practitioner/patient-detail-tabs'
import { AIReviewPanel } from '@/components/practitioner/ai-review-panel'
import { AlertsPanel } from '@/components/practitioner/alerts-panel'
import { AnalyticsSection } from '@/components/practitioner/analytics-section'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Bell, Settings, UserCircle, Users, Activity, LogOut } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { ProtectedRoute } from '@/components/ProtectedRoute'
import { useAuth } from '@/context/AuthContext'

interface SelectedPatient {
  id: string
  name: string
  age: number
  dosha: string
  conditions: string[]
}

export default function PractitionerDashboard() {
  const [selectedPatient, setSelectedPatient] = useState<SelectedPatient | null>(null)
  const { user, logout } = useAuth()

  return (
    <ProtectedRoute requiredRole="practitioner">
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      {/* Top Navigation Bar */}
      <nav className="sticky top-0 z-50 bg-white border-b border-slate-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-emerald-600 to-teal-600 rounded-full flex items-center justify-center text-white font-bold">
                NF
              </div>
              <div>
                <h1 className="text-xl font-bold text-slate-900">NutriFusion</h1>
                <p className="text-xs text-slate-500">Practitioner Portal</p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <Button variant="ghost" size="icon" className="text-slate-600 hover:text-slate-900">
                <Bell className="w-5 h-5" />
              </Button>
              <Button variant="ghost" size="icon" className="text-slate-600 hover:text-slate-900">
                <Settings className="w-5 h-5" />
              </Button>
              <Button 
                variant="ghost" 
                size="icon" 
                className="text-slate-600 hover:text-slate-900"
                onClick={logout}
                title="Logout"
              >
                <LogOut className="w-5 h-5" />
              </Button>
              <div className="h-8 w-8 bg-gradient-to-br from-emerald-400 to-teal-400 rounded-full flex items-center justify-center text-white font-bold text-sm cursor-pointer hover:opacity-80 transition-opacity">
                {(user?.name || user?.email)?.charAt(0).toUpperCase()}
              </div>
            </div>
          </div>
        </div>
      </nav>


      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="mb-8 animate-fade-in">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-full flex items-center justify-center">
              <Users className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-3xl font-bold text-slate-900">Welcome back, {user?.name || 'Practitioner'}!</h2>
              <p className="text-lg text-slate-600">Monitor patients and review AI recommendations</p>
            </div>
          </div>
          <div className="flex items-center gap-2 text-sm text-slate-500">
            <Activity className="w-4 h-4" />
            <span>Today is {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
          </div>
        </div>

        {/* Stats Overview */}
        <section className="mb-8">
          <StatsOverview />
        </section>

        {/* Main Dashboard Tabs */}
        <Tabs defaultValue="patients" className="w-full">
          <TabsList className="grid w-full grid-cols-4 mb-6">
            <TabsTrigger value="patients">Patients</TabsTrigger>
            <TabsTrigger value="ai-review">AI Review</TabsTrigger>
            <TabsTrigger value="alerts">Alerts</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
          </TabsList>

          {/* Patients Tab */}
          <TabsContent value="patients" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Patient List */}
              <div className="lg:col-span-1">
                <PatientList onSelectPatient={setSelectedPatient} />
              </div>

              {/* Patient Details */}
              <div className="lg:col-span-2">
                <PatientDetailTabs patient={selectedPatient || undefined} />
              </div>
            </div>
          </TabsContent>

          {/* AI Review Tab */}
          <TabsContent value="ai-review">
            <AIReviewPanel />
          </TabsContent>

          {/* Alerts Tab */}
          <TabsContent value="alerts">
            <AlertsPanel />
          </TabsContent>

          {/* Analytics Tab */}
          <TabsContent value="analytics">
            <AnalyticsSection />
          </TabsContent>
        </Tabs>
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
    </ProtectedRoute>
  )
}
