'use client'

import { Button } from '@/components/ui/button'
import { Activity, Moon, Wind } from 'lucide-react'

export function YogaLifestyle() {
  const yogaPoses = [
    { name: 'Child\'s Pose', duration: '2 min', benefit: 'Calming & Cooling' },
    { name: 'Warrior I', duration: '1 min each side', benefit: 'Grounding & Strengthening' },
    { name: 'Moon Salutation', duration: '5 min', benefit: 'Cooling sequence' },
  ]

  const sleepTips = [
    'Maintain consistent sleep schedule (10 PM - 6 AM)',
    'Practice deep breathing 10 minutes before bed',
    'Avoid heavy meals 3 hours before sleep',
    'Keep bedroom cool and dark',
  ]

  const stressTips = [
    'Practice 10 minutes of meditation daily',
    'Perform Nadi Shodhana (alternate nostril breathing)',
    'Take mindful walks in nature',
    'Journaling for mental clarity',
  ]

  return (
    <section className="mb-8">
      <h2 className="text-2xl font-bold text-slate-800 mb-6 flex items-center gap-2">
        <Wind className="w-6 h-6 text-teal-600" />
        Yoga & Lifestyle
      </h2>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Yoga Poses */}
        <div className="lg:col-span-2">
          <div className="bg-gradient-to-br from-teal-50 to-emerald-50 rounded-3xl p-6 shadow-md">
            <h3 className="text-lg font-semibold text-slate-800 mb-4 flex items-center gap-2">
              <Activity className="w-5 h-5 text-teal-600" />
              Today's Yoga Routine
            </h3>
            <div className="space-y-3 mb-6">
              {yogaPoses.map((pose, idx) => (
                <div key={idx} className="bg-white rounded-xl p-4 flex items-center justify-between hover:shadow-md transition-shadow">
                  <div>
                    <h4 className="font-semibold text-slate-800">{pose.name}</h4>
                    <p className="text-sm text-slate-600">{pose.benefit}</p>
                  </div>
                  <span className="bg-teal-100 text-teal-700 text-sm font-semibold px-3 py-1 rounded-full">{pose.duration}</span>
                </div>
              ))}
            </div>
            <Button className="w-full bg-gradient-to-r from-teal-500 to-emerald-500 hover:from-teal-600 hover:to-emerald-600 text-white rounded-full">
              Start Yoga Session
            </Button>
          </div>
        </div>

        {/* Tips Card */}
        <div className="space-y-4">
          {/* Sleep Tips */}
          <div className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-2xl p-5 shadow-md">
            <h4 className="font-semibold text-slate-800 mb-3 flex items-center gap-2">
              <Moon className="w-5 h-5 text-indigo-600" />
              Sleep Tips
            </h4>
            <ul className="space-y-2">
              {sleepTips.slice(0, 2).map((tip, idx) => (
                <li key={idx} className="text-sm text-slate-700 flex gap-2">
                  <span className="text-indigo-600">•</span>
                  {tip}
                </li>
              ))}
            </ul>
          </div>

          {/* Stress Tips */}
          <div className="bg-gradient-to-br from-pink-50 to-rose-50 rounded-2xl p-5 shadow-md">
            <h4 className="font-semibold text-slate-800 mb-3 flex items-center gap-2">
              <Wind className="w-5 h-5 text-pink-600" />
              Stress Relief
            </h4>
            <ul className="space-y-2">
              {stressTips.slice(0, 2).map((tip, idx) => (
                <li key={idx} className="text-sm text-slate-700 flex gap-2">
                  <span className="text-pink-600">•</span>
                  {tip}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  )
}
