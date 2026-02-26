'use client'

import { useEffect, useState } from 'react'
import { Lightbulb, AlertCircle, CheckCircle, Droplets, Sun, Flame } from 'lucide-react'
import { getToken } from '@/lib/api'

export function HealthInsights() {
  const [insights, setInsights] = useState<any[]>([])
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
        if (data.success) {
          setInsights(data.data.healthInsights)
        }
      } catch (error) {
        console.error('Error fetching health insights:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchDashboardData()
  }, [])

  const getIcon = (iconName: string) => {
    switch (iconName) {
      case 'AlertCircle':
        return AlertCircle
      case 'CheckCircle':
        return CheckCircle
      case 'Droplets':
        return Droplets
      case 'Sun':
        return Sun
      case 'Flame':
        return Flame
      default:
        return Lightbulb
    }
  }

  if (loading) {
    return (
      <section className="mb-8">
        <h2 className="text-2xl font-bold text-slate-800 mb-6 flex items-center gap-2">
          <Lightbulb className="w-6 h-6 text-amber-500" />
          Health Insights
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="bg-gray-200 rounded-2xl p-5 h-24 animate-pulse" />
          ))}
        </div>
      </section>
    )
  }

  return (
    <section className="mb-8">
      <h2 className="text-2xl font-bold text-slate-800 mb-6 flex items-center gap-2">
        <Lightbulb className="w-6 h-6 text-amber-500" />
        Health Insights
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {insights.map((insight, idx) => {
          const Icon = getIcon(insight.icon)
          return (
            <div key={idx} className={`${insight.bgColor} border ${insight.borderColor} rounded-2xl p-5 hover:shadow-md transition-shadow`}>
              <div className="flex items-start gap-3">
                <Icon className={`w-5 h-5 ${insight.textColor} flex-shrink-0 mt-0.5`} />
                <div>
                  <h3 className={`font-semibold ${insight.textColor} mb-1`}>{insight.title}</h3>
                  <p className={`text-sm ${insight.textColor} opacity-90`}>{insight.description}</p>
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </section>
  )
}
