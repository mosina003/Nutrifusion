'use client'

import { TrendingUp } from 'lucide-react'

export function ProgressCharts() {
  const chartData = [
    {
      title: 'Weekly Calorie Trend',
      value: '1,450',
      unit: 'avg/day',
      trend: '+5%',
      bars: [65, 72, 68, 75, 80, 85, 90],
      days: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
      color: 'from-blue-500 to-indigo-500',
    },
    {
      title: 'Weight Trend',
      value: '72.5',
      unit: 'kg',
      trend: '-2.5 kg',
      bars: [85, 84.5, 84, 83, 82, 72.5, 72.5],
      days: ['Week 1', 'Week 2', 'Week 3', 'Week 4', 'Week 5', 'Week 6', 'Week 7'],
      color: 'from-emerald-500 to-teal-500',
    },
    {
      title: 'Dosha Balance',
      value: '68%',
      unit: 'balanced',
      trend: '+8%',
      bars: [45, 50, 55, 62, 65, 67, 68],
      days: ['Day 1', 'Day 2', 'Day 3', 'Day 4', 'Day 5', 'Day 6', 'Today'],
      color: 'from-purple-500 to-pink-500',
    },
    {
      title: 'Compliance Rate',
      value: '92%',
      unit: 'adherence',
      trend: '+3%',
      bars: [72, 78, 85, 88, 90, 91, 92],
      days: ['Week 1', 'Week 2', 'Week 3', 'Week 4', 'Week 5', 'Week 6', 'Week 7'],
      color: 'from-amber-500 to-orange-500',
    },
  ]

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
            {data.bars.map((bar, idx) => (
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
      <div className="mt-8 bg-gradient-to-r from-emerald-50 to-teal-50 rounded-2xl p-6 border border-emerald-200">
        <h3 className="text-lg font-semibold text-emerald-900 mb-4">Your Progress Summary</h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white rounded-lg p-4">
            <p className="text-sm text-slate-600 mb-1">Total Days Tracked</p>
            <p className="text-2xl font-bold text-slate-800">47</p>
          </div>
          <div className="bg-white rounded-lg p-4">
            <p className="text-sm text-slate-600 mb-1">Diet Plan Adherence</p>
            <p className="text-2xl font-bold text-emerald-600">92%</p>
          </div>
          <div className="bg-white rounded-lg p-4">
            <p className="text-sm text-slate-600 mb-1">Weight Lost</p>
            <p className="text-2xl font-bold text-emerald-600">12.5 kg</p>
          </div>
          <div className="bg-white rounded-lg p-4">
            <p className="text-sm text-slate-600 mb-1">Streak</p>
            <p className="text-2xl font-bold text-amber-600">27 days</p>
          </div>
        </div>
      </div>
    </section>
  )
}
