'use client'

import { useRef, useEffect } from 'react'
import { DayPill } from './day-pill'

interface DayData {
  day: number
  date: string // ISO format "2026-02-26"
  weekday: string // Short weekday "Thu"
  dateNum: number // Date number 26
  completed: boolean
}

interface DaySelectorProps {
  days: DayData[]
  selectedDay: number
  onDaySelect: (dayIndex: number) => void
}

export function DaySelector({ days, selectedDay, onDaySelect }: DaySelectorProps) {
  const scrollContainerRef = useRef<HTMLDivElement>(null)

  // Auto-scroll to selected day
  useEffect(() => {
    if (scrollContainerRef.current) {
      const selectedElement = scrollContainerRef.current.querySelector(
        `[data-day="${selectedDay}"]`
      ) as HTMLElement
      
      if (selectedElement) {
        selectedElement.scrollIntoView({
          behavior: 'smooth',
          block: 'nearest',
          inline: 'center'
        })
      }
    }
  }, [selectedDay])

  return (
    <div className="mb-6">
      {/* Scrollable container */}
      <div 
        ref={scrollContainerRef}
        className="flex gap-3 overflow-x-auto pb-4 snap-x snap-mandatory scroll-smooth scrollbar-hide"
      >
        {days.map((dayData, index) => (
          <div 
            key={dayData.day}
            data-day={dayData.day}
            className="snap-center"
          >
            <DayPill
              day={dayData.weekday}
              date={dayData.dateNum}
              isActive={selectedDay === dayData.day}
              isCompleted={dayData.completed}
              onClick={() => onDaySelect(dayData.day)}
            />
          </div>
        ))}
      </div>
    </div>
  )
}
