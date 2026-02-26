'use client'

import { useEffect, useState } from 'react'
import { TrendingUp } from 'lucide-react'
import { getToken } from '@/lib/api'

export function ProgressCharts() {
  const [chartData, setChartData] = useState<any[]>([])
  const [summary, setSummary] = useState<any>(null)
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
          const charts = data.data.progress.charts
          setChartData([
            { ...charts.calories, color: 'from-blue-500 to-indigo-500' },
            { ...charts.weight, color: 'from-emerald-500 to-teal-500' },
            { ...charts.doshaBalance, color: 'from-purple-500 to-pink-500' },
            { ...charts.compliance, color: 'from-amber-500 to-orange-500' }
          ])
          setSummary(data.data.progress.summary)
        }
      } catch (error) {
        console.error('Error fetching progress data:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchDashboardData()
  }, [])

  if (loading) {
    return (
      <section>
        <h2 className="text-2xl font-bold text-slate-800 mb-6 flex items-center gap-2">
          <TrendingUp className="w-6 h-6 text-blue-600" />
          Progress Tracking
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="bg-gray-200 rounded-2xl p-6 h-64 animate-pulse" />
          ))}
        </div>
      </section>
    )
  }

  function Chart({ data }: { data: (typeof chartData)[0] }) {
    const maxBar = Math.max(...data.bars)
    return (
      <div className="bg-white rounded-2xl p-6 shadow-md hover:shadow-lg transition-shadow">
        <div className="flex items-start justify-between mb-6">
          <div>
            <h3 className="text-lg font-semibold text-slate-800">{data.title}</h3>
            <p className="text-3xl font-bold text-slate-900 mt-2">
              {data.value}
              <span className="text-sm text-slate-500 ml-2">{data.unit}</span>
            </p>
          </div>
          <span className="bg-green-100 text-green-700 text-sm font-semibold px-3 py-1 rounded-full">{data.trend}</span>
        </div>

        {/* Mini Bar Chart */}
        <div className="mb-6">
          <div className="flex items-end justify-center gap-2 h-24">
            {data.bars.map((bar: number, idx: number) => (
              <div key={idx} className="flex-1 flex flex-col items-center group">
                <div
                  className={`w-full bg-gradient-to-t ${data.color} rounded-t-lg transition-all hover:opacity-80 cursor-pointer`}
                  style={{ height: `${(bar / maxBar) * 100}%` }}
                  title={`${data.days[idx]}: ${bar}`}
                />
              </div>
            ))}
          </div>
        </div>

        {/* Days Label */}
        <div className="flex justify-between text-xs text-slate-500 px-1">
          <span>{data.days[0]}</span>
          <span className="text-center">{data.days[Math.floor(data.days.length / 2)]}</span>
          <span>{data.days[data.days.length - 1]}</span>
        </div>
      </div>
    )
  }

  return (
    <section>
      <h2 className="text-2xl font-bold text-slate-800 mb-6 flex items-center gap-2">
        <TrendingUp className="w-6 h-6 text-blue-600" />
        Progress Tracking
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {chartData.map((data, idx) => (
          <Chart key={idx} data={data} />
        ))}
      </div>

      {/* Summary Footer */}
      {summary && (
        <div className="mt-8 bg-gradient-to-r from-emerald-50 to-teal-50 rounded-2xl p-6 border border-emerald-200">
          <h3 className="text-lg font-semibold text-emerald-900 mb-4">Your Progress Summary</h3>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-white rounded-lg p-4">
              <p className="text-sm text-slate-600 mb-1">Total Days Tracked</p>
              <p className="text-2xl font-bold text-slate-800">{summary.totalDaysTracked}</p>
            </div>
            <div className="bg-white rounded-lg p-4">
              <p className="text-sm text-slate-600 mb-1">Diet Plan Adherence</p>
              <p className="text-2xl font-bold text-emerald-600">{summary.adherence}%</p>
            </div>
            <div className="bg-white rounded-lg p-4">
              <p className="text-sm text-slate-600 mb-1">Weight Lost</p>
              <p className="text-2xl font-bold text-emerald-600">{summary.weightLost} kg</p>
            </div>
            <div className="bg-white rounded-lg p-4">
              <p className="text-sm text-slate-600 mb-1">Streak</p>
              <p className="text-2xl font-bold text-amber-600">{summary.streak} days</p>
            </div>
          </div>
        </div>
      )}
    </section>
  )
}
