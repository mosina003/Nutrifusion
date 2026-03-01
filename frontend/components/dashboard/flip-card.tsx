'use client'

import React, { useState } from 'react'
import { motion } from 'framer-motion'

interface FlipCardProps {
  front: React.ReactNode
  back: React.ReactNode
  className?: string
}

export function FlipCard({ front, back, className = '' }: FlipCardProps) {
  const [isFlipped, setIsFlipped] = useState(false)

  return (
    <div 
      className={`relative h-full cursor-pointer ${className}`}
      style={{ 
        perspective: '1200px',
        transformStyle: 'preserve-3d'
      }}
      onClick={() => setIsFlipped(!isFlipped)}
    >
      {/* Outer wrapper with overflow clipping */}
      <div 
        className="relative w-full h-full overflow-hidden rounded-3xl"
        style={{ 
          transformStyle: 'preserve-3d',
          isolation: 'isolate'
        }}
      >
        <motion.div
          className="relative w-full h-full"
          initial={false}
          animate={{ rotateY: isFlipped ? 180 : 0 }}
          transition={{ 
            duration: 0.6, 
            ease: [0.4, 0, 0.2, 1],
            type: 'tween'
          }}
          style={{ 
            transformStyle: 'preserve-3d',
            transform: 'translateZ(0)',
            willChange: 'transform'
          }}
        >
          {/* Front Side */}
          <div
            className="absolute inset-0 w-full h-full overflow-hidden rounded-3xl"
            style={{
              backfaceVisibility: 'hidden',
              WebkitBackfaceVisibility: 'hidden',
              transform: 'rotateY(0deg) translateZ(0)',
              transformStyle: 'preserve-3d'
            }}
          >
            <div className="w-full h-full overflow-hidden rounded-3xl">
              {front}
            </div>
          </div>

          {/* Back Side */}
          <div
            className="absolute inset-0 w-full h-full overflow-hidden rounded-3xl"
            style={{
              backfaceVisibility: 'hidden',
              WebkitBackfaceVisibility: 'hidden',
              transform: 'rotateY(180deg) translateZ(0)',
              transformStyle: 'preserve-3d'
            }}
          >
            <div className="w-full h-full overflow-hidden rounded-3xl">
              {back}
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
