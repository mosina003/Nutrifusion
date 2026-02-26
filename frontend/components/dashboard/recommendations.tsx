'use client'

import { useEffect, useState } from 'react'
import { Star, AlertTriangle } from 'lucide-react'
import { getToken } from '@/lib/api'

export function Recommendations() {
  const [recommendedFoods, setRecommendedFoods] = useState<any[]>([])
  const [foodsToAvoid, setFoodsToAvoid] = useState<string[]>([])
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
          setRecommendedFoods(data.data.recommendations.foods)
          setFoodsToAvoid(data.data.recommendations.avoid)
        }
      } catch (error) {
        console.error('Error fetching recommendations:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchDashboardData()
  }, [])

  if (loading) {
    return (
      <section className="mb-8">
        <h2 className="text-2xl font-bold text-slate-800 mb-6">Today's Personalized Recommendations</h2>
        <div className="bg-gray-200 rounded-3xl p-6 h-64 animate-pulse" />
      </section>
    )
  }

  return (
    <section className="mb-8">
      <h2 className="text-2xl font-bold text-slate-800 mb-6">Today's Personalized Recommendations</h2>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recommended Foods */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-3xl p-6 shadow-md">
            <h3 className="text-lg font-semibold text-slate-800 mb-4 flex items-center gap-2">
              <Star className="w-5 h-5 text-amber-500" />
              Recommended Foods Today
            </h3>
            <div className="space-y-3">
              {recommendedFoods.map((food, idx) => (
                <div key={idx} className="p-4 bg-gradient-to-r from-emerald-50 to-teal-50 rounded-2xl hover:shadow-md transition-shadow">
                  <div className="flex items-start justify-between mb-2">
                    <h4 className="font-semibold text-slate-800">{food.name}</h4>
                    <span className="bg-emerald-500 text-white text-xs font-bold px-3 py-1 rounded-full">{food.score}%</span>
                  </div>
                  <div className="flex gap-2">
                    {food.tags.map((tag: string, i: number) => (
                      <span key={i} className="text-xs bg-emerald-100 text-emerald-700 px-2 py-1 rounded-full">
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Foods to Avoid */}
        <div>
          <div className="bg-white rounded-3xl p-6 shadow-md">
            <h3 className="text-lg font-semibold text-slate-800 mb-4 flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-red-500" />
              Avoid Today
            </h3>
            <div className="space-y-2">
              {foodsToAvoid.map((food, idx) => (
                <div key={idx} className="p-3 bg-red-50 rounded-xl border border-red-200 flex items-center gap-2 text-red-700 text-sm font-medium">
                  <AlertTriangle className="w-4 h-4 flex-shrink-0" />
                  {food}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
