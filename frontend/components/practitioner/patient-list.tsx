'use client'

import { useState } from 'react'
import { ChevronDown, Search, AlertTriangle } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface Patient {
  id: string
  name: string
  age: number
  dosha: string
  conditions: string[]
  lastPlanStatus: string
  compliance: number
  alert?: boolean
}

interface PatientListProps {
  onSelectPatient?: (patient: Patient) => void
}

export function PatientList({ onSelectPatient }: PatientListProps) {
  const [selectedDosha, setSelectedDosha] = useState<string>('')
  const [selectedCondition, setSelectedCondition] = useState<string>('')
  const [complianceFilter, setComplianceFilter] = useState<string>('')
  const [searchTerm, setSearchTerm] = useState<string>('')

  const patients: Patient[] = [
    {
      id: '1',
      name: 'Rajesh Kumar',
      age: 42,
      dosha: 'Vata-Pitta',
      conditions: ['Anxiety', 'Digestion'],
      lastPlanStatus: 'Active',
      compliance: 92,
      alert: false,
    },
    {
      id: '2',
      name: 'Priya Sharma',
      age: 35,
      dosha: 'Kapha',
      conditions: ['Weight Management', 'Lethargy'],
      lastPlanStatus: 'Active',
      compliance: 45,
      alert: true,
    },
    {
      id: '3',
      name: 'Arjun Patel',
      age: 58,
      dosha: 'Pitta',
      conditions: ['Hypertension', 'Acidity'],
      lastPlanStatus: 'Completed',
      compliance: 88,
      alert: false,
    },
    {
      id: '4',
      name: 'Anjali Gupta',
      age: 28,
      dosha: 'Vata',
      conditions: ['Sleep Issues', 'Energy'],
      lastPlanStatus: 'Active',
      compliance: 76,
      alert: false,
    },
    {
      id: '5',
      name: 'Vikram Singh',
      age: 45,
      dosha: 'Kapha-Pitta',
      conditions: ['Inflammation', 'Metabolism'],
      lastPlanStatus: 'Active',
      compliance: 38,
      alert: true,
    },
    {
      id: '6',
      name: 'Meera Devi',
      age: 52,
      dosha: 'Pitta-Vata',
      conditions: ['Hormonal Balance'],
      lastPlanStatus: 'Active',
      compliance: 82,
      alert: false,
    },
  ]

  const filteredPatients = patients.filter((patient) => {
    const matchesSearch = patient.name
      .toLowerCase()
      .includes(searchTerm.toLowerCase())
    const matchesDosha =
      !selectedDosha || patient.dosha.includes(selectedDosha)
    const matchesCondition =
      !selectedCondition ||
      patient.conditions.some((c) =>
        c.toLowerCase().includes(selectedCondition.toLowerCase())
      )
    const matchesCompliance =
      !complianceFilter ||
      (complianceFilter === 'high' && patient.compliance >= 80) ||
      (complianceFilter === 'medium' &&
        patient.compliance >= 50 &&
        patient.compliance < 80) ||
      (complianceFilter === 'low' && patient.compliance < 50)

    return (
      matchesSearch &&
      matchesDosha &&
      matchesCondition &&
      matchesCompliance
    )
  })

  return (
    <div className="bg-white rounded-lg border border-slate-200 p-6">
      <div className="mb-6">
        <h2 className="text-lg font-semibold text-slate-900 mb-4">
          Patient List
        </h2>

        {/* Search Bar */}
        <div className="mb-4 relative">
          <Search className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search patient name..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
          />
        </div>

        {/* Filters */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">
              Dosha
            </label>
            <select
              value={selectedDosha}
              onChange={(e) => setSelectedDosha(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
            >
              <option value="">All Doshas</option>
              <option value="Vata">Vata</option>
              <option value="Pitta">Pitta</option>
              <option value="Kapha">Kapha</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">
              Condition
            </label>
            <select
              value={selectedCondition}
              onChange={(e) => setSelectedCondition(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
            >
              <option value="">All Conditions</option>
              <option value="Anxiety">Anxiety</option>
              <option value="Weight">Weight Management</option>
              <option value="Sleep">Sleep Issues</option>
              <option value="Hypertension">Hypertension</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">
              Compliance
            </label>
            <select
              value={complianceFilter}
              onChange={(e) => setComplianceFilter(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
            >
              <option value="">All Levels</option>
              <option value="high">High (80%+)</option>
              <option value="medium">Medium (50-80%)</option>
              <option value="low">Low (&lt;50%)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Patient Cards */}
      <div className="space-y-3">
        {filteredPatients.map((patient) => (
          <div
            key={patient.id}
            onClick={() => onSelectPatient?.(patient)}
            className="flex items-center justify-between p-4 border border-slate-200 rounded-lg hover:bg-slate-50 hover:border-blue-300 cursor-pointer transition-all"
          >
            <div className="flex-1">
              <div className="flex items-center gap-3">
                {patient.alert && (
                  <AlertTriangle className="w-5 h-5 text-amber-600" />
                )}
                <div>
                  <p className="font-medium text-slate-900">
                    {patient.name}
                  </p>
                  <p className="text-xs text-slate-500">
                    Age {patient.age} • {patient.dosha}
                  </p>
                </div>
              </div>
              <div className="flex gap-2 mt-2 flex-wrap">
                {patient.conditions.map((condition, idx) => (
                  <span
                    key={idx}
                    className="text-xs bg-slate-100 text-slate-700 px-2 py-1 rounded"
                  >
                    {condition}
                  </span>
                ))}
              </div>
            </div>

            <div className="text-right ml-4">
              <p className="text-sm font-medium text-slate-900">
                {patient.lastPlanStatus}
              </p>
              <p
                className={`text-sm font-semibold ${
                  patient.compliance >= 80
                    ? 'text-emerald-600'
                    : patient.compliance >= 50
                      ? 'text-amber-600'
                      : 'text-red-600'
                }`}
              >
                {patient.compliance}% compliance
              </p>
            </div>

            <ChevronDown className="w-5 h-5 text-slate-400 ml-3" />
          </div>
        ))}
      </div>
    </div>
  )
}
