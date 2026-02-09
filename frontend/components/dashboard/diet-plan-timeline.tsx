'use client'

import { Clock, Leaf, Zap } from 'lucide-react'

export function DietPlanTimeline() {
  const meals = [
    {
      time: '7:00 AM',
      name: 'Breakfast',
      recipe: 'Warm Ghee Rice with Vegetables',
      calories: 320,
      explanation: 'Warm and grounding to balance your Pitta dosha',
      icon: '🌅',
    },
    {
      time: '10:30 AM',
      name: 'Mid-Morning Snack',
      recipe: 'Coconut Water & Almonds',
      calories: 150,
      explanation: 'Cooling hydration to manage Pitta heat',
      icon: '🥤',
    },
    {
      time: '1:00 PM',
      name: 'Lunch',
      recipe: 'Mung Bean Khichdi with Ghee',
      calories: 420,
      explanation: 'Easy to digest and balances all doshas',
      icon: '🍽️',
    },
    {
      time: '4:00 PM',
      name: 'Afternoon Snack',
      recipe: 'Fresh Fruit Salad',
      calories: 180,
      explanation: 'Light and refreshing for mid-day energy',
      icon: '🍎',
    },
    {
      time: '7:00 PM',
      name: 'Dinner',
      recipe: 'Light Vegetable Soup with Roti',
      calories: 280,
      explanation: 'Light meal supports restful sleep',
      icon: '🥣',
    },
  ]

  return (
    <section className="mb-8">
      <h2 className="text-2xl font-bold text-slate-800 mb-6 flex items-center gap-2">
        <Clock className="w-6 h-6 text-blue-600" />
        Today's Diet Plan
      </h2>

      <div className="relative">
        {/* Timeline Line */}
        <div className="hidden md:block absolute left-8 top-0 bottom-0 w-1 bg-gradient-to-b from-blue-300 to-emerald-300"></div>

        {/* Meal Cards */}
        <div className="space-y-6">
          {meals.map((meal, idx) => (
            <div key={idx} className="md:pl-24">
              {/* Timeline Dot */}
              <div className="hidden md:block absolute left-0 w-16 pt-1.5">
                <div className="relative flex items-center justify-center">
                  <div className="absolute w-4 h-4 bg-blue-600 rounded-full border-4 border-white shadow-md"></div>
                </div>
              </div>

              {/* Meal Card */}
              <div className="bg-white rounded-2xl p-6 shadow-md hover:shadow-lg transition-all hover:-translate-y-1">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <span className="text-4xl">{meal.icon}</span>
                    <div>
                      <div className="text-sm font-semibold text-slate-500">{meal.time}</div>
                      <h3 className="text-xl font-bold text-slate-800">{meal.name}</h3>
                    </div>
                  </div>
                  <span className="bg-blue-100 text-blue-700 text-sm font-semibold px-3 py-1 rounded-full">{meal.calories} cal</span>
                </div>

                <div className="mb-4">
                  <p className="text-base font-medium text-slate-700 mb-2">{meal.recipe}</p>
                  <p className="text-sm text-slate-600 flex items-start gap-2">
                    <Leaf className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
                    <span>{meal.explanation}</span>
                  </p>
                </div>

                <div className="flex gap-4 text-xs text-slate-500">
                  <span className="flex items-center gap-1">
                    <Zap className="w-3 h-3" />
                    Easy to prepare
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-8 p-4 bg-emerald-50 rounded-xl border border-emerald-200 text-emerald-800 text-sm">
        <p className="font-semibold mb-1">Total Calories Today: 1,350 / 1,840 goal</p>
        <div className="w-full bg-emerald-200 rounded-full h-2">
          <div className="bg-emerald-500 h-2 rounded-full w-3/4"></div>
        </div>
      </div>
    </section>
  )
}
