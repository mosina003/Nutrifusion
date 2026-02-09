'use client'

import { useState } from 'react'
import { StatsOverview } from '@/components/practitioner/stats-overview'
import { PatientList } from '@/components/practitioner/patient-list'
import { PatientDetailTabs } from '@/components/practitioner/patient-detail-tabs'
import { AIReviewPanel } from '@/components/practitioner/ai-review-panel'
import { AlertsPanel } from '@/components/practitioner/alerts-panel'
import { AnalyticsSection } from '@/components/practitioner/analytics-section'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

interface SelectedPatient {
  id: string
  name: string
  age: number
  dosha: string
  conditions: string[]
}

export default function PractitionerDashboard() {
  const [selectedPatient, setSelectedPatient] = useState<SelectedPatient | null>(null)

  return (
    <main className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <h1 className="text-3xl font-bold text-slate-900">
            Practitioner Dashboard
          </h1>
          <p className="text-slate-600 mt-2">
            Monitor patients, review AI recommendations, and manage interventions
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
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
      </div>
    </main>
  )
}
