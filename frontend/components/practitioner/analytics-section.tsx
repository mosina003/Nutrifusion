'use client'

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts'

export function AnalyticsSection() {
  const doshaDistribution = [
    { name: 'Vata', value: 18, color: '#3b82f6' },
    { name: 'Pitta', value: 22, color: '#f59e0b' },
    { name: 'Kapha', value: 15, color: '#10b981' },
    { name: 'Bi-Doshic', value: 12, color: '#8b5cf6' },
  ]

  const conditionFrequency = [
    { name: 'Weight Mgmt', count: 12 },
    { name: 'Digestion', count: 10 },
    { name: 'Sleep', count: 8 },
    { name: 'Energy', count: 7 },
    { name: 'Anxiety', count: 6 },
  ]

  const successRate = [
    { week: 'Week 1', rate: 65 },
    { week: 'Week 2', rate: 72 },
    { week: 'Week 3', rate: 78 },
    { week: 'Week 4', rate: 85 },
  ]

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Dosha Distribution */}
      <div className="bg-white rounded-lg border border-slate-200 p-6">
        <h3 className="text-lg font-semibold text-slate-900 mb-4">
          Dosha Distribution
        </h3>
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie
              data={doshaDistribution}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={({ name, value }) => `${name}: ${value}`}
              outerRadius={80}
              fill="#8884d8"
              dataKey="value"
            >
              {doshaDistribution.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip />
          </PieChart>
        </ResponsiveContainer>
      </div>

      {/* Common Conditions */}
      <div className="bg-white rounded-lg border border-slate-200 p-6">
        <h3 className="text-lg font-semibold text-slate-900 mb-4">
          Most Common Conditions
        </h3>
        <div className="space-y-3">
          {conditionFrequency.map((item, idx) => (
            <div key={idx} className="flex items-center gap-3">
              <span className="text-sm font-medium text-slate-700 w-24">
                {item.name}
              </span>
              <div className="flex-1 bg-slate-100 rounded-full h-2">
                <div
                  className="bg-blue-600 h-2 rounded-full"
                  style={{ width: `${(item.count / 12) * 100}%` }}
                />
              </div>
              <span className="text-sm font-semibold text-slate-900 w-8">
                {item.count}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Diet Plan Success Rate */}
      <div className="bg-white rounded-lg border border-slate-200 p-6 lg:col-span-2">
        <h3 className="text-lg font-semibold text-slate-900 mb-4">
          Diet Plan Success Rate Over Time
        </h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={successRate}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="week" />
            <YAxis />
            <Tooltip />
            <Bar dataKey="rate" fill="#10b981" radius={[8, 8, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Summary Stats */}
      <div className="bg-white rounded-lg border border-slate-200 p-6">
        <h3 className="text-lg font-semibold text-slate-900 mb-4">
          Key Metrics
        </h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-slate-600">Avg. Plan Duration</p>
            <p className="text-lg font-bold text-slate-900">28 days</p>
          </div>
          <div className="flex items-center justify-between">
            <p className="text-slate-600">Plans Completed</p>
            <p className="text-lg font-bold text-emerald-600">78%</p>
          </div>
          <div className="flex items-center justify-between">
            <p className="text-slate-600">Avg. Follow-up Time</p>
            <p className="text-lg font-bold text-slate-900">14 days</p>
          </div>
          <div className="flex items-center justify-between">
            <p className="text-slate-600">Patient Satisfaction</p>
            <p className="text-lg font-bold text-blue-600">4.2/5</p>
          </div>
        </div>
      </div>

      {/* Compliance Breakdown */}
      <div className="bg-white rounded-lg border border-slate-200 p-6">
        <h3 className="text-lg font-semibold text-slate-900 mb-4">
          Compliance Breakdown
        </h3>
        <div className="space-y-3">
          {[
            { label: 'High (80%+)', percentage: 58, color: 'bg-emerald-500' },
            { label: 'Medium (50-80%)', percentage: 28, color: 'bg-amber-500' },
            { label: 'Low (<50%)', percentage: 14, color: 'bg-red-500' },
          ].map((item, idx) => (
            <div key={idx} className="flex items-center gap-3">
              <div className={`${item.color} w-3 h-3 rounded-full`} />
              <span className="text-sm text-slate-600 flex-1">
                {item.label}
              </span>
              <span className="text-sm font-semibold text-slate-900">
                {item.percentage}%
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
