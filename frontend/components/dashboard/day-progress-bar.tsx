'use client'

import { motion } from 'framer-motion'
import { CheckCircle2 } from 'lucide-react'

interface DayProgressBarProps {
  completedMeals: number
  totalMeals: number
  dayCompleted: boolean
}

export function DayProgressBar({ completedMeals, totalMeals, dayCompleted }: DayProgressBarProps) {
  const progress = (completedMeals / totalMeals) * 100

  return (
    <div className="mb-6 p-4 bg-gradient-to-r from-blue-50 to-emerald-50 rounded-xl border border-blue-200">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <h3 className="font-semibold text-slate-700">Daily Progress</h3>
          {dayCompleted && (
            <motion.div
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ type: 'spring', stiffness: 200, damping: 15 }}
              className="flex items-center gap-1 px-3 py-1 bg-emerald-500 text-white rounded-full text-sm font-semibold"
            >
              <CheckCircle2 className="w-4 h-4" />
              Day Completed ✅
            </motion.div>
          )}
        </div>
        <span className="text-sm font-semibold text-slate-600">
          {completedMeals}/{totalMeals} meals
        </span>
      </div>

      {/* Progress Bar */}
      <div className="w-full h-3 bg-slate-200 rounded-full overflow-hidden">
        <motion.div
          className="h-full bg-gradient-to-r from-blue-500 to-emerald-500 rounded-full"
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
        />
      </div>

      <div className="mt-2 text-xs text-slate-600 text-center">
        {progress === 100 && !dayCompleted 
          ? 'All meals completed!' 
          : `${Math.round(progress)}% complete`
        }
      </div>
    </div>
  )
}
