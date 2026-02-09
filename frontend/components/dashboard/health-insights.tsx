'use client'

import { Lightbulb, AlertCircle, CheckCircle } from 'lucide-react'

export function HealthInsights() {
  const insights = [
    {
      type: 'warning',
      title: 'High Pitta Today',
      description: 'Your Pitta is elevated. Focus on cooling foods like coconut, cucumber, and milk-based drinks.',
      icon: AlertCircle,
      bgColor: 'bg-orange-50',
      borderColor: 'border-orange-200',
      textColor: 'text-orange-700',
    },
    {
      type: 'tip',
      title: 'Increase Fiber Intake',
      description: 'Your fiber consumption is below target. Add leafy greens and whole grains to your meals.',
      icon: Lightbulb,
      bgColor: 'bg-blue-50',
      borderColor: 'border-blue-200',
      textColor: 'text-blue-700',
    },
    {
      type: 'success',
      title: 'Great Hydration',
      description: "You're maintaining excellent water intake. Keep it up for optimal digestion!",
      icon: CheckCircle,
      bgColor: 'bg-emerald-50',
      borderColor: 'border-emerald-200',
      textColor: 'text-emerald-700',
    },
    {
      type: 'tip',
      title: 'Sleep Quality Matters',
      description: 'Try going to bed by 10 PM to align with your natural circadian rhythm.',
      icon: Lightbulb,
      bgColor: 'bg-indigo-50',
      borderColor: 'border-indigo-200',
      textColor: 'text-indigo-700',
    },
  ]

  return (
    <section className="mb-8">
      <h2 className="text-2xl font-bold text-slate-800 mb-6 flex items-center gap-2">
        <Lightbulb className="w-6 h-6 text-amber-500" />
        Health Insights
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {insights.map((insight, idx) => {
          const Icon = insight.icon
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
