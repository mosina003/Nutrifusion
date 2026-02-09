'use client'

import { useState } from 'react'

export function Features() {
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null)

  const features = [
    {
      icon: '🌍',
      title: 'Multi-System Integration',
      description: 'Combines Ayurveda, Unani, Siddha, and Traditional Chinese Medicine with modern nutrition science',
    },
    {
      icon: '🧠',
      title: 'AI + Rule-Based Engine',
      description: 'Transparent decision logic that explains every recommendation with clinical reasoning',
    },
    {
      icon: '💡',
      title: 'Explainable Insights',
      description: 'Understand exactly why each recommendation is personalized for your unique health profile',
    },
    {
      icon: '📊',
      title: 'Dual Dashboards',
      description: 'Separate interfaces for individuals tracking health and practitioners monitoring clients',
    },
    {
      icon: '🛡️',
      title: 'Safety & Allergy Detection',
      description: 'Intelligent allergen detection and contraindication checking across all recommendations',
    },
    {
      icon: '🔄',
      title: 'Continuous Learning',
      description: 'Adaptive system that improves recommendations based on user feedback and outcomes',
    },
  ]

  return (
    <section className="py-20 sm:py-28 bg-gradient-to-br from-amber-50 via-yellow-50 to-orange-50 relative overflow-hidden">
      {/* Warm gradient overlays */}
      <div className="absolute inset-0 bg-gradient-to-tr from-orange-100/30 via-transparent to-amber-100/30" />
      <div className="absolute top-0 left-1/4 w-72 h-72 bg-gradient-to-br from-yellow-300 to-orange-300 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse" />
      
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center mb-16">
          <h2 className="text-4xl sm:text-5xl font-bold text-slate-900 mb-4">Key Features</h2>
          <p className="text-lg text-slate-600 text-balance">
            Powered by cutting-edge AI and healthcare expertise
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, idx) => (
            <div
              key={idx}
              className="group relative bg-white p-8 rounded-2xl border border-slate-200 hover:border-teal-400 transition-all duration-300 hover:shadow-xl cursor-pointer overflow-hidden"
              onMouseEnter={() => setHoveredIdx(idx)}
              onMouseLeave={() => setHoveredIdx(null)}
            >
              {/* Gradient overlay on hover */}
              <div
                className="absolute inset-0 bg-gradient-to-br from-blue-50 to-teal-50 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
              />

              <div className="relative z-10">
                <div className="text-5xl mb-4 transform transition-transform duration-300 group-hover:scale-110">
                  {feature.icon}
                </div>

                <h3 className="font-bold text-lg text-slate-900 mb-3 group-hover:text-teal-600 transition-colors">
                  {feature.title}
                </h3>

                <p className="text-slate-600 text-sm leading-relaxed">{feature.description}</p>

                <div className="mt-4 h-1 w-0 bg-gradient-to-r from-blue-500 to-teal-500 group-hover:w-full transition-all duration-300" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
