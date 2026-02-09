'use client'

import React from "react"

import { Users, Activity, AlertCircle, TrendingUp } from 'lucide-react'

interface StatCard {
  icon: React.ReactNode
  label: string
  value: string | number
  subtext?: string
}

export function StatsOverview() {
  const stats: StatCard[] = [
    {
      icon: <Users className="w-6 h-6 text-blue-600" />,
      label: 'Total Assigned Users',
      value: '48',
      subtext: '12 active this week',
    },
    {
      icon: <Activity className="w-6 h-6 text-teal-600" />,
      label: 'Active Diet Plans',
      value: '36',
      subtext: '75% compliance average',
    },
    {
      icon: <AlertCircle className="w-6 h-6 text-amber-600" />,
      label: 'Users Needing Attention',
      value: '8',
      subtext: 'Low compliance or alerts',
    },
    {
      icon: <TrendingUp className="w-6 h-6 text-emerald-600" />,
      label: 'Avg. Compliance Rate',
      value: '78%',
      subtext: '+5% from last month',
    },
  ]

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map((stat, idx) => (
        <div
          key={idx}
          className="bg-white rounded-lg border border-slate-200 p-6 hover:shadow-md transition-shadow"
        >
          <div className="flex items-start justify-between mb-3">
            <div className="p-2 bg-slate-50 rounded-lg">{stat.icon}</div>
          </div>
          <p className="text-sm font-medium text-slate-600 mb-1">{stat.label}</p>
          <p className="text-3xl font-bold text-slate-900 mb-2">{stat.value}</p>
          {stat.subtext && (
            <p className="text-xs text-slate-500">{stat.subtext}</p>
          )}
        </div>
      ))}
    </div>
  )
}
