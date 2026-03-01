'use client'

import { CircularProgressbar, buildStyles } from 'react-circular-progressbar'
import 'react-circular-progressbar/dist/styles.css'
import { motion } from 'framer-motion'

interface CalorieRingProps {
  consumed: number
  target: number
}

export function CalorieRing({ consumed, target }: CalorieRingProps) {
  const percentage = Math.min((consumed / target) * 100, 100)
  const remaining = Math.max(target - consumed, 0)

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5 }}
      className="relative w-full max-w-full overflow-hidden flex flex-col items-center"
    >
      <div className="w-32 h-32 relative">
        <CircularProgressbar
          value={percentage}
          text=""
          styles={buildStyles({
            pathColor: percentage >= 90 ? '#f97316' : percentage >= 50 ? '#3b82f6' : '#10b981',
            trailColor: 'rgba(255, 255, 255, 0.3)',
            pathTransitionDuration: 0.5,
          })}
        />
        
        {/* Center Content */}
        <div className="absolute inset-0 flex flex-col items-center justify-center text-white">
          <div className="text-2xl font-bold">{consumed}</div>
          <div className="text-[11px] opacity-80">of {target}</div>
          <div className="text-[11px] font-semibold mt-0.5">kcal</div>
        </div>
      </div>

      {/* Remaining Calories */}
      <div className="text-center mt-3 text-white/90 text-sm">
        <span className="font-semibold">{remaining} kcal</span> remaining
      </div>
    </motion.div>
  )
}
