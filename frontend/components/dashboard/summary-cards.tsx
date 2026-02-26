'use client'

import React, { useEffect, useState } from "react"
import { Heart, AlertCircle, Flame, TrendingUp } from 'lucide-react'
import { getToken } from '@/lib/api'

interface SummaryCardProps {
  icon: React.ReactNode
  value: string | number
  label: string
  trend?: string
  bgColor: string
}

function SummaryCard({ icon, value, label, trend, bgColor }: SummaryCardProps) {
  return (
    <div className={`${bgColor} rounded-3xl p-6 shadow-md hover:shadow-lg transition-shadow h-full`}>
      <div className="flex items-start justify-between mb-4">
        <div className="text-3xl text-white opacity-80">{icon}</div>
        {trend && <span className="text-sm font-semibold text-green-600 bg-green-100 px-3 py-1 rounded-full">{trend}</span>}
      </div>
      <div className="text-3xl font-bold text-white mb-2">{value}</div>
      <div className="text-sm text-white/80">{label}</div>
    </div>
  )
}

export function SummaryCards() {
  const [summaryData, setSummaryData] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchDashboardData = async () => {
      const token = getToken()
      if (!token) return
      
      try {
        const response = await fetch('http://localhost:5000/api/dashboard', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        })
        const data = await response.json()
        console.log('📊 Dashboard API response:', data)
        if (data.success) {
          console.log('📊 Summary Cards Data:', data.data.summaryCards)
          setSummaryData(data.data.summaryCards)
        }
      } catch (error) {
        console.error('Error fetching dashboard data:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchDashboardData()
  }, [])

  if (loading || !summaryData) {
    return (
      <section className="mb-8">
        <h2 className="text-2xl font-bold text-slate-800 mb-6">Today's Overview</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="bg-gray-200 rounded-3xl p-6 h-32 animate-pulse" />
          ))}
        </div>
      </section>
    )
  }

  // Defensive check: ensure all required data exists
  if (!summaryData.dosha || !summaryData.conditions || !summaryData.calories || !summaryData.status) {
    console.error('❌ Missing summary data:', {
      hasDosha: !!summaryData.dosha,
      hasConditions: !!summaryData.conditions,
      hasCalories: !!summaryData.calories,
      hasStatus: !!summaryData.status
    })
    return (
      <section className="mb-8">
        <h2 className="text-2xl font-bold text-slate-800 mb-6">Today's Overview</h2>
        <p className="text-red-500">Error loading dashboard cards. Please refresh the page.</p>
      </section>
    )
  }

  console.log('✅ Rendering cards with data:', summaryData)

  // Define static color schemes for each card to ensure Tailwind includes them
  const cardColors = {
    dosha: 'bg-gradient-to-br from-orange-400 to-orange-500',
    conditions: 'bg-gradient-to-br from-red-400 to-red-500',
    calories: 'bg-gradient-to-br from-blue-400 to-blue-500',
    status: 'bg-gradient-to-br from-green-400 to-green-500'
  }

  return (
    <section className="mb-8">
      <h2 className="text-2xl font-bold text-slate-800 mb-6">Today's Overview</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <SummaryCard
          icon={<Heart className="w-8 h-8" />}
          value={summaryData.dosha?.value || 'Unknown'}
          label={summaryData.dosha?.label || 'Dominant Dosha'}
          trend={summaryData.dosha?.trend}
          bgColor={cardColors.dosha}
        />
        <SummaryCard
          icon={<AlertCircle className="w-8 h-8" />}
          value={summaryData.conditions?.value ?? 0}
          label={summaryData.conditions?.label || 'Chronic Conditions'}
          bgColor={cardColors.conditions}
        />
        <SummaryCard
          icon={<Flame className="w-8 h-8" />}
          value={summaryData.calories?.value || '0 cal'}
          label={summaryData.calories?.label || 'Daily Calories'}
          bgColor={cardColors.calories}
        />
        <SummaryCard
          icon={<TrendingUp className="w-8 h-8" />}
          value={summaryData.status?.value || 'N/A'}
          label={summaryData.status?.label || 'Status'}
          trend={summaryData.status?.trend}
          bgColor={cardColors.status}
        />
      </div>
    </section>
  )
}
