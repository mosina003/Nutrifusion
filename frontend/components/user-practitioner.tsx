'use client'

import { Button } from '@/components/ui/button'

export function UserPractitioner() {
  return (
    <section className="py-20 sm:py-28 bg-gradient-to-br from-rose-50 via-pink-50 to-fuchsia-50 relative overflow-hidden">
      {/* Vibrant gradient effects */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-bl from-rose-300 to-pink-400 rounded-full mix-blend-multiply filter blur-3xl opacity-25" />
      <div className="absolute bottom-0 left-0 w-80 h-80 bg-gradient-to-tr from-fuchsia-300 to-purple-300 rounded-full mix-blend-multiply filter blur-3xl opacity-25" />
      
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center mb-16">
          <h2 className="text-4xl sm:text-5xl font-bold text-slate-900 mb-4">Built for Everyone</h2>
          <p className="text-lg text-slate-600 text-balance">
            Whether you are an individual seeking better health or a practitioner helping clients
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* For Individuals */}
          <div className="group relative overflow-hidden rounded-3xl border-2 border-slate-200 hover:border-blue-400 transition-all duration-300 hover:shadow-2xl bg-gradient-to-br from-white to-blue-50/30">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-teal-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

            <div className="relative z-10 p-8 sm:p-12">
              <div className="text-5xl mb-6">👤</div>

              <h3 className="text-3xl font-bold text-slate-900 mb-6">For Individuals</h3>

              <ul className="space-y-4 mb-8">
                {[
                  'Personalized diet plans tailored to your unique health',
                  'Real-time health and nutrition tracking',
                  'Transparent AI explanations for every recommendation',
                  'Lifestyle-aware recommendations that actually fit your life',
                  'Progress tracking and adaptive feedback',
                ].map((item, idx) => (
                  <li key={idx} className="flex items-start gap-3">
                    <span className="text-emerald-500 font-bold mt-1">✓</span>
                    <span className="text-slate-700">{item}</span>
                  </li>
                ))}
              </ul>

              <Button className="w-full bg-gradient-to-r from-blue-600 to-teal-600 hover:from-blue-700 hover:to-teal-700 text-white rounded-lg py-6 text-lg font-semibold group-hover:shadow-lg transition-all">
                Register as User
              </Button>
            </div>
          </div>

          {/* For Practitioners */}
          <div className="group relative overflow-hidden rounded-3xl border-2 border-slate-200 hover:border-emerald-400 transition-all duration-300 hover:shadow-2xl bg-gradient-to-br from-white to-emerald-50/30">
            <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 to-teal-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

            <div className="relative z-10 p-8 sm:p-12">
              <div className="text-5xl mb-6">👨‍⚕️</div>

              <h3 className="text-3xl font-bold text-slate-900 mb-6">For Practitioners</h3>

              <ul className="space-y-4 mb-8">
                {[
                  'Comprehensive client health monitoring dashboard',
                  'Clinical override controls for expert judgment',
                  'Complete transparency into recommendation reasoning',
                  'Advanced analytics and progress tracking',
                  'Integration with your existing practice workflows',
                ].map((item, idx) => (
                  <li key={idx} className="flex items-start gap-3">
                    <span className="text-emerald-500 font-bold mt-1">✓</span>
                    <span className="text-slate-700">{item}</span>
                  </li>
                ))}
              </ul>

              <Button className="w-full bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white rounded-lg py-6 text-lg font-semibold group-hover:shadow-lg transition-all">
                Register as Practitioner
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
