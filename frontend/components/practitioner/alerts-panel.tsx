'use client'

import React from "react"

import {
  AlertTriangle,
  AlertCircle,
  TrendingDown,
  UtensilsCrossed,
  Clock,
  X,
} from 'lucide-react'
import { useState } from 'react'

interface Alert {
  id: number
  type: 'critical' | 'warning' | 'info'
  icon: React.ReactNode
  title: string
  patient: string
  description: string
  timestamp: string
}

export function AlertsPanel() {
  const [alerts, setAlerts] = useState<Alert[]>([
    {
      id: 1,
      type: 'critical',
      icon: <TrendingDown className="w-5 h-5" />,
      title: 'Poor Compliance - Priya Sharma',
      patient: 'Priya Sharma',
      description: 'Compliance rate dropped to 45%. Last 5 days no meal logs recorded.',
      timestamp: '2 hours ago',
    },
    {
      id: 2,
      type: 'critical',
      icon: <AlertTriangle className="w-5 h-5" />,
      title: 'Weight Not Improving',
      patient: 'Vikram Singh',
      description:
        'No weight change after 2 weeks. May require plan adjustment.',
      timestamp: '5 hours ago',
    },
    {
      id: 3,
      type: 'warning',
      icon: <UtensilsCrossed className="w-5 h-5" />,
      title: 'Unsafe Food Pattern Detected',
      patient: 'Rajesh Kumar',
      description:
        'Excessive spicy foods detected. Conflicts with Pitta-balancing plan.',
      timestamp: '1 day ago',
    },
    {
      id: 4,
      type: 'warning',
      icon: <Clock className="w-5 h-5" />,
      title: 'Irregular Meal Timing',
      patient: 'Anjali Gupta',
      description: 'Meal timings inconsistent. Vata imbalance may worsen.',
      timestamp: '2 days ago',
    },
    {
      id: 5,
      type: 'info',
      icon: <AlertCircle className="w-5 h-5" />,
      title: 'Plan Review Due',
      patient: 'Meera Devi',
      description: 'Current diet plan nearing completion. Schedule review session.',
      timestamp: '3 days ago',
    },
  ])

  const removeAlert = (id: number) => {
    setAlerts(alerts.filter((alert) => alert.id !== id))
  }

  const getAlertStyles = (type: string) => {
    switch (type) {
      case 'critical':
        return {
          bg: 'bg-red-50',
          border: 'border-red-200',
          icon: 'text-red-600',
          badge: 'bg-red-100 text-red-700',
        }
      case 'warning':
        return {
          bg: 'bg-amber-50',
          border: 'border-amber-200',
          icon: 'text-amber-600',
          badge: 'bg-amber-100 text-amber-700',
        }
      default:
        return {
          bg: 'bg-blue-50',
          border: 'border-blue-200',
          icon: 'text-blue-600',
          badge: 'bg-blue-100 text-blue-700',
        }
    }
  }

  return (
    <div className="bg-white rounded-lg border border-slate-200 p-6">
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-slate-900">
              Alerts & Flags
            </h2>
            <p className="text-sm text-slate-500 mt-1">
              {alerts.length} active alerts requiring attention
            </p>
          </div>
          <span className="px-3 py-1 bg-red-100 text-red-700 rounded-full text-xs font-semibold">
            {alerts.filter((a) => a.type === 'critical').length} Critical
          </span>
        </div>
      </div>

      {alerts.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-slate-500">No active alerts</p>
        </div>
      ) : (
        <div className="space-y-3">
          {alerts.map((alert) => {
            const styles = getAlertStyles(alert.type)
            return (
              <div
                key={alert.id}
                className={`${styles.bg} ${styles.border} border rounded-lg p-4 flex items-start gap-4 hover:shadow-sm transition-shadow`}
              >
                <div className={`mt-1 ${styles.icon}`}>{alert.icon}</div>

                <div className="flex-1">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h3 className="font-medium text-slate-900">
                        {alert.title}
                      </h3>
                      <p className="text-sm text-slate-600 mt-1">
                        {alert.description}
                      </p>
                      <div className="flex items-center gap-2 mt-2">
                        <span
                          className={`${styles.badge} text-xs font-medium px-2 py-1 rounded`}
                        >
                          {alert.type.toUpperCase()}
                        </span>
                        <span className="text-xs text-slate-500">
                          {alert.timestamp}
                        </span>
                      </div>
                    </div>
                    <button
                      onClick={() => removeAlert(alert.id)}
                      className="text-slate-400 hover:text-slate-600 transition-colors"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {alerts.length > 0 && (
        <div className="mt-6 pt-4 border-t border-slate-200">
          <button className="w-full px-4 py-2 text-sm font-medium text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
            View All Alerts
          </button>
        </div>
      )}
    </div>
  )
}
