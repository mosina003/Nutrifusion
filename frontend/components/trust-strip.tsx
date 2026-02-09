'use client'

export function TrustStrip() {
  const badges = [
    { title: 'AI-Driven Clinical Decision Support', icon: '🤖' },
    { title: 'Multi-System Medical Integration', icon: '🔗' },
    { title: 'Explainable & Rule-Based Intelligence', icon: '🧠' },
  ]

  const metrics = [
    { label: '5 Medical Systems', value: 'Integrated' },
    { label: 'Safety-First', value: 'Recommendation Engine' },
    { label: 'Research-Grade', value: 'Architecture' },
  ]

  return (
    <section className="py-16 sm:py-24 bg-gradient-to-b from-transparent to-slate-50 border-y border-slate-200/50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-12">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-12">
            {badges.map((badge, idx) => (
              <div
                key={idx}
                className="group p-4 bg-white rounded-xl border border-slate-200 hover:border-teal-300 hover:shadow-lg transition-all duration-300 cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{badge.icon}</span>
                  <p className="font-semibold text-slate-700 group-hover:text-teal-600 transition-colors">
                    {badge.title}
                  </p>
                </div>
              </div>
            ))}
          </div>

          <div className="bg-gradient-to-r from-blue-50 via-teal-50 to-emerald-50 rounded-2xl p-8 border border-teal-200/50">
            <h3 className="text-center text-sm font-semibold text-slate-500 uppercase tracking-wide mb-8">
              Key Metrics
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
              {metrics.map((metric, idx) => (
                <div key={idx} className="text-center">
                  <div className="text-2xl sm:text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-teal-600 mb-2">
                    {metric.label}
                  </div>
                  <p className="text-slate-600 font-medium">{metric.value}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
