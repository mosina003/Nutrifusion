'use client'

import React, { useEffect, useState } from "react"
import { Heart, AlertCircle, TrendingUp, Flame } from 'lucide-react'
import { getToken } from '@/lib/api'
import { CalorieRing } from './calorie-ring'
import { ConstitutionMeter } from './constitution-meter'
import { FlipCard } from './flip-card'

interface SummaryCardProps {
  icon: React.ReactNode
  value: string | number
  label: string
  trend?: string
  bgColor: string
  children?: React.ReactNode
}

function SummaryCard({ icon, value, label, trend, bgColor, children }: SummaryCardProps) {
  return (
    <div className={`${bgColor} rounded-3xl p-6 shadow-md hover:shadow-lg transition-shadow h-full overflow-hidden relative`}>
      <div className="flex items-start justify-between mb-4">
        <div className="text-3xl text-white opacity-80">{icon}</div>
        {trend && <span className="text-sm font-semibold text-green-600 bg-green-100 px-3 py-1 rounded-full">{trend}</span>}
      </div>
      {children ? (
        <div className="w-full overflow-hidden">{children}</div>
      ) : (
        <>
          <div className="text-3xl font-bold text-white mb-2">{value}</div>
          <div className="text-sm text-white/80">{label}</div>
        </>
      )}
    </div>
  )
}

export function SummaryCards() {
  const [summaryData, setSummaryData] = useState<any>(null)
  const [doshaBalance, setDoshaBalance] = useState<any>(null)
  const [calorieData, setCalorieData] = useState({ consumed: 0, target: 2520 })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchDashboardData = async () => {
      const token = getToken()
      if (!token) return
      
      try {
        // Fetch dashboard summary
        const response = await fetch('http://localhost:5000/api/dashboard', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        })
        const data = await response.json()
        console.log('📊 Dashboard API response:', data)
        if (data.success) {
          console.log('📊 Summary Cards Data:', data.data.summaryCards)
          setSummaryData(data.data.summaryCards)
        }
        
        // Fetch dosha balance
        const doshaResponse = await fetch('http://localhost:5000/api/dashboard/dosha-balance', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        })
        if (doshaResponse.ok) {
          const doshaData = await doshaResponse.json()
          if (doshaData.success) {
            setDoshaBalance(doshaData.data)
          }
        }
        
        // Fetch meal completions for calorie calculation
        const today = new Date().toISOString().split('T')[0]
        const completionResponse = await fetch(`http://localhost:5000/api/meal-completions?date=${today}`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        })
        
        if (completionResponse.ok) {
          const completionData = await completionResponse.json()
          
          // Calculate consumed calories based on completed meals
          // Average calories: breakfast=400, lunch=800, dinner=600
          const calorieMap: { [key: string]: number } = {
            breakfast: 400,
            lunch: 800,
            dinner: 600
          }
          
          const completions = completionData.data || []
          const consumed = completions.reduce((total: number, completion: any) => {
            const meals = completion.completedMeals || []
            return total + meals.reduce((mealTotal: number, meal: any) => {
              const mealType = meal.mealType || meal
              return mealTotal + (calorieMap[typeof mealType === 'string' ? mealType.toLowerCase() : ''] || 0)
            }, 0)
          }, 0)
          
          setCalorieData({
            consumed,
            target: data.data?.summaryCards?.calories?.target || 2520
          })
        }
      } catch (error) {
        console.error('Error fetching dashboard data:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchDashboardData()
  }, [])

  if (loading || !summaryData) {
    return (
      <section className="mb-8">
        <h2 className="text-2xl font-bold text-slate-800 mb-6">Today's Overview</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="bg-gray-200 rounded-3xl p-6 h-32 animate-pulse" />
          ))}
        </div>
      </section>
    )
  }

  // Defensive check: ensure all required data exists
  if (!summaryData.dosha || !summaryData.conditions || !summaryData.calories || !summaryData.status) {
    console.error('❌ Missing summary data:', {
      hasDosha: !!summaryData.dosha,
      hasConditions: !!summaryData.conditions,
      hasCalories: !!summaryData.calories,
      hasStatus: !!summaryData.status
    })
    return (
      <section className="mb-8">
        <h2 className="text-2xl font-bold text-slate-800 mb-6">Today's Overview</h2>
        <p className="text-red-500">Error loading dashboard cards. Please refresh the page.</p>
      </section>
    )
  }

  console.log('✅ Rendering cards with data:', summaryData)

  // Define static color schemes for each card to ensure Tailwind includes them
  const cardColors = {
    dosha: 'bg-gradient-to-br from-orange-400 to-orange-500',
    conditions: 'bg-gradient-to-br from-red-400 to-red-500',
    calories: 'bg-gradient-to-br from-blue-400 to-blue-500',
    status: 'bg-gradient-to-br from-green-400 to-green-500'
  }

  return (
    <section className="mb-8">
      <h2 className="text-2xl font-bold text-slate-800 mb-6">Today's Overview</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Dosha Card - Flippable */}
        <FlipCard
          front={
            <SummaryCard
              icon={<Heart className="w-8 h-8" />}
              value={summaryData.dosha?.value || 'Unknown'}
              label={summaryData.dosha?.label || 'Dominant Dosha'}
              trend={summaryData.dosha?.trend}
              bgColor={cardColors.dosha}
            />
          }
          back={
            <div className={`${cardColors.dosha} rounded-3xl p-6 shadow-md h-full flex flex-col justify-center overflow-hidden`}>
              {doshaBalance ? (
                <div className="w-full">
                  <div className="text-xl font-bold text-white mb-4 text-center">{doshaBalance.dominant}</div>
                  <ConstitutionMeter balance={doshaBalance} />
                  <div className="text-xs text-white/70 mt-3 text-center">Click to flip back</div>
                </div>
              ) : (
                <div className="text-white text-center">Loading balance data...</div>
              )}
            </div>
          }
        />
        
        {/* Conditions Card - Static */}
        <SummaryCard
          icon={<AlertCircle className="w-8 h-8" />}
          value={summaryData.conditions?.value ?? 0}
          label={summaryData.conditions?.label || 'Chronic Conditions'}
          bgColor={cardColors.conditions}
        />
        
        {/* Calories Card - Flippable */}
        <FlipCard
          front={
            <SummaryCard
              icon={<Flame className="w-8 h-8" />}
              value={`${calorieData.consumed} cal`}
              label={`Daily Target vs ${calorieData.consumed} consumed`}
              bgColor={cardColors.calories}
            />
          }
          back={
            <div className={`${cardColors.calories} rounded-3xl p-6 shadow-md h-full flex flex-col items-center justify-center overflow-hidden`}>
              <CalorieRing 
                consumed={calorieData.consumed} 
                target={calorieData.target} 
              />
              <div className="text-xs text-white/70 mt-3 text-center">Click to flip back</div>
            </div>
          }
        />
        
        {/* Status Card - Static */}
        <SummaryCard
          icon={<TrendingUp className="w-8 h-8" />}
          value={summaryData.status?.value || 'N/A'}
          label={summaryData.status?.label || 'Status'}
          trend={summaryData.status?.trend}
          bgColor={cardColors.status}
        />
      </div>
    </section>
  )
}
