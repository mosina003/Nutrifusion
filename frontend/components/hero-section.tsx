'use client'

import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { ArrowRight, Sparkles, Activity, Shield } from 'lucide-react'
import Link from 'next/link'

interface Sparkle {
  id: number
  x: number
  y: number
  size: number
  duration: number
}

export function HeroSection() {
  const [sparkles, setSparkles] = useState<Sparkle[]>([])
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 })

  useEffect(() => {
    // Parallax effect on scroll
    const handleScroll = () => {
      const scrolled = window.scrollY
      const hero = document.querySelector('.hero-bg') as HTMLElement
      if (hero) {
        hero.style.transform = `translateY(${scrolled * 0.5}px) scale(1.1)`
      }
    }

    // Mouse move sparkle effect
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY })
      
      // Create sparkle on mouse move (throttled)
      if (Math.random() > 0.7) {
        const newSparkle: Sparkle = {
          id: Date.now() + Math.random(),
          x: e.clientX,
          y: e.clientY,
          size: Math.random() * 8 + 4,
          duration: Math.random() * 1000 + 1500,
        }
        
        setSparkles(prev => [...prev, newSparkle])
        
        // Remove sparkle after animation
        setTimeout(() => {
          setSparkles(prev => prev.filter(s => s.id !== newSparkle.id))
        }, newSparkle.duration)
      }
    }

    window.addEventListener('scroll', handleScroll)
    window.addEventListener('mousemove', handleMouseMove)
    
    return () => {
      window.removeEventListener('scroll', handleScroll)
      window.removeEventListener('mousemove', handleMouseMove)
    }
  }, [])

  return (
    <section 
      className="relative min-h-screen flex items-center justify-center overflow-hidden bg-gradient-to-br from-slate-900 via-blue-900 to-purple-900"
    >
      {/* Background Image - MORE VISIBLE */}
      <div 
        className="hero-bg absolute inset-0 w-full h-full transition-transform duration-300 ease-out"
        style={{
          backgroundImage: 'url(/images/healthcare-bg.png)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
          opacity: 0.7,
          transform: 'scale(1.1)',
        }}
      />

      {/* Lighter Gradient Overlay - Image stays visible */}
      <div 
        className="absolute inset-0 pointer-events-none"
        style={{
          background: 'linear-gradient(135deg, rgba(15, 23, 42, 0.6) 0%, rgba(30, 58, 138, 0.5) 35%, rgba(88, 28, 135, 0.4) 70%, transparent 100%)',
        }}
      />

      {/* Radial Glow Effect */}
      <div 
        className="absolute inset-0 pointer-events-none"
        style={{
          background: 'radial-gradient(circle at 30% 50%, rgba(59, 130, 246, 0.1) 0%, transparent 50%)',
        }}
      />

      {/* Animated Grid Pattern */}
      <div 
        className="absolute inset-0 opacity-10"
        style={{
          backgroundImage: `
            linear-gradient(rgba(59, 130, 246, 0.5) 1px, transparent 1px),
            linear-gradient(90deg, rgba(59, 130, 246, 0.5) 1px, transparent 1px)
          `,
          backgroundSize: '50px 50px',
          animation: 'grid-move 20s linear infinite',
        }}
      />

      {/* Mouse Move Sparkles */}
      {sparkles.map(sparkle => (
        <div
          key={sparkle.id}
          className="absolute pointer-events-none z-50"
          style={{
            left: sparkle.x,
            top: sparkle.y,
            width: sparkle.size,
            height: sparkle.size,
          }}
        >
          <div 
            className="w-full h-full rounded-full bg-gradient-to-r from-yellow-300 via-cyan-300 to-purple-300"
            style={{
              boxShadow: '0 0 20px rgba(255, 255, 255, 0.8)',
              animation: `sparkle-fade ${sparkle.duration}ms ease-out forwards`,
            }}
          />
        </div>
      ))}

      {/* Mouse Glow Effect */}
      <div
        className="absolute pointer-events-none z-40 w-96 h-96 rounded-full transition-opacity duration-300"
        style={{
          left: mousePosition.x - 192,
          top: mousePosition.y - 192,
          background: 'radial-gradient(circle, rgba(139, 92, 246, 0.2) 0%, transparent 70%)',
          filter: 'blur(40px)',
        }}
      />

      {/* Floating Medical Icons */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-20 left-10 animate-float-slow opacity-20">
          <div className="w-16 h-16 rounded-full bg-blue-500 blur-xl"></div>
        </div>
        <div className="absolute top-40 right-20 animate-float-slower opacity-20">
          <div className="w-24 h-24 rounded-full bg-purple-500 blur-xl"></div>
        </div>
        <div className="absolute bottom-32 left-1/4 animate-float opacity-20">
          <div className="w-20 h-20 rounded-full bg-teal-500 blur-xl"></div>
        </div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
        {/* Premium Badge */}
        <div className="mb-8 animate-fade-in-down">
          <div className="inline-flex items-center gap-2 px-6 py-3 bg-white/10 backdrop-blur-xl rounded-full border border-white/20 shadow-2xl hover:bg-white/15 transition-all group">
            <Sparkles className="w-4 h-4 text-yellow-300 animate-pulse" />
            <span className="text-sm font-semibold text-white">AI-Powered Healthcare Innovation</span>
            <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse"></div>
          </div>
        </div>

        {/* Hero Title with Premium Styling */}
        <div className="mb-8 animate-fade-in space-y-4">
          <h1 className="text-6xl sm:text-7xl lg:text-8xl font-black text-white mb-4 leading-tight tracking-tight">
            <span className="inline-block bg-clip-text text-transparent bg-gradient-to-r from-blue-400 via-cyan-300 to-teal-400 animate-gradient-x">
              NutriFusion
            </span>
          </h1>
          
          <div className="flex items-center justify-center gap-3 mb-6">
            <div className="h-px w-16 bg-gradient-to-r from-transparent to-blue-400"></div>
            <Activity className="w-6 h-6 text-blue-400 animate-pulse" />
            <div className="h-px w-16 bg-gradient-to-l from-transparent to-blue-400"></div>
          </div>

          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white/90 mb-6 leading-relaxed max-w-4xl mx-auto">
            AI-Powered Personalized Nutrition for{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500">
              Holistic Health
            </span>
          </h2>

          <p className="text-lg sm:text-xl text-blue-100/80 max-w-3xl mx-auto leading-relaxed font-medium">
            Integrating <strong className="text-white">modern nutrition science</strong> with{' '}
            <strong className="text-cyan-300">Ayurveda</strong>,{' '}
            <strong className="text-teal-300">Unani</strong>,{' '}
            <strong className="text-purple-300">Siddha</strong>, and{' '}
            <strong className="text-blue-300">Traditional Chinese Medicine</strong>{' '}
            to deliver explainable, personalized diet recommendations
          </p>
        </div>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-16 animate-fade-in-up">
          <Link href="/register">
            <Button
              size="lg"
              className="group px-10 py-7 text-lg bg-gradient-to-r from-blue-600 via-cyan-600 to-teal-600 hover:from-blue-500 hover:via-cyan-500 hover:to-teal-500 text-white rounded-2xl font-bold shadow-2xl hover:shadow-cyan-500/50 transition-all transform hover:scale-105 border-2 border-white/20"
            >
              Get Started Free
              <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Button>
          </Link>
          
          <Link href="/login">
            <Button
              size="lg"
              variant="outline"
              className="px-10 py-7 text-lg border-2 border-cyan-400/60 bg-slate-900/40 text-cyan-300 hover:bg-cyan-500/20 hover:border-cyan-300 hover:text-white rounded-2xl font-bold backdrop-blur-xl transition-all transform hover:scale-105 shadow-xl"
            >
              <Shield className="mr-2 w-5 h-5" />
              Secure Login
            </Button>
          </Link>
        </div>

        {/* Premium Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 max-w-5xl mx-auto animate-fade-in-up-delay">
          {[
            { 
              icon: '🧬', 
              label: 'Clinical Decision Support',
              value: 'AI-Driven Intelligence',
              color: 'from-blue-500 to-cyan-500'
            },
            { 
              icon: '🔄', 
              label: '5 Medical Systems',
              value: 'Integrated Approach',
              color: 'from-cyan-500 to-teal-500'
            },
            { 
              icon: '✨', 
              label: 'Explainable AI',
              value: 'Transparent Results',
              color: 'from-teal-500 to-emerald-500'
            },
          ].map((stat, idx) => (
            <div
              key={idx}
              className="group relative p-6 bg-white/5 backdrop-blur-2xl rounded-3xl border border-white/10 hover:border-white/30 transition-all hover:shadow-2xl hover:-translate-y-2 hover:bg-white/10"
            >
              {/* Glow Effect */}
              <div className={`absolute inset-0 rounded-3xl bg-gradient-to-br ${stat.color} opacity-0 group-hover:opacity-10 transition-opacity blur-xl`}></div>
              
              <div className="relative">
                <div className="text-5xl mb-4 transform group-hover:scale-110 transition-transform">
                  {stat.icon}
                </div>
                <div className="text-lg font-bold text-white mb-1">{stat.label}</div>
                <div className="text-sm text-blue-200/70 font-semibold">{stat.value}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Trust Indicators */}
        <div className="mt-16 flex flex-wrap items-center justify-center gap-8 opacity-60">
          <div className="flex items-center gap-2 text-white/70 text-sm font-medium">
            <Shield className="w-4 h-4" />
            AYUSH Compliant
          </div>
          <div className="w-px h-6 bg-white/20"></div>
          <div className="flex items-center gap-2 text-white/70 text-sm font-medium">
            <Activity className="w-4 h-4" />
            HIPAA Secure
          </div>
          <div className="w-px h-6 bg-white/20"></div>
          <div className="flex items-center gap-2 text-white/70 text-sm font-medium">
            <Sparkles className="w-4 h-4" />
            Evidence-Based
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes fade-in {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes fade-in-down {
          from {
            opacity: 0;
            transform: translateY(-20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes fade-in-up {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes gradient-x {
          0%, 100% {
            background-position: 0% 50%;
          }
          50% {
            background-position: 100% 50%;
          }
        }

        @keyframes grid-move {
          0% {
            background-position: 0 0;
          }
          100% {
            background-position: 50px 50px;
          }
        }

        @keyframes float {
          0%, 100% {
            transform: translateY(0px) translateX(0px);
          }
          50% {
            transform: translateY(-20px) translateX(10px);
          }
        }

        @keyframes float-slow {
          0%, 100% {
            transform: translateY(0px) translateX(0px);
          }
          50% {
            transform: translateY(-30px) translateX(-15px);
          }
        }

        @keyframes float-slower {
          0%, 100% {
            transform: translateY(0px) translateX(0px);
          }
          50% {
            transform: translateY(-25px) translateX(20px);
          }
        }

        .animate-fade-in {
          animation: fade-in 1s ease-out;
        }

        .animate-fade-in-down {
          animation: fade-in-down 0.8s ease-out;
        }

        .animate-fade-in-up {
          animation: fade-in-up 1s ease-out 0.3s both;
        }

        .animate-fade-in-up-delay {
          animation: fade-in-up 1s ease-out 0.6s both;
        }

        .animate-gradient-x {
          background-size: 200% 200%;
          animation: gradient-x 3s ease infinite;
        }

        .animate-float {
          animation: float 6s ease-in-out infinite;
        }

        .animate-float-slow {
          animation: float-slow 8s ease-in-out infinite;
        }

        .animate-float-slower {
          animation: float-slower 10s ease-in-out infinite;
        }

        @keyframes sparkle-fade {
          0% {
            opacity: 1;
            transform: scale(0) rotate(0deg);
          }
          50% {
            opacity: 0.8;
            transform: scale(1.5) rotate(180deg);
          }
          100% {
            opacity: 0;
            transform: scale(0) rotate(360deg);
          }
        }
      `}</style>
    </section>
  )
}
