'use client'

import { CheckCircle2, XCircle, AlertCircle, ChevronDown } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useState } from 'react'

export function AIReviewPanel() {
  const [expandedIndex, setExpandedIndex] = useState<number | null>(0)

  const recommendations = [
    {
      id: 1,
      meal: 'Breakfast: Warm Milk with Ghee',
      score: 95,
      ayurveda: 'Balances Vata dosha. Ghee aids nutrient absorption and boosts agni (digestive fire).',
      nutrition: 'Provides healthy fats (omega-3), protein, and calcium. Rich in fat-soluble vitamins A, D, K.',
      safety: 'No contraindications. Safe for lactose-sensitive individuals when using ghee-based preparation.',
      status: 'pending',
    },
    {
      id: 2,
      meal: 'Lunch: Mung Bean Soup with Turmeric',
      score: 88,
      ayurveda:
        'Mung beans are tridoshic. Turmeric provides anti-inflammatory benefits and balances Pitta.',
      nutrition: 'Complete protein source with essential amino acids. Turmeric contains curcumin with antioxidant properties.',
      safety: 'Well-tolerated. Recommended for all constitutional types.',
      status: 'pending',
    },
    {
      id: 3,
      meal: 'Dinner: Rice with Steamed Vegetables',
      score: 82,
      ayurveda:
        'Basmati rice is grounding and easily digestible. Supports digestive health according to Ayurvedic principles.',
      nutrition: 'Light dinner aids sleep and digestion. Vegetables provide essential micronutrients and fiber.',
      safety: 'Mild warming spices recommended. Avoid too late timing for better sleep.',
      status: 'pending',
    },
  ]

  return (
    <div className="bg-white rounded-lg border border-slate-200 p-6">
      <div className="mb-6">
        <h2 className="text-lg font-semibold text-slate-900">
          AI Recommendation Review
        </h2>
        <p className="text-sm text-slate-500 mt-1">
          Review and approve AI-generated diet recommendations for patients
        </p>
      </div>

      <div className="space-y-3">
        {recommendations.map((rec, idx) => (
          <div
            key={rec.id}
            className="border border-slate-200 rounded-lg overflow-hidden"
          >
            {/* Header */}
            <button
              onClick={() =>
                setExpandedIndex(expandedIndex === idx ? null : idx)
              }
              className="w-full px-4 py-4 hover:bg-slate-50 transition-colors flex items-center justify-between"
            >
              <div className="flex items-start gap-3 text-left flex-1">
                <div className="flex-1">
                  <h3 className="font-medium text-slate-900">
                    {rec.meal}
                  </h3>
                  <p className="text-sm text-slate-500 mt-1">
                    AI Recommendation Score: {rec.score}/100
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span className="px-3 py-1 bg-emerald-100 text-emerald-700 rounded-full text-xs font-medium">
                  {rec.status === 'pending' ? 'Pending Review' : 'Approved'}
                </span>
                <ChevronDown
                  className={`w-5 h-5 text-slate-400 transition-transform ${
                    expandedIndex === idx ? 'rotate-180' : ''
                  }`}
                />
              </div>
            </button>

            {/* Expanded Content */}
            {expandedIndex === idx && (
              <div className="border-t border-slate-200 px-4 py-4 bg-slate-50">
                <div className="space-y-4">
                  {/* Rule Breakdown */}
                  <div>
                    <h4 className="font-semibold text-slate-900 mb-3 text-sm">
                      Rule Breakdown
                    </h4>
                    <div className="space-y-3">
                      <div className="bg-white border border-slate-200 rounded p-3">
                        <p className="text-xs font-semibold text-slate-600 mb-1">
                          Ayurvedic Principles
                        </p>
                        <p className="text-sm text-slate-700">
                          {rec.ayurveda}
                        </p>
                      </div>

                      <div className="bg-white border border-slate-200 rounded p-3">
                        <p className="text-xs font-semibold text-slate-600 mb-1">
                          Modern Nutrition
                        </p>
                        <p className="text-sm text-slate-700">
                          {rec.nutrition}
                        </p>
                      </div>

                      <div className="bg-white border border-slate-200 rounded p-3">
                        <p className="text-xs font-semibold text-slate-600 mb-1">
                          Safety Rules
                        </p>
                        <p className="text-sm text-slate-700">
                          {rec.safety}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Score Visualization */}
                  <div className="bg-white border border-slate-200 rounded p-3">
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-xs font-semibold text-slate-600">
                        Recommendation Score
                      </p>
                      <p className="text-sm font-bold text-blue-600">
                        {rec.score}/100
                      </p>
                    </div>
                    <div className="w-full bg-slate-200 rounded-full h-2">
                      <div
                        className="bg-blue-600 h-2 rounded-full"
                        style={{ width: `${rec.score}%` }}
                      />
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-3 pt-2">
                    <Button className="flex-1 bg-emerald-600 hover:bg-emerald-700 gap-2">
                      <CheckCircle2 className="w-4 h-4" />
                      Approve
                    </Button>
                    <Button
                      variant="outline"
                      className="flex-1 gap-2 bg-transparent"
                    >
                      <AlertCircle className="w-4 h-4" />
                      Edit
                    </Button>
                    <Button
                      variant="outline"
                      className="flex-1 text-red-600 gap-2 bg-transparent"
                    >
                      <XCircle className="w-4 h-4" />
                      Reject
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
