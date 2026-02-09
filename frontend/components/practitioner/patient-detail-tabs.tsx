'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'

interface PatientDetailTabsProps {
  patient?: {
    id: string
    name: string
    age: number
    dosha: string
    conditions: string[]
  }
}

export function PatientDetailTabs({ patient }: PatientDetailTabsProps) {
  const [activeTab, setActiveTab] = useState<string>('profile')

  if (!patient) {
    return (
      <div className="bg-white rounded-lg border border-slate-200 p-8 text-center">
        <p className="text-slate-500">Select a patient to view details</p>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-lg border border-slate-200">
      {/* Tabs Header */}
      <div className="border-b border-slate-200 flex overflow-x-auto">
        {[
          { id: 'profile', label: 'Profile' },
          { id: 'history', label: 'Health History' },
          { id: 'plans', label: 'Diet Plans' },
          { id: 'recommendations', label: 'Recommendations' },
          { id: 'progress', label: 'Progress' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
              activeTab === tab.id
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="p-6">
        {/* Profile Tab */}
        {activeTab === 'profile' && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs font-medium text-slate-600 mb-1">
                  Name
                </p>
                <p className="text-lg font-semibold text-slate-900">
                  {patient.name}
                </p>
              </div>
              <div>
                <p className="text-xs font-medium text-slate-600 mb-1">
                  Age
                </p>
                <p className="text-lg font-semibold text-slate-900">
                  {patient.age} years
                </p>
              </div>
              <div>
                <p className="text-xs font-medium text-slate-600 mb-1">
                  Dominant Dosha
                </p>
                <p className="text-lg font-semibold text-slate-900">
                  {patient.dosha}
                </p>
              </div>
              <div>
                <p className="text-xs font-medium text-slate-600 mb-1">
                  Conditions
                </p>
                <div className="flex gap-2 flex-wrap">
                  {patient.conditions.map((cond, idx) => (
                    <span
                      key={idx}
                      className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded"
                    >
                      {cond}
                    </span>
                  ))}
                </div>
              </div>
            </div>
            <div className="pt-4 border-t border-slate-200">
              <p className="text-xs font-medium text-slate-600 mb-3">
                Practitioner Notes
              </p>
              <textarea
                placeholder="Add notes about this patient..."
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                rows={3}
              />
              <Button className="mt-3 bg-blue-600 hover:bg-blue-700">
                Save Notes
              </Button>
            </div>
          </div>
        )}

        {/* Health History Tab */}
        {activeTab === 'history' && (
          <div className="space-y-4">
            <div className="space-y-3">
              {[
                {
                  title: 'Initial Assessment',
                  date: '2024-01-15',
                  notes: 'High Vata imbalance detected. Recommend stabilizing diet.',
                },
                {
                  title: 'Follow-up Consultation',
                  date: '2024-02-01',
                  notes: 'Weight stable. Digestion improved. Continue current plan.',
                },
                {
                  title: 'Review Session',
                  date: '2024-02-20',
                  notes: 'Excellent compliance. Ready for phase 2 recommendations.',
                },
              ].map((entry, idx) => (
                <div
                  key={idx}
                  className="border border-slate-200 rounded-lg p-4"
                >
                  <div className="flex justify-between items-start mb-2">
                    <h4 className="font-medium text-slate-900">
                      {entry.title}
                    </h4>
                    <span className="text-xs text-slate-500">{entry.date}</span>
                  </div>
                  <p className="text-sm text-slate-600">{entry.notes}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Diet Plans Tab */}
        {activeTab === 'plans' && (
          <div className="space-y-4">
            {[
              {
                name: 'Phase 1: Stabilization',
                status: 'Active',
                startDate: '2024-01-15',
                duration: '30 days',
              },
              {
                name: 'Phase 2: Balancing',
                status: 'Upcoming',
                startDate: '2024-02-15',
                duration: '30 days',
              },
            ].map((plan, idx) => (
              <div
                key={idx}
                className="border border-slate-200 rounded-lg p-4 flex items-center justify-between"
              >
                <div>
                  <h4 className="font-medium text-slate-900">{plan.name}</h4>
                  <p className="text-sm text-slate-500 mt-1">
                    {plan.startDate} • {plan.duration}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-medium ${
                      plan.status === 'Active'
                        ? 'bg-emerald-100 text-emerald-700'
                        : 'bg-slate-100 text-slate-700'
                    }`}
                  >
                    {plan.status}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-xs bg-transparent"
                  >
                    View Details
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Recommendations Tab */}
        {activeTab === 'recommendations' && (
          <div className="space-y-4">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
              <p className="text-sm text-blue-900 font-medium">
                AI Generated Recommendations
              </p>
              <p className="text-xs text-blue-700 mt-1">
                Based on latest health data and dosha analysis
              </p>
            </div>
            {[
              {
                food: 'Ghee',
                reason: 'Balances Vata. Improves nutrient absorption.',
              },
              {
                food: 'Warm milk with turmeric',
                reason: 'Anti-inflammatory. Supports sleep.',
              },
              {
                food: 'Basmati rice',
                reason: 'Easily digestible. Grounding for Vata.',
              },
            ].map((item, idx) => (
              <div key={idx} className="border border-slate-200 rounded-lg p-3">
                <p className="font-medium text-slate-900">{item.food}</p>
                <p className="text-xs text-slate-600 mt-1">{item.reason}</p>
              </div>
            ))}
          </div>
        )}

        {/* Progress Tab */}
        {activeTab === 'progress' && (
          <div className="space-y-4">
            {[
              { metric: 'Weight', value: '75kg', trend: 'down' },
              {
                metric: 'Compliance Rate',
                value: '92%',
                trend: 'up',
              },
              { metric: 'Digestion', value: 'Improved', trend: 'up' },
              { metric: 'Energy Level', value: 'Good', trend: 'up' },
            ].map((item, idx) => (
              <div
                key={idx}
                className="flex items-center justify-between border border-slate-200 rounded-lg p-4"
              >
                <div>
                  <p className="font-medium text-slate-900">{item.metric}</p>
                  <p className="text-sm text-slate-500 mt-1">{item.value}</p>
                </div>
                <div
                  className={`text-sm font-semibold ${
                    item.trend === 'up'
                      ? 'text-emerald-600'
                      : 'text-amber-600'
                  }`}
                >
                  {item.trend === 'up' ? '↑' : '↓'}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Action Buttons */}
        {activeTab === 'profile' && (
          <div className="flex gap-3 mt-6 pt-4 border-t border-slate-200">
            <Button className="bg-blue-600 hover:bg-blue-700">
              Approve Diet Plan
            </Button>
            <Button variant="outline">Modify AI Plan</Button>
            <Button variant="outline" className="text-red-600 bg-transparent">
              Reject Recommendation
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}
