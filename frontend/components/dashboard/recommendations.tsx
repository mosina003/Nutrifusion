'use client'

import { Star, AlertTriangle, Clock } from 'lucide-react'

export function Recommendations() {
  const recommendedFoods = [
    { name: 'Coconut Water', tags: ['Cooling', 'Hydrating'], score: 92 },
    { name: 'Cucumber Salad', tags: ['Low Carb', 'Cooling'], score: 88 },
    { name: 'Basmati Rice', tags: ['Easy Digest', 'Balanced'], score: 85 },
    { name: 'Ghee', tags: ['Nourishing', 'Grounding'], score: 82 },
  ]

  const foodsToAvoid = ['Spicy Foods', 'Red Meat', 'Caffeine', 'Fried Items']

  const suggestedMeals = [
    { name: 'Breakfast', icon: '🌅', items: 'Oatmeal with berries' },
    { name: 'Lunch', icon: '☀️', items: 'Khichdi with vegetables' },
    { name: 'Dinner', icon: '🌙', items: 'Light vegetable curry' },
  ]

  return (
    <section className="mb-8">
      <h2 className="text-2xl font-bold text-slate-800 mb-6">Today's Personalized Recommendations</h2>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recommended Foods */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-3xl p-6 shadow-md">
            <h3 className="text-lg font-semibold text-slate-800 mb-4 flex items-center gap-2">
              <Star className="w-5 h-5 text-amber-500" />
              Recommended Foods Today
            </h3>
            <div className="space-y-3">
              {recommendedFoods.map((food, idx) => (
                <div key={idx} className="p-4 bg-gradient-to-r from-emerald-50 to-teal-50 rounded-2xl hover:shadow-md transition-shadow">
                  <div className="flex items-start justify-between mb-2">
                    <h4 className="font-semibold text-slate-800">{food.name}</h4>
                    <span className="bg-emerald-500 text-white text-xs font-bold px-3 py-1 rounded-full">{food.score}%</span>
                  </div>
                  <div className="flex gap-2">
                    {food.tags.map((tag, i) => (
                      <span key={i} className="text-xs bg-emerald-100 text-emerald-700 px-2 py-1 rounded-full">
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Foods to Avoid */}
        <div>
          <div className="bg-white rounded-3xl p-6 shadow-md">
            <h3 className="text-lg font-semibold text-slate-800 mb-4 flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-red-500" />
              Avoid Today
            </h3>
            <div className="space-y-2">
              {foodsToAvoid.map((food, idx) => (
                <div key={idx} className="p-3 bg-red-50 rounded-xl border border-red-200 flex items-center gap-2 text-red-700 text-sm font-medium">
                  <AlertTriangle className="w-4 h-4 flex-shrink-0" />
                  {food}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Suggested Meals */}
      <div className="mt-6">
        <h3 className="text-lg font-semibold text-slate-800 mb-4 flex items-center gap-2">
          <Clock className="w-5 h-5 text-blue-500" />
          Suggested Meals
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {suggestedMeals.map((meal, idx) => (
            <div key={idx} className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-5 shadow-sm hover:shadow-md transition-shadow">
              <div className="text-3xl mb-3">{meal.icon}</div>
              <h4 className="font-semibold text-slate-800 mb-1">{meal.name}</h4>
              <p className="text-sm text-slate-600">{meal.items}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
