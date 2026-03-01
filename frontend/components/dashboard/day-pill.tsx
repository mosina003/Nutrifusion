'use client'

import { motion } from 'framer-motion'
import { Check } from 'lucide-react'

interface DayPillProps {
  day: string // Short weekday (e.g., "Thu")
  date: number // Date number (e.g., 26)
  isActive: boolean
  isCompleted: boolean
  onClick: () => void
}

export function DayPill({ day, date, isActive, isCompleted, onClick }: DayPillProps) {
  return (
    <motion.button
      onClick={onClick}
      className={`
        relative flex-shrink-0 flex flex-col items-center justify-center
        w-16 h-20 rounded-2xl border-2 transition-all duration-300
        ${isActive 
          ? 'bg-gradient-to-br from-blue-600 to-teal-600 border-blue-600 text-white shadow-lg scale-105' 
          : isCompleted
          ? 'bg-gradient-to-br from-emerald-500 to-teal-500 border-emerald-500 text-white shadow-md'
          : 'bg-white border-slate-200 text-slate-700 hover:border-blue-300 hover:shadow-md'
        }
      `}
      whileHover={{ scale: isActive ? 1.05 : 1.08 }}
      whileTap={{ scale: 0.95 }}
    >
      {/* Completed indicator */}
      {isCompleted && !isActive && (
        <div className="absolute -top-1 -right-1 w-5 h-5 bg-emerald-600 rounded-full flex items-center justify-center border-2 border-white shadow-md">
          <Check className="w-3 h-3 text-white" strokeWidth={3} />
        </div>
      )}

      {/* Weekday */}
      <span className={`text-xs font-semibold mb-1 ${
        isActive || isCompleted ? 'text-blue-100' : 'text-slate-500'
      }`}>
        {day}
      </span>

      {/* Date */}
      <span className={`text-xl font-bold ${
        isActive || isCompleted ? 'text-white' : 'text-slate-800'
      }`}>
        {date}
      </span>
    </motion.button>
  )
}
