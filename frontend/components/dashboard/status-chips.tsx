'use client'

// Ayurveda health profile
interface AyurvedaHealthProfile {
  prakriti: {
    dosha_type: string
  }
  vikriti: {
    dominant: string
  }
  agni: {
    name: string
    type: string
  }
}

// Unani health profile
interface UnaniHealthProfile {
  primary_mizaj: string
  dominant_humor: string
  digestive_strength: string
}

// TCM health profile
interface TCMHealthProfile {
  primary_pattern: string
  secondary_pattern?: string
  cold_heat: string
}

type HealthProfile = AyurvedaHealthProfile | UnaniHealthProfile | TCMHealthProfile

interface StatusChipsProps {
  healthProfile: HealthProfile
  framework?: string
}

export function StatusChips({ healthProfile, framework = 'ayurveda' }: StatusChipsProps) {
  // Ayurveda rendering
  if (framework === 'ayurveda' && 'prakriti' in healthProfile) {
    return (
      <div className="mb-6 p-4 bg-gradient-to-r from-blue-50 to-teal-50 rounded-xl border border-blue-200">
        <div className="flex items-center gap-4 flex-wrap">
          <div className="flex items-center gap-2">
            <span className="text-sm font-semibold text-slate-600">Constitution:</span>
            <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-semibold">
              {healthProfile.prakriti.dosha_type}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm font-semibold text-slate-600">Current State:</span>
            <span className="px-3 py-1 bg-amber-100 text-amber-700 rounded-full text-sm font-semibold">
              {healthProfile.vikriti.dominant} elevated
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm font-semibold text-slate-600">Digestive Fire:</span>
            <span className="px-3 py-1 bg-emerald-100 text-emerald-700 rounded-full text-sm font-semibold">
              {healthProfile.agni.name}
            </span>
          </div>
        </div>
      </div>
    )
  }

  // Unani rendering
  if (framework === 'unani' && 'primary_mizaj' in healthProfile) {
    return (
      <div className="mb-6 p-4 bg-gradient-to-r from-purple-50 to-indigo-50 rounded-xl border border-purple-200">
        <div className="flex items-center gap-4 flex-wrap">
          <div className="flex items-center gap-2">
            <span className="text-sm font-semibold text-slate-600">Mizaj (Temperament):</span>
            <span className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm font-semibold capitalize">
              {healthProfile.primary_mizaj}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm font-semibold text-slate-600">Dominant Humor:</span>
            <span className="px-3 py-1 bg-indigo-100 text-indigo-700 rounded-full text-sm font-semibold capitalize">
              {healthProfile.dominant_humor}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm font-semibold text-slate-600">Digestive Strength:</span>
            <span className="px-3 py-1 bg-emerald-100 text-emerald-700 rounded-full text-sm font-semibold capitalize">
              {healthProfile.digestive_strength}
            </span>
          </div>
        </div>
      </div>
    )
  }

  // TCM rendering
  if (framework === 'tcm' && 'primary_pattern' in healthProfile) {
    return (
      <div className="mb-6 p-4 bg-gradient-to-r from-red-50 to-orange-50 rounded-xl border border-red-200">
        <div className="flex items-center gap-4 flex-wrap">
          <div className="flex items-center gap-2">
            <span className="text-sm font-semibold text-slate-600">Primary Pattern:</span>
            <span className="px-3 py-1 bg-red-100 text-red-700 rounded-full text-sm font-semibold">
              {healthProfile.primary_pattern}
            </span>
          </div>
          {healthProfile.secondary_pattern && (
            <div className="flex items-center gap-2">
              <span className="text-sm font-semibold text-slate-600">Secondary Pattern:</span>
              <span className="px-3 py-1 bg-orange-100 text-orange-700 rounded-full text-sm font-semibold">
                {healthProfile.secondary_pattern}
              </span>
            </div>
          )}
          <div className="flex items-center gap-2">
            <span className="text-sm font-semibold text-slate-600">Balance:</span>
            <span className="px-3 py-1 bg-amber-100 text-amber-700 rounded-full text-sm font-semibold">
              {healthProfile.cold_heat}
            </span>
          </div>
        </div>
      </div>
    )
  }

  // Fallback - should not happen
  return null
}
