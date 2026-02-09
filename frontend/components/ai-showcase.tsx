'use client'

export function AIShowcase() {
  const features = [
    'Rule-based decision logic across multiple medical systems',
    'Weighted scoring and conflict resolution',
    'Safety-first architecture with contraindication checking',
    'Optional AI-assisted explanation layer for deeper insights',
  ]

  return (
    <section className="py-20 sm:py-28 bg-gradient-to-b from-slate-900 to-slate-950 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-10 right-10 w-80 h-80 bg-blue-500 rounded-full mix-blend-multiply filter blur-3xl animate-blob" />
        <div className="absolute -bottom-8 left-10 w-80 h-80 bg-teal-500 rounded-full mix-blend-multiply filter blur-3xl animate-blob animation-delay-2000" />
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center mb-12">
          <h2 className="text-4xl sm:text-5xl font-bold text-white mb-4">
            Inside the NutriFusion Intelligence Engine
          </h2>
          <p className="text-lg text-slate-300 text-balance">
            Intelligent, transparent, and explainable recommendation logic
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
          {/* Features List */}
          <div className="space-y-4">
            {features.map((feature, idx) => (
              <div
                key={idx}
                className="p-4 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 hover:border-teal-400/50 transition-all group cursor-pointer"
              >
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 mt-1">
                    <div className="flex items-center justify-center h-6 w-6 rounded-full bg-gradient-to-r from-blue-500 to-teal-500">
                      <svg
                        className="h-3 w-3 text-white"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </div>
                  </div>
                  <p className="text-slate-200 group-hover:text-white transition-colors">{feature}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Explanation Showcase */}
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-600/20 to-teal-600/20 rounded-2xl blur-xl" />
            <div className="relative bg-slate-800/50 backdrop-blur-xl border border-white/10 rounded-2xl p-8 hover:border-teal-400/50 transition-all group">
              <h3 className="text-lg font-semibold text-white mb-4">Example Recommendation</h3>

              <div className="bg-slate-900/50 rounded-lg p-6 border border-slate-700/50 group-hover:border-teal-500/30 transition-all">
                <p className="text-slate-300 italic">
                  <span className="text-teal-400 font-semibold">NutriFusion AI:</span> "Based on your elevated Pitta dosha indicators and digestive concerns, we recommend incorporating cooling, easily digestible foods. The warm weather and your active lifestyle suggest increasing hydrating vegetables like cucumber and leafy greens. This balances your nutritional needs with traditional wisdom, improving digestion and maintaining optimal macronutrient intake."
                </p>
              </div>

              <div className="mt-6 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-400">Confidence</span>
                  <span className="text-emerald-400">92%</span>
                </div>
                <div className="w-full bg-slate-700 rounded-full h-2">
                  <div className="bg-gradient-to-r from-emerald-500 to-teal-500 h-2 rounded-full" style={{ width: '92%' }} />
                </div>

                <div className="flex justify-between text-sm pt-2">
                  <span className="text-slate-400">Multi-System Reasoning</span>
                  <span className="text-blue-400">Ayurveda + Nutrition</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Key Attributes */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[
            { icon: '🔒', title: 'Privacy First', desc: 'Your health data stays secure' },
            { icon: '⚡', title: 'Real-Time', desc: 'Instant recommendations' },
            { icon: '🎯', title: 'Personalized', desc: 'Unique to your profile' },
            { icon: '📖', title: 'Transparent', desc: 'Every decision explained' },
          ].map((attr, idx) => (
            <div
              key={idx}
              className="p-4 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 hover:border-teal-400/50 transition-all text-center"
            >
              <div className="text-3xl mb-2">{attr.icon}</div>
              <h4 className="text-white font-semibold mb-1">{attr.title}</h4>
              <p className="text-xs text-slate-400">{attr.desc}</p>
            </div>
          ))}
        </div>
      </div>

      <style jsx>{`
        @keyframes blob {
          0%,
          100% {
            transform: translate(0, 0) scale(1);
          }
          33% {
            transform: translate(30px, -50px) scale(1.1);
          }
          66% {
            transform: translate(-20px, 20px) scale(0.9);
          }
        }

        .animate-blob {
          animation: blob 7s infinite;
        }

        .animation-delay-2000 {
          animation-delay: 2s;
        }
      `}</style>
    </section>
  )
}
