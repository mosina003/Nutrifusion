'use client'

import { motion } from 'framer-motion'

interface DoshaBalance {
  vata: number
  pitta: number
  kapha: number
}

interface DoshaMeterProps {
  balance: DoshaBalance
}

export function DoshaMeter({ balance }: DoshaMeterProps) {
  const doshas = [
    { name: 'Vata', value: balance.vata, color: 'from-purple-500 to-purple-600', bgColor: 'bg-purple-100' },
    { name: 'Pitta', value: balance.pitta, color: 'from-orange-500 to-orange-600', bgColor: 'bg-orange-100' },
    { name: 'Kapha', value: balance.kapha, color: 'from-green-500 to-green-600', bgColor: 'bg-green-100' }
  ]

  return (
    <div className="w-full max-w-full space-y-2 overflow-hidden">
      {doshas.map((dosha, index) => (
        <motion.div
          key={dosha.name}
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: index * 0.1, duration: 0.5 }}
          className="space-y-1 w-full"
        >
          <div className="flex items-center justify-between text-xs">
            <span className="font-semibold text-white">{dosha.name}</span>
            <span className="text-white/90 font-medium">{Math.round(dosha.value)}%</span>
          </div>
          
          {/* Progress Bar */}
          <div className="h-2 bg-white/20 rounded-full overflow-hidden w-full">
            <motion.div
              className={`h-full bg-gradient-to-r ${dosha.color} rounded-full`}
              initial={{ width: 0 }}
              animate={{ width: `${dosha.value}%` }}
              transition={{ duration: 1, delay: index * 0.1, ease: 'easeOut' }}
            />
          </div>
        </motion.div>
      ))}

      {/* Balance Interpretation */}
      <div className="mt-2.5 p-2 bg-white/10 rounded-lg border border-white/20 w-full">
        <p className="text-[10px] text-white/90 leading-relaxed">
          {balance.pitta > balance.vata && balance.pitta > balance.kapha
            ? '🔥 Pitta dominant - Focus on cooling foods'
            : balance.vata > balance.pitta && balance.vata > balance.kapha
            ? '💨 Vata dominant - Choose grounding foods'
            : '🌿 Kapha dominant - Favor light, warm meals'}
        </p>
      </div>
    </div>
  )
}
