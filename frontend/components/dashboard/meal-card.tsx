'use client'

import { Leaf, Zap, Check, RefreshCw } from 'lucide-react'
import { motion } from 'framer-motion'
import { useState } from 'react'

interface MealCardProps {
  mealType: string
  mealName: string
  foods: string[]
  time: string
  icon: string
  explanation: string
  isCompleted: boolean
  onToggleCompletion: () => void
  onReplaceMeal: () => Promise<void>
}

export function MealCard({
  mealType,
  mealName,
  foods,
  time,
  icon,
  explanation,
  isCompleted,
  onToggleCompletion,
  onReplaceMeal
}: MealCardProps) {
  const [isReplacing, setIsReplacing] = useState(false)

  const handleReplace = async () => {
    setIsReplacing(true)
    try {
      await onReplaceMeal()
    } finally {
      setIsReplacing(false)
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={`bg-white rounded-2xl p-6 shadow-md hover:shadow-lg transition-all ${
        isCompleted ? 'opacity-75' : ''
      }`}
    >
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3 flex-1">
          <span className="text-4xl">{icon}</span>
          <div className="flex-1">
            <div className="text-sm font-semibold text-slate-500">{time}</div>
            <h3 className="text-xl font-bold text-slate-800">{mealName}</h3>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2 ml-4">
          {/* Replace Button */}
          <button
            onClick={handleReplace}
            disabled={isReplacing}
            className="flex-shrink-0 w-8 h-8 rounded-lg border-2 border-blue-300 
              flex items-center justify-center transition-all
              hover:bg-blue-50 hover:border-blue-400 disabled:opacity-50"
            title="Replace this meal"
          >
            <motion.div
              animate={isReplacing ? { rotate: 360 } : { rotate: 0 }}
              transition={isReplacing ? { duration: 1, repeat: Infinity, ease: 'linear' } : {}}
            >
              <RefreshCw className="w-4 h-4 text-blue-600" />
            </motion.div>
          </button>

          {/* Checkbox */}
          <button
            onClick={onToggleCompletion}
            className={`
              flex-shrink-0 w-8 h-8 rounded-lg border-2 
              flex items-center justify-center transition-all
              ${isCompleted 
                ? 'bg-emerald-500 border-emerald-500' 
                : 'border-slate-300 hover:border-emerald-400 hover:bg-emerald-50'
              }
            `}
            aria-label={`Mark ${mealName} as ${isCompleted ? 'incomplete' : 'complete'}`}
          >
            {isCompleted && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', stiffness: 500, damping: 30 }}
              >
                <Check className="w-5 h-5 text-white" strokeWidth={3} />
              </motion.div>
            )}
          </button>
        </div>
      </div>

      <div className="mb-4">
        <div className="flex flex-wrap gap-2 mb-3">
          {foods.map((food, idx) => (
            <span
              key={idx}
              className={`px-3 py-1 rounded-full text-sm font-medium ${
                isCompleted 
                  ? 'bg-slate-200 text-slate-600 line-through' 
                  : 'bg-slate-100 text-slate-700'
              }`}
            >
              {food}
            </span>
          ))}
        </div>
        <p className="text-sm text-slate-600 flex items-start gap-2">
          <Leaf className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
          <span>{explanation}</span>
        </p>
      </div>

      <div className="flex gap-4 text-xs text-slate-500">
        <span className="flex items-center gap-1">
          <Zap className="w-3 h-3" />
          Personalized for you
        </span>
      </div>
    </motion.div>
  )
}
