'use client'

import { motion } from 'framer-motion'

interface ConstitutionBalance {
  framework: 'ayurveda' | 'unani' | 'tcm'
  // Ayurveda
  vata?: number
  pitta?: number
  kapha?: number
  // Unani
  primary_mizaj?: string
  secondary_mizaj?: string | null
  dominant_humor?: string
  thermal_tendency?: string
  moisture_tendency?: string
  // TCM
  primary_pattern?: string
  secondary_pattern?: string | null
  cold_heat?: string
  severity?: string
  // Common
  dominant: string
}

interface ConstitutionMeterProps {
  balance: ConstitutionBalance
}

export function ConstitutionMeter({ balance }: ConstitutionMeterProps) {
  // Ayurveda display
  if (balance.framework === 'ayurveda') {
    const doshas = [
      { name: 'Vata', value: balance.vata || 0, color: 'from-purple-500 to-purple-600' },
      { name: 'Pitta', value: balance.pitta || 0, color: 'from-orange-500 to-orange-600' },
      { name: 'Kapha', value: balance.kapha || 0, color: 'from-green-500 to-green-600' }
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

        <div className="mt-2.5 p-2 bg-white/10 rounded-lg border border-white/20 w-full">
          <p className="text-[10px] text-white/90 leading-relaxed">
            {(balance.pitta || 0) > (balance.vata || 0) && (balance.pitta || 0) > (balance.kapha || 0)
              ? '🔥 Pitta dominant - Focus on cooling foods'
              : (balance.vata || 0) > (balance.pitta || 0) && (balance.vata || 0) > (balance.kapha || 0)
              ? '💨 Vata dominant - Choose grounding foods'
              : '🌿 Kapha dominant - Favor light, warm meals'}
          </p>
        </div>
      </div>
    )
  }

  // Unani display
  if (balance.framework === 'unani') {
    const qualities = [
      { name: 'Primary Mizaj', value: balance.primary_mizaj || 'Unknown' },
      { name: 'Thermal', value: balance.thermal_tendency || 'Balanced' },
      { name: 'Moisture', value: balance.moisture_tendency || 'Balanced' }
    ]

    return (
      <div className="w-full max-w-full space-y-2 overflow-hidden">
        {qualities.map((quality, index) => (
          <motion.div
            key={quality.name}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1, duration: 0.5 }}
            className="space-y-1 w-full"
          >
            <div className="flex items-center justify-between text-sm">
              <span className="font-semibold text-white/80">{quality.name}</span>
              <span className="text-white font-bold">{quality.value}</span>
            </div>
          </motion.div>
        ))}

        {balance.secondary_mizaj && (
          <div className="text-xs text-white/80 mt-1">
            Secondary: {balance.secondary_mizaj}
          </div>
        )}

        <div className="mt-2.5 p-2 bg-white/10 rounded-lg border border-white/20 w-full">
          <p className="text-[10px] text-white/90 leading-relaxed">
            {balance.thermal_tendency === 'Hot'
              ? '🔥 Hot temperament - Focus on cooling foods'
              : balance.thermal_tendency === 'Cold'
              ? '❄️ Cold temperament - Choose warming foods'
              : '⚖️ Balanced temperament - Maintain harmony'}
          </p>
        </div>
      </div>
    )
  }

  // TCM display
  if (balance.framework === 'tcm') {
    const patterns = [
      { name: 'Primary Pattern', value: balance.primary_pattern || 'Unknown' },
      { name: 'Temperature', value: balance.cold_heat || 'Balanced' },
      { name: 'Severity', value: balance.severity || 'Mild' }
    ]

    return (
      <div className="w-full max-w-full space-y-2 overflow-hidden">
        {patterns.map((pattern, index) => (
          <motion.div
            key={pattern.name}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1, duration: 0.5 }}
            className="space-y-1 w-full"
          >
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-white">{pattern.name}</span>
              <span className="text-white/90 font-medium">{pattern.value}</span>
            </div>
          </motion.div>
        ))}

        {balance.secondary_pattern && (
          <div className="text-xs text-white/80 mt-1">
            Secondary: {balance.secondary_pattern}
          </div>
        )}

        <div className="mt-2.5 p-2 bg-white/10 rounded-lg border border-white/20 w-full">
          <p className="text-[10px] text-white/90 leading-relaxed">
            {balance.cold_heat === 'Cold'
              ? '❄️ Cold pattern - Choose warming foods'
              : balance.cold_heat === 'Heat'
              ? '🔥 Heat pattern - Focus on cooling foods'
              : '⚖️ Balanced pattern - Maintain harmony'}
          </p>
        </div>
      </div>
    )
  }

  return <div className="text-white text-center">Unknown framework</div>
}
