'use client'

import { Clock, Leaf, Zap, AlertCircle } from 'lucide-react'
import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { DaySelector } from './day-selector'
import { motion, AnimatePresence } from 'framer-motion'

interface DietPlan {
  '7_day_plan': {
    [key: string]: {
      breakfast: string[]
      lunch: string[]
      dinner: string[]
    }
  }
  top_ranked_foods: Array<{ food_name: string; score: number }>
  reasoning_summary: string
}

interface HealthProfile {
  prakriti: {
    dosha_type: string
  }
  vikriti: {
    dominant: string
  }
  agni: {
    name: string
    type: string
  }
}

interface WeeklyPlanDay {
  day: number
  date: string
  weekday: string
  dateNum: number
  meals: {
    breakfast: string[]
    lunch: string[]
    dinner: string[]
  }
  recommendedFoods: Array<{ food_name: string; score: number }>
  calories: {
    target: number
    consumed: number
  }
  completed: boolean
}

export function DietPlanTimeline() {
  const [dietPlan, setDietPlan] = useState<DietPlan | null>(null)
  const [healthProfile, setHealthProfile] = useState<HealthProfile | null>(null)
  const [currentDay, setCurrentDay] = useState(1)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [weeklyPlan, setWeeklyPlan] = useState<WeeklyPlanDay[]>([])

  useEffect(() => {
    fetchDietPlan()
  }, [])

  // Generate weekly plan from diet plan data
  useEffect(() => {
    if (dietPlan) {
      const today = new Date()
      const daysData: WeeklyPlanDay[] = []

      for (let i = 0; i < 7; i++) {
        const currentDate = new Date(today)
        currentDate.setDate(today.getDate() + i)
        
        const dayKey = `day_${i + 1}`
        const dayPlan = dietPlan['7_day_plan'][dayKey]

        daysData.push({
          day: i + 1,
          date: currentDate.toISOString().split('T')[0],
          weekday: currentDate.toLocaleDateString('en-US', { weekday: 'short' }),
          dateNum: currentDate.getDate(),
          meals: {
            breakfast: dayPlan?.breakfast || [],
            lunch: dayPlan?.lunch || [],
            dinner: dayPlan?.dinner || []
          },
          recommendedFoods: dietPlan.top_ranked_foods || [],
          calories: {
            target: 2520,
            consumed: 0
          },
          completed: i === 0 // Mark first day as completed for demo
        })
      }

      setWeeklyPlan(daysData)
    }
  }, [dietPlan])

  const fetchDietPlan = async () => {
    try {
      setLoading(true)
      setError(null)
      
      const API_BASE_URL = 'http://localhost:5000'
      const token = localStorage.getItem('nutrifusion_token')
      console.log('🔑 Token found:', !!token)
      
      if (!token) {
        setError('Please login to view your personalized diet plan')
        setLoading(false)
        return
      }

      console.log('📡 Fetching diet plan from API...')
      const response = await fetch(`${API_BASE_URL}/api/assessments/diet-plan/current`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })

      console.log('📥 Response status:', response.status)

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        console.error('❌ API Error:', errorData)
        
        if (response.status === 404) {
          setError('No assessment found. Please complete your Ayurvedic assessment to get a personalized diet plan.')
        } else {
          setError(errorData.error || 'Failed to fetch diet plan')
        }
        setLoading(false)
        return
      }

      const data = await response.json()
      console.log('✅ Diet plan data received:', data)
      console.log('📋 Full dietPlan object:', JSON.stringify(data.dietPlan, null, 2))
      console.log('📅 Day 1 structure:', data.dietPlan?.['7_day_plan']?.day_1)
      
      if (data.success) {
        // Check if diet plan has foods - if not, try to regenerate
        const day1 = data.dietPlan?.['7_day_plan']?.day_1;
        const hasNoFoods = !day1 || 
          (day1.breakfast?.length === 0 && day1.lunch?.length === 0 && day1.dinner?.length === 0);
        
        if (hasNoFoods) {
          console.log('⚠️ Diet plan has no foods, attempting regeneration...');
          // Retry with regenerate parameter
          const retryResponse = await fetch(`${API_BASE_URL}/api/assessments/diet-plan/current?regenerate=true`, {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          });
          
          if (retryResponse.ok) {
            const retryData = await retryResponse.json();
            console.log('🔄 Regenerated diet plan:', retryData);
            setDietPlan(retryData.dietPlan);
            setHealthProfile(retryData.healthProfile);
          } else {
            setDietPlan(data.dietPlan);
            setHealthProfile(data.healthProfile);
          }
        } else {
          setDietPlan(data.dietPlan);
          setHealthProfile(data.healthProfile);
        }
        console.log('🎉 Diet plan loaded successfully!')
      } else {
        setError(data.error || 'Failed to load diet plan')
      }
    } catch (err) {
      console.error('💥 Error fetching diet plan:', err)
      setError('Failed to load diet plan. Please try again later.')
    } finally {
      setLoading(false)
    }
  }

  const getMealIcon = (mealType: string) => {
    switch (mealType) {
      case 'breakfast': return '🌅'
      case 'lunch': return '🍽️'
      case 'dinner': return '🌙'
      default: return '🍴'
    }
  }

  const getMealTime = (mealType: string) => {
    switch (mealType) {
      case 'breakfast': return '7:00 AM - 8:00 AM'
      case 'lunch': return '12:00 PM - 1:00 PM'
      case 'dinner': return '6:00 PM - 7:00 PM'
      default: return ''
    }
  }

  if (loading) {
    return (
      <section className="mb-8">
        <h2 className="text-2xl font-bold text-slate-800 mb-6 flex items-center gap-2">
          <Clock className="w-6 h-6 text-blue-600" />
          Your Personalized Diet Plan
        </h2>
        <div className="bg-white rounded-2xl p-12 shadow-md text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-slate-600">Loading your personalized diet plan...</p>
        </div>
      </section>
    )
  }

  if (error) {
    return (
      <section className="mb-8">
        <h2 className="text-2xl font-bold text-slate-800 mb-6 flex items-center gap-2">
          <Clock className="w-6 h-6 text-blue-600" />
          Your Personalized Diet Plan
        </h2>
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-8 text-center">
          <AlertCircle className="w-12 h-12 text-amber-600 mx-auto mb-4" />
          <p className="text-amber-800 mb-4">{error}</p>
          {error.includes('assessment') && (
            <Button 
              onClick={() => window.location.href = '/assessment'}
              className="bg-gradient-to-r from-blue-600 to-teal-600 hover:from-blue-700 hover:to-teal-700 text-white"
            >
              Take Assessment
            </Button>
          )}
        </div>
      </section>
    )
  }

  if (!dietPlan) {
    return null
  }

  const currentDayPlan = dietPlan['7_day_plan'][`day_${currentDay}`]

  const meals = [
    {
      type: 'breakfast',
      name: 'Breakfast',
      foods: currentDayPlan.breakfast,
      time: getMealTime('breakfast'),
      icon: getMealIcon('breakfast'),
      explanation: 'Light and easy to digest, perfect way to start your day'
    },
    {
      type: 'lunch',
      name: 'Lunch',
      foods: currentDayPlan.lunch,
      time: getMealTime('lunch'),
      icon: getMealIcon('lunch'),
      explanation: 'Main meal of the day when digestive fire is strongest'
    },
    {
      type: 'dinner',
      name: 'Dinner',
      foods: currentDayPlan.dinner,
      time: getMealTime('dinner'),
      icon: getMealIcon('dinner'),
      explanation: 'Light evening meal to support restful sleep'
    }
  ]

  return (
    <section className="mb-8">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
          <Clock className="w-6 h-6 text-blue-600" />
          Your Personalized Diet Plan
        </h2>
      </div>

      {/* Horizontal Day Selector */}
      {weeklyPlan.length > 0 && (
        <DaySelector
          days={weeklyPlan}
          selectedDay={currentDay}
          onDaySelect={setCurrentDay}
        />
      )}

      {/* Health Profile Summary */}
      {healthProfile && (
        <div className="mb-6 p-4 bg-gradient-to-r from-blue-50 to-teal-50 rounded-xl border border-blue-200">
          <div className="flex items-center gap-4 flex-wrap">
            <div className="flex items-center gap-2">
              <span className="text-sm font-semibold text-slate-600">Constitution:</span>
              <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-semibold">
                {healthProfile.prakriti.dosha_type}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-semibold text-slate-600">Current State:</span>
              <span className="px-3 py-1 bg-amber-100 text-amber-700 rounded-full text-sm font-semibold">
                {healthProfile.vikriti.dominant} elevated
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-semibold text-slate-600">Digestive Fire:</span>
              <span className="px-3 py-1 bg-emerald-100 text-emerald-700 rounded-full text-sm font-semibold">
                {healthProfile.agni.name}
              </span>
            </div>
          </div>
        </div>
      )}

      <div className="relative">
        {/* Timeline Line */}
        <div className="hidden md:block absolute left-8 top-0 bottom-0 w-1 bg-gradient-to-b from-blue-300 to-emerald-300"></div>

        {/* Meal Cards with Smooth Transitions */}
        <AnimatePresence mode="wait">
          <motion.div
            key={currentDay}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
            className="space-y-6"
          >
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
                  </div>

                  <div className="mb-4">
                    <div className="flex flex-wrap gap-2 mb-3">
                      {meal.foods.map((food, foodIdx) => (
                        <span 
                          key={foodIdx}
                          className="px-3 py-1 bg-slate-100 text-slate-700 rounded-full text-sm font-medium"
                        >
                          {food}
                        </span>
                      ))}
                    </div>
                    <p className="text-sm text-slate-600 flex items-start gap-2">
                      <Leaf className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
                      <span>{meal.explanation}</span>
                    </p>
                  </div>

                  <div className="flex gap-4 text-xs text-slate-500">
                    <span className="flex items-center gap-1">
                      <Zap className="w-3 h-3" />
                      Personalized for you
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Reasoning Summary */}
      {dietPlan.reasoning_summary && (
        <div className="mt-8 p-6 bg-gradient-to-r from-emerald-50 to-blue-50 rounded-xl border border-emerald-200">
          <h3 className="font-semibold text-emerald-800 mb-2 flex items-center gap-2">
            <Leaf className="w-5 h-5" />
            Why This Plan Works For You
          </h3>
          <p className="text-sm text-slate-700 leading-relaxed">
            {dietPlan.reasoning_summary}
          </p>
        </div>
      )}

      {/* Top Ranked Foods */}
      {dietPlan.top_ranked_foods && dietPlan.top_ranked_foods.length > 0 && (
        <div className="mt-6 p-6 bg-white rounded-xl border border-slate-200">
          <h3 className="font-semibold text-slate-800 mb-4">Top Recommended Foods</h3>
          <div className="flex flex-wrap gap-2">
            {dietPlan.top_ranked_foods.slice(0, 10).map((food, idx) => (
              <span 
                key={idx}
                className="px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-sm font-medium"
                title={`Score: ${food.score}`}
              >
                {food.food_name}
              </span>
            ))}
          </div>
        </div>
      )}
    </section>
  )
}
