'use client'

import { Button } from '@/components/ui/button'

export function CTASection() {
  return (
    <section className="py-20 sm:py-28 relative overflow-hidden bg-gradient-to-br from-orange-100 via-coral-100 to-rose-100">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-r from-orange-400/20 via-pink-400/20 to-rose-400/20" />

      {/* Animated orbs */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-orange-400 to-pink-400 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-gradient-to-br from-rose-400 to-amber-400 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-2000" />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
        <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-slate-900 mb-6 text-balance">
          Start Your Personalized Nutrition Journey with NutriFusion
        </h2>

        <p className="text-xl text-slate-600 mb-12 text-balance max-w-2xl mx-auto">
          Experience intelligent, holistic, and explainable nutrition planning that integrates science and tradition.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12">
          <Button
            size="lg"
            className="px-8 py-6 text-lg bg-gradient-to-r from-blue-600 to-teal-600 hover:from-blue-700 hover:to-teal-700 text-white rounded-lg font-semibold shadow-lg hover:shadow-xl transition-all"
          >
            Try Demo
          </Button>
          <Button
            size="lg"
            className="px-8 py-6 text-lg bg-slate-900 hover:bg-slate-800 text-white rounded-lg font-semibold shadow-lg hover:shadow-xl transition-all"
          >
            Register Now
          </Button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 max-w-2xl mx-auto">
          {[
            { emoji: '✨', text: 'Instant Setup' },
            { emoji: '🔐', text: 'HIPAA Compliant' },
            { emoji: '🌍', text: '24/7 Support' },
          ].map((item, idx) => (
            <div key={idx} className="flex items-center justify-center gap-2 text-slate-700">
              <span className="text-2xl">{item.emoji}</span>
              <span className="font-medium">{item.text}</span>
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
