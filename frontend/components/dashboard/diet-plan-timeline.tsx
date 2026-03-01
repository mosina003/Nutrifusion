'use client'

import { Clock, Leaf, AlertCircle } from 'lucide-react'
import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { DaySelector } from './day-selector'
import { StatusChips } from './status-chips'
import { DayProgressBar } from './day-progress-bar'
import { MealCard } from './meal-card'
import { RegenerateButton } from './regenerate-button'
import { motion, AnimatePresence } from 'framer-motion'
import { toast } from 'sonner'

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

// Ayurveda health profile
interface AyurvedaHealthProfile {
  prakriti: { dosha_type: string }
  vikriti: { dominant: string }
  agni: { name: string; type: string }
}

// Unani health profile  
interface UnaniHealthProfile {
  primary_mizaj: string
  dominant_humor: string
  digestive_strength: string
}

// TCM health profile
interface TCMHealthProfile {
  primary_pattern: string
  secondary_pattern?: string
  cold_heat: string
}

type HealthProfile = AyurvedaHealthProfile | UnaniHealthProfile | TCMHealthProfile

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
  completed: boolean
}

interface MealCompletion {
  date: string
  day: number
  completedMeals: Array<{ mealType: string; completedAt: Date }>
  dayCompleted: boolean
}

const API_BASE_URL = 'http://localhost:5000'

export function DietPlanTimeline() {
  const [dietPlan, setDietPlan] = useState<DietPlan | null>(null)
  const [healthProfile, setHealthProfile] = useState<HealthProfile | null>(null)
  const [framework, setFramework] = useState<string>('ayurveda')
  const [currentDay, setCurrentDay] = useState(1)
  const [loading, setLoading] = useState(true)
  const [regenerating, setRegenerating] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [weeklyPlan, setWeeklyPlan] = useState<WeeklyPlanDay[]>([])
  const [completions, setCompletions] = useState<Map<string, MealCompletion>>(new Map())

  useEffect(() => {
    fetchDietPlan()
    fetchMealCompletions()
  }, [])

  // Generate weekly plan from diet plan data
  useEffect(() => {
    if (dietPlan) {
      generateWeeklyPlan()
    }
  }, [dietPlan, completions])

  const generateWeeklyPlan = () => {
    const today = new Date()
    const daysData: WeeklyPlanDay[] = []

    for (let i = 0; i < 7; i++) {
      const currentDate = new Date(today)
      currentDate.setDate(today.getDate() + i)
      const dateString = currentDate.toISOString().split('T')[0]

      const dayKey = `day_${i + 1}`
      const dayPlan = dietPlan!['7_day_plan'][dayKey]
      const completion = completions.get(dateString)

      daysData.push({
        day: i + 1,
        date: dateString,
        weekday: currentDate.toLocaleDateString('en-US', { weekday: 'short' }),
        dateNum: currentDate.getDate(),
        meals: {
          breakfast: dayPlan?.breakfast || [],
          lunch: dayPlan?.lunch || [],
          dinner: dayPlan?.dinner || []
        },
        completed: completion?.dayCompleted || false
      })
    }

    setWeeklyPlan(daysData)
  }

  const fetchDietPlan = async () => {
    try {
      setLoading(true)
      setError(null)

      const token = localStorage.getItem('nutrifusion_token')
      if (!token) {
        setError('Please login to view your personalized diet plan')
        setLoading(false)
        return
      }

      const response = await fetch(`${API_BASE_URL}/api/assessments/diet-plan/current`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        if (response.status === 404) {
          setError('No assessment found. Please complete your assessment to get a personalized diet plan.')
        } else {
          setError(errorData.error || 'Failed to fetch diet plan')
        }
        setLoading(false)
        return
      }

      const data = await response.json()
      console.log('📊 Diet Plan API Response:', data)
      if (data.success) {
        console.log('✅ Diet Plan Data:', data.dietPlan)
        console.log('✅ 7 Day Plan:', data.dietPlan?.['7_day_plan'])
        console.log('✅ Framework:', data.framework)
        setDietPlan(data.dietPlan)
        setHealthProfile(data.healthProfile)
        setFramework(data.framework || 'ayurveda')
      } else {
        setError(data.error || 'Failed to load diet plan')
      }
    } catch (err) {
      console.error('Error fetching diet plan:', err)
      setError('Failed to load diet plan. Please try again later.')
    } finally {
      setLoading(false)
    }
  }

  const fetchMealCompletions = async () => {
    try {
      const token = localStorage.getItem('nutrifusion_token')
      if (!token) return

      const response = await fetch(`${API_BASE_URL}/api/meal-completions`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })

      if (response.ok) {
        const data = await response.json()
        const completionMap = new Map()
        data.data.forEach((completion: MealCompletion) => {
          completionMap.set(completion.date, completion)
        })
        setCompletions(completionMap)
      }
    } catch (err) {
      console.error('Error fetching completions:', err)
    }
  }

  const toggleMealCompletion = async (mealType: string) => {
    const currentDayData = weeklyPlan[currentDay - 1]
    if (!currentDayData) return

    const token = localStorage.getItem('nutrifusion_token')
    if (!token) return

    // Optimistic update
    const updatedCompletions = new Map(completions)
    const existingCompletion = updatedCompletions.get(currentDayData.date) || {
      date: currentDayData.date,
      day: currentDay,
      completedMeals: [],
      dayCompleted: false
    }

    const mealIndex = existingCompletion.completedMeals.findIndex(
      m => m.mealType === mealType.toLowerCase()
    )

    if (mealIndex > -1) {
      existingCompletion.completedMeals.splice(mealIndex, 1)
    } else {
      existingCompletion.completedMeals.push({
        mealType: mealType.toLowerCase(),
        completedAt: new Date()
      })
    }

    existingCompletion.dayCompleted = existingCompletion.completedMeals.length === 3
    updatedCompletions.set(currentDayData.date, existingCompletion)
    setCompletions(updatedCompletions)

    // API call
    try {
      const response = await fetch(`${API_BASE_URL}/api/meal-completions/toggle`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          date: currentDayData.date,
          day: currentDay,
          mealType: mealType.toLowerCase(),
          dietPlanId: 'current'
        })
      })

      if (!response.ok) {
        // Revert optimistic update on error
        fetchMealCompletions()
        toast.error('Failed to update meal completion')
      } else {
        const data = await response.json()
        if (data.data.dayCompleted && !existingCompletion.dayCompleted) {
          toast.success('🎉 Day completed! Great job!')
        }
      }
    } catch (err) {
      console.error('Error toggling meal:', err)
      fetchMealCompletions()
      toast.error('Failed to update meal completion')
    }
  }

  const regeneratePlan = async () => {
    setRegenerating(true)
    const token = localStorage.getItem('nutrifusion_token')
    if (!token) return

    try {
      const response = await fetch(`${API_BASE_URL}/api/meal-completions/regenerate-plan`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })

      if (response.ok) {
        const data = await response.json()
        toast.success('Diet plan regenerated successfully!')
        await fetchDietPlan()
        await fetchMealCompletions()
        setCurrentDay(1)
      } else {
        const errorData = await response.json()
        toast.error(errorData.error || 'Failed to regenerate plan')
      }
    } catch (err) {
      console.error('Error regenerating plan:', err)
      toast.error('Failed to regenerate plan')
    } finally {
      setRegenerating(false)
    }
  }

  const replaceMeal = async (mealType: string) => {
    const token = localStorage.getItem('nutrifusion_token')
    if (!token) return

    try {
      const response = await fetch(`${API_BASE_URL}/api/meal-completions/replace-meal`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          day: currentDay,
          mealType: mealType.toLowerCase()
        })
      })

      if (response.ok) {
        const data = await response.json()
        
        // Optimistically update the UI
        if (dietPlan && data.data.newFoods) {
          const updatedPlan = { ...dietPlan }
          const dayKey = `day_${currentDay}`
          const mealKey = mealType.toLowerCase() as 'breakfast' | 'lunch' | 'dinner'
          
          if (updatedPlan['7_day_plan'][dayKey]) {
            updatedPlan['7_day_plan'][dayKey][mealKey] = data.data.newFoods
          }
          setDietPlan(updatedPlan)
          toast.success(`${mealType} replaced successfully!`)
        }
      } else {
        const errorData = await response.json()
        toast.error(errorData.error || 'Failed to replace meal')
      }
    } catch (err) {
      console.error('Error replacing meal:', err)
      toast.error('Failed to replace meal')
    }
  }

  const getCurrentDayCompletion = () => {
    const currentDayData = weeklyPlan[currentDay - 1]
    if (!currentDayData) return { completedMeals: 0, totalMeals: 3, dayCompleted: false }

    const completion = completions.get(currentDayData.date)
    return {
      completedMeals: completion?.completedMeals.length || 0,
      totalMeals: 3,
      dayCompleted: completion?.dayCompleted || false
    }
  }

  const isMealCompleted = (mealType: string) => {
    const currentDayData = weeklyPlan[currentDay - 1]
    if (!currentDayData) return false

    const completion = completions.get(currentDayData.date)
    return completion?.completedMeals.some(m => m.mealType === mealType.toLowerCase()) || false
  }

  const getMealIcon = (type: string) => {
    switch (type) {
      case 'breakfast': return '🌅'
      case 'lunch': return '🍽️'
      case 'dinner': return '🌙'
      default: return '🍴'
    }
  }

  const getMealTime = (type: string) => {
    switch (type) {
      case 'breakfast': return '7:00 AM - 8:00 AM'
      case 'lunch': return '12:00 PM - 1:00 PM'
      case 'dinner': return '6:00 PM - 7:00 PM'
      default: return ''
    }
  }

  const getMealExplanation = (type: string) => {
    switch (type) {
      case 'breakfast': return 'Light and easy to digest, perfect way to start your day'
      case 'lunch': return 'Main meal of the day when digestive fire is strongest'
      case 'dinner': return 'Light evening meal to support restful sleep'
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

  if (!dietPlan) return null

  const currentDayPlan = dietPlan['7_day_plan']?.[`day_${currentDay}`]
  
  // If current day plan is not available, return error
  if (!currentDayPlan) {
    console.error('❌ No diet plan found for day:', currentDay)
    console.log('Available days:', Object.keys(dietPlan['7_day_plan'] || {}))
    return (
      <section className="mb-8">
        <h2 className="text-2xl font-bold text-slate-800 mb-6 flex items-center gap-2">
          <Clock className="w-6 h-6 text-blue-600" />
          Your Personalized Diet Plan
        </h2>
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-8 text-center">
          <AlertCircle className="w-12 h-12 text-amber-600 mx-auto mb-4" />
          <p className="text-amber-800 mb-4">Diet plan data is incomplete. Please regenerate your plan.</p>
          <Button
            onClick={() => window.location.reload()}
            className="bg-gradient-to-r from-blue-600 to-teal-600 hover:from-blue-700 hover:to-teal-700 text-white"
          >
            Reload Page
          </Button>
        </div>
      </section>
    )
  }
  
  const { completedMeals, totalMeals, dayCompleted } = getCurrentDayCompletion()

  const meals = [
    {
      type: 'breakfast',
      name: 'Breakfast',
      foods: currentDayPlan.breakfast,
      time: getMealTime('breakfast'),
      icon: getMealIcon('breakfast'),
      explanation: getMealExplanation('breakfast')
    },
    {
      type: 'lunch',
      name: 'Lunch',
      foods: currentDayPlan.lunch,
      time: getMealTime('lunch'),
      icon: getMealIcon('lunch'),
      explanation: getMealExplanation('lunch')
    },
    {
      type: 'dinner',
      name: 'Dinner',
      foods: currentDayPlan.dinner,
      time: getMealTime('dinner'),
      icon: getMealIcon('dinner'),
      explanation: getMealExplanation('dinner')
    }
  ]

  return (
    <section className="mb-8">
      <div className="flex items-center justify-between mb-6 flex-wrap gap-4">
        <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
          <Clock className="w-6 h-6 text-blue-600" />
          Your Personalized Diet Plan
        </h2>
        <RegenerateButton onRegenerate={regeneratePlan} isLoading={regenerating} />
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
      {healthProfile && <StatusChips healthProfile={healthProfile} framework={framework} />}

      {/* Day Progress */}
      <DayProgressBar
        completedMeals={completedMeals}
        totalMeals={totalMeals}
        dayCompleted={dayCompleted}
      />

      {/* Timeline */}
      <div className="relative">
        <div className="hidden md:block absolute left-8 top-0 bottom-0 w-1 bg-gradient-to-b from-blue-300 to-emerald-300"></div>

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
                <div className="hidden md:block absolute left-0 w-16 pt-1.5">
                  <div className="relative flex items-center justify-center">
                    <div className="absolute w-4 h-4 bg-blue-600 rounded-full border-4 border-white shadow-md"></div>
                  </div>
                </div>

                <MealCard
                  mealType={meal.type}
                  mealName={meal.name}
                  foods={meal.foods}
                  time={meal.time}
                  icon={meal.icon}
                  explanation={meal.explanation}
                  isCompleted={isMealCompleted(meal.type)}
                  onToggleCompletion={() => toggleMealCompletion(meal.type)}
                  onReplaceMeal={() => replaceMeal(meal.type)}
                />
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
