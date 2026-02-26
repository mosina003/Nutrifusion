'use client'

import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Activity, Moon, Wind } from 'lucide-react'
import { getToken } from '@/lib/api'

export function YogaLifestyle() {
  const [yogaPoses, setYogaPoses] = useState<any[]>([])
  const [sleepTips, setSleepTips] = useState<string[]>([])
  const [stressTips, setStressTips] = useState<string[]>([])
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
          setYogaPoses(data.data.yoga.poses)
          setSleepTips(data.data.yoga.sleepTips)
          setStressTips(data.data.yoga.stressTips)
        }
      } catch (error) {
        console.error('Error fetching yoga data:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchDashboardData()
  }, [])

  if (loading) {
    return (
      <section className="mb-8">
        <h2 className="text-2xl font-bold text-slate-800 mb-6 flex items-center gap-2">
          <Wind className="w-6 h-6 text-teal-600" />
          Yoga & Lifestyle
        </h2>
        <div className="bg-gray-200 rounded-3xl p-6 h-64 animate-pulse" />
      </section>
    )
  }

  return (
    <section className="mb-8">
      <h2 className="text-2xl font-bold text-slate-800 mb-6 flex items-center gap-2">
        <Wind className="w-6 h-6 text-teal-600" />
        Yoga & Lifestyle
      </h2>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Yoga Poses */}
        <div className="lg:col-span-2">
          <div className="bg-gradient-to-br from-teal-50 to-emerald-50 rounded-3xl p-6 shadow-md">
            <h3 className="text-lg font-semibold text-slate-800 mb-4 flex items-center gap-2">
              <Activity className="w-5 h-5 text-teal-600" />
              Today's Yoga Routine
            </h3>
            <div className="space-y-3 mb-6">
              {yogaPoses.map((pose, idx) => (
                <div key={idx} className="bg-white rounded-xl p-4 flex items-center justify-between hover:shadow-md transition-shadow">
                  <div>
                    <h4 className="font-semibold text-slate-800">{pose.name}</h4>
                    <p className="text-sm text-slate-600">{pose.benefit}</p>
                  </div>
                  <span className="bg-teal-100 text-teal-700 text-sm font-semibold px-3 py-1 rounded-full">{pose.duration}</span>
                </div>
              ))}
            </div>
            <Button className="w-full bg-gradient-to-r from-teal-500 to-emerald-500 hover:from-teal-600 hover:to-emerald-600 text-white rounded-full">
              Start Yoga Session
            </Button>
          </div>
        </div>

        {/* Tips Card */}
        <div className="space-y-4">
          {/* Sleep Tips */}
          <div className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-2xl p-5 shadow-md">
            <h4 className="font-semibold text-slate-800 mb-3 flex items-center gap-2">
              <Moon className="w-5 h-5 text-indigo-600" />
              Sleep Tips
            </h4>
            <ul className="space-y-2">
              {sleepTips.slice(0, 2).map((tip, idx) => (
                <li key={idx} className="text-sm text-slate-700 flex gap-2">
                  <span className="text-indigo-600">•</span>
                  {tip}
                </li>
              ))}
            </ul>
          </div>

          {/* Stress Tips */}
          <div className="bg-gradient-to-br from-pink-50 to-rose-50 rounded-2xl p-5 shadow-md">
            <h4 className="font-semibold text-slate-800 mb-3 flex items-center gap-2">
              <Wind className="w-5 h-5 text-pink-600" />
              Stress Relief
            </h4>
            <ul className="space-y-2">
              {stressTips.slice(0, 2).map((tip, idx) => (
                <li key={idx} className="text-sm text-slate-700 flex gap-2">
                  <span className="text-pink-600">•</span>
                  {tip}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  )
}
