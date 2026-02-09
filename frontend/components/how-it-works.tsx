'use client'

export function HowItWorks() {
  const steps = [
    {
      number: '01',
      title: 'Health & Lifestyle Data',
      description: 'User collects comprehensive health and lifestyle information',
      icon: '📋',
    },
    {
      number: '02',
      title: 'Unified Food Database',
      description: 'Modern nutrition science + traditional medical systems',
      icon: '🍎',
    },
    {
      number: '03',
      title: 'AI Fusion Engine',
      description: 'Rule-based intelligence with transparent decision logic',
      icon: '⚙️',
    },
    {
      number: '04',
      title: 'Personalized Diet Plan',
      description: 'Generate customized nutrition recommendations',
      icon: '🎯',
    },
    {
      number: '05',
      title: 'Continuous Learning',
      description: 'Adaptive feedback and refinement over time',
      icon: '📈',
    },
  ]

  return (
    <section className="py-20 sm:py-28 bg-gradient-to-br from-orange-50 via-pink-50 to-rose-50 relative overflow-hidden">
      {/* Animated gradient orbs */}
      <div className="absolute top-20 right-10 w-96 h-96 bg-gradient-to-br from-orange-300 to-pink-300 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-float-slow" />
      <div className="absolute bottom-20 left-10 w-80 h-80 bg-gradient-to-br from-rose-300 to-amber-300 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-float" />
      
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center mb-16">
          <h2 className="text-4xl sm:text-5xl font-bold text-slate-900 mb-4">How NutriFusion Works</h2>
          <p className="text-lg text-slate-600 text-balance">
            A transparent and adaptive nutrition intelligence pipeline
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 lg:gap-2">
          {steps.map((step, idx) => (
            <div key={idx} className="relative group">
              <div className="flex flex-col items-center text-center h-full">
                {/* Connector Line */}
                {idx < steps.length - 1 && (
                  <div className="hidden lg:block absolute top-24 left-[60%] w-[calc(200%_-_40px)] h-1 bg-gradient-to-r from-teal-300 to-transparent group-hover:from-teal-500 transition-colors" />
                )}

                {/* Card */}
                <div className="relative z-10 bg-white p-6 rounded-2xl border border-slate-200 hover:border-teal-400 hover:shadow-xl transition-all duration-300 h-full flex flex-col">
                  <div className="text-5xl mb-4">{step.icon}</div>

                  <div className="inline-flex items-center justify-center w-12 h-12 rounded-lg bg-gradient-to-br from-blue-100 to-teal-100 mb-4 mx-auto">
                    <span className="text-lg font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-teal-600">
                      {step.number}
                    </span>
                  </div>

                  <h3 className="font-bold text-slate-900 mb-3 text-lg">{step.title}</h3>
                  <p className="text-sm text-slate-600 flex-grow">{step.description}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
      <style jsx>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px) translateX(0px); }
          50% { transform: translateY(-20px) translateX(10px); }
        }
        @keyframes float-slow {
          0%, 100% { transform: translateY(0px) translateX(0px); }
          50% { transform: translateY(-30px) translateX(-15px); }
        }
        .animate-float {
          animation: float 8s ease-in-out infinite;
        }
        .animate-float-slow {
          animation: float-slow 10s ease-in-out infinite;
        }
      `}</style>    </section>
  )
}
