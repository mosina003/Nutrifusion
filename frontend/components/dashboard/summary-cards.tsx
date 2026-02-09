'use client'

import React from "react"

import { Heart, AlertCircle, Flame, TrendingUp } from 'lucide-react'

interface SummaryCardProps {
  icon: React.ReactNode
  value: string | number
  label: string
  trend?: string
  bgColor: string
}

function SummaryCard({ icon, value, label, trend, bgColor }: SummaryCardProps) {
  return (
    <div className={`${bgColor} rounded-3xl p-6 shadow-md hover:shadow-lg transition-shadow h-full`}>
      <div className="flex items-start justify-between mb-4">
        <div className="text-3xl text-white opacity-80">{icon}</div>
        {trend && <span className="text-sm font-semibold text-green-600 bg-green-100 px-3 py-1 rounded-full">{trend}</span>}
      </div>
      <div className="text-3xl font-bold text-white mb-2">{value}</div>
      <div className="text-sm text-white/80">{label}</div>
    </div>
  )
}

export function SummaryCards() {
  return (
    <section className="mb-8">
      <h2 className="text-2xl font-bold text-slate-800 mb-6">Today's Overview</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <SummaryCard
          icon={<Heart className="w-8 h-8" />}
          value="Pitta"
          label="Dominant Dosha"
          trend="+15%"
          bgColor="bg-gradient-to-br from-orange-400 to-orange-500"
        />
        <SummaryCard
          icon={<AlertCircle className="w-8 h-8" />}
          value="2"
          label="Key Conditions"
          bgColor="bg-gradient-to-br from-red-400 to-red-500"
        />
        <SummaryCard
          icon={<Flame className="w-8 h-8" />}
          value="1,840 cal"
          label="Daily Target vs 420 consumed"
          bgColor="bg-gradient-to-br from-blue-400 to-blue-500"
        />
        <SummaryCard
          icon={<TrendingUp className="w-8 h-8" />}
          value="On Track"
          label="Today's Diet Status"
          trend="✓"
          bgColor="bg-gradient-to-br from-green-400 to-green-500"
        />
      </div>
    </section>
  )
}
