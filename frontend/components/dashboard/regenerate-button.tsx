'use client'

import { RefreshCw } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { motion } from 'framer-motion'

interface RegenerateButtonProps {
  onRegenerate: () => void
  isLoading: boolean
}

export function RegenerateButton({ onRegenerate, isLoading }: RegenerateButtonProps) {
  return (
    <Button
      onClick={onRegenerate}
      disabled={isLoading}
      className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white"
    >
      <motion.div
        animate={isLoading ? { rotate: 360 } : { rotate: 0 }}
        transition={isLoading ? { duration: 1, repeat: Infinity, ease: 'linear' } : {}}
      >
        <RefreshCw className="w-4 h-4 mr-2" />
      </motion.div>
      {isLoading ? 'Regenerating...' : 'Regenerate Plan'}
    </Button>
  )
}
