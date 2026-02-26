'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { 
  CheckCircle2, 
  Heart, 
  Leaf, 
  Lightbulb, 
  FlaskConical,
  Download,
  Share2,
  ArrowRight
} from 'lucide-react'
import { useRouter } from 'next/navigation'

interface AssessmentResultsProps {
  results: any
  onStartNew: () => void
}

export default function AssessmentResults({ results, onStartNew }: AssessmentResultsProps) {
  const router = useRouter()

  const { framework, scores, healthProfile, nutritionInputs } = results.results || results

  const getFrameworkIcon = (frameworkId: string) => {
    switch (frameworkId) {
      case 'ayurveda':
        return <Leaf className="w-8 h-8 text-green-600" />
      case 'unani':
        return <Heart className="w-8 h-8 text-rose-600" />
      case 'tcm':
        return <Lightbulb className="w-8 h-8 text-amber-600" />
      case 'modern':
        return <FlaskConical className="w-8 h-8 text-blue-600" />
      default:
        return <Leaf className="w-8 h-8 text-gray-600" />
    }
  }

  const getFrameworkLabel = (frameworkId: string) => {
    switch (frameworkId) {
      case 'ayurveda': return 'Ayurveda'
      case 'unani': return 'Unani'
      case 'tcm': return 'Traditional Chinese Medicine'
      case 'modern': return 'Modern Clinical Nutrition'
      default: return frameworkId
    }
  }

  const renderAyurvedaResults = () => (
    <div className="space-y-6">
      <Card className="bg-green-50/50 border-green-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-green-600" />
            Your Dosha Constitution (Prakriti)
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-lg font-semibold">Constitution Type:</span>
              <Badge className="text-lg px-4 py-1 bg-green-600">
                {scores.prakriti?.dosha_type || 'Not Available'}
              </Badge>
            </div>
            {scores.prakriti?.secondary && (
              <div className="flex items-center justify-between">
                <span className="text-lg font-semibold">Secondary Dosha:</span>
                <Badge variant="outline" className="text-lg px-4 py-1">
                  {scores.prakriti.secondary.charAt(0).toUpperCase() + scores.prakriti.secondary.slice(1)}
                </Badge>
              </div>
            )}
          </div>

          <Separator />

          <div className="grid grid-cols-3 gap-4">
            <div className="text-center space-y-1">
              <p className="text-sm text-muted-foreground">Vata</p>
              <p className="text-2xl font-bold text-green-600">{scores.prakriti?.percentages?.vata || 0}%</p>
            </div>
            <div className="text-center space-y-1">
              <p className="text-sm text-muted-foreground">Pitta</p>
              <p className="text-2xl font-bold text-orange-600">{scores.prakriti?.percentages?.pitta || 0}%</p>
            </div>
            <div className="text-center space-y-1">
              <p className="text-sm text-muted-foreground">Kapha</p>
              <p className="text-2xl font-bold text-blue-600">{scores.prakriti?.percentages?.kapha || 0}%</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {scores.vikriti && (
        <Card className="bg-amber-50/50 border-amber-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-amber-600" />
              Current State (Vikriti)
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-lg font-semibold">Elevated Dosha:</span>
              <Badge className="text-lg px-4 py-1 bg-amber-600">
                {scores.vikriti.dominant?.charAt(0).toUpperCase() + scores.vikriti.dominant?.slice(1)}
              </Badge>
            </div>
            <p className="text-sm text-muted-foreground">{scores.vikriti.description}</p>
          </CardContent>
        </Card>
      )}

      {scores.agni && (
        <Card className="bg-blue-50/50 border-blue-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-blue-600" />
              Digestive Fire (Agni)
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-lg font-semibold">Type:</span>
              <Badge className="text-lg px-4 py-1 bg-blue-600">
                {scores.agni.name}
              </Badge>
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-700 mb-1">{scores.agni.description}</p>
              <p className="text-sm text-muted-foreground">{scores.agni.explanation}</p>
            </div>
          </CardContent>
        </Card>
      )}

      {scores.interpretation && (
        <Card>
          <CardHeader>
            <CardTitle>Summary & Recommendations</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h4 className="font-semibold text-green-600 mb-2">Constitution Overview:</h4>
              <p className="text-muted-foreground">{scores.interpretation.constitution_overview?.description}</p>
            </div>
            {scores.interpretation.current_state && !scores.interpretation.current_state.balanced && (
              <div>
                <h4 className="font-semibold text-amber-600 mb-2">Current State:</h4>
                <p className="text-muted-foreground">{scores.interpretation.current_state.message}</p>
              </div>
            )}
            <div>
              <h4 className="font-semibold text-blue-600 mb-2">Dietary Priority:</h4>
              <p className="text-muted-foreground mb-2">
                <strong>Primary Focus:</strong> {scores.interpretation.dietary_priority?.primary_focus}
              </p>
              <p className="text-muted-foreground">
                <strong>Secondary Focus:</strong> {scores.interpretation.dietary_priority?.secondary_focus}
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )

  const renderUnaniResults = () => (
    <div className="space-y-6">
      <Card className="bg-rose-50/50 border-rose-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-rose-600" />
            Your Mizaj (Temperament)
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="text-center space-y-2">
            <Badge className="text-2xl px-6 py-2 bg-rose-600">
              {scores.primary_mizaj.charAt(0).toUpperCase() + scores.primary_mizaj.slice(1)}
            </Badge>
            <p className="text-muted-foreground">
              {scores.thermal_tendency.charAt(0).toUpperCase() + scores.thermal_tendency.slice(1)} & {' '}
              {scores.moisture_tendency.charAt(0).toUpperCase() + scores.moisture_tendency.slice(1)}
            </p>
          </div>

          <Separator />

          <div className="grid grid-cols-2 gap-4">
            <div className="text-center space-y-1">
              <p className="text-sm text-muted-foreground">Primary Humor</p>
              <p className="text-2xl font-bold">{scores.humor_scores[scores.primary_mizaj]}</p>
            </div>
            <div className="text-center space-y-1">
              <p className="text-sm text-muted-foreground">Secondary Humor</p>
              <p className="text-2xl font-bold">{scores.humor_scores[scores.secondary_mizaj]}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {healthProfile.balancing_approach && (
        <Card>
          <CardHeader>
            <CardTitle>Balancing Approach</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">{healthProfile.balancing_approach}</p>
          </CardContent>
        </Card>
      )}
    </div>
  )

  const renderTCMResults = () => (
    <div className="space-y-6">
      <Card className="bg-amber-50/50 border-amber-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-amber-600" />
            Your Pattern Analysis
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-lg font-semibold">Dominant Pattern:</span>
              <Badge className="text-lg px-4 py-1 bg-amber-600">
                {scores.dominant_pattern.replace('_', ' ').split(' ').map((w: string) => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}
              </Badge>
            </div>
            {scores.secondary_pattern && (
              <div className="flex items-center justify-between">
                <span className="text-lg font-semibold">Secondary Pattern:</span>
                <Badge variant="outline" className="text-lg px-4 py-1">
                  {scores.secondary_pattern.replace('_', ' ').split(' ').map((w: string) => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}
                </Badge>
              </div>
            )}
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Severity:</span>
              <Badge variant="secondary">{scores.severity}</Badge>
            </div>
          </div>

          <Separator />

          <div>
            <p className="text-sm text-muted-foreground">{scores.pattern_description}</p>
          </div>
        </CardContent>
      </Card>

      {healthProfile.balancing_strategy && (
        <Card>
          <CardHeader>
            <CardTitle>Balancing Strategy</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">{healthProfile.balancing_strategy}</p>
          </CardContent>
        </Card>
      )}
    </div>
  )

  const renderModernResults = () => (
    <div className="space-y-6">
      <Card className="bg-blue-50/50 border-blue-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-blue-600" />
            Your Health Metrics
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">BMI</p>
              <p className="text-2xl font-bold">{scores.bmi}</p>
              <Badge variant="secondary" className="text-xs">{scores.bmi_category}</Badge>
            </div>
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">BMR</p>
              <p className="text-2xl font-bold">{scores.bmr}</p>
              <p className="text-xs text-muted-foreground">kcal/day</p>
            </div>
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">TDEE</p>
              <p className="text-2xl font-bold">{scores.tdee}</p>
              <p className="text-xs text-muted-foreground">kcal/day</p>
            </div>
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Target Calories</p>
              <p className="text-2xl font-bold text-blue-600">{scores.recommended_calories}</p>
              <p className="text-xs text-muted-foreground">kcal/day</p>
            </div>
          </div>

          <Separator />

          <div>
            <h4 className="font-semibold mb-3">Macronutrient Targets</h4>
            <div className="grid grid-cols-3 gap-4">
              <div className="text-center space-y-1 p-3 bg-red-50 rounded-lg">
                <p className="text-xs text-muted-foreground">Protein</p>
                <p className="text-xl font-bold text-red-600">{scores.macro_split.protein.percent}%</p>
                <p className="text-sm text-muted-foreground">{scores.macro_split.protein.grams}g</p>
              </div>
              <div className="text-center space-y-1 p-3 bg-amber-50 rounded-lg">
                <p className="text-xs text-muted-foreground">Carbs</p>
                <p className="text-xl font-bold text-amber-600">{scores.macro_split.carbs.percent}%</p>
                <p className="text-sm text-muted-foreground">{scores.macro_split.carbs.grams}g</p>
              </div>
              <div className="text-center space-y-1 p-3 bg-blue-50 rounded-lg">
                <p className="text-xs text-muted-foreground">Fats</p>
                <p className="text-xl font-bold text-blue-600">{scores.macro_split.fats.percent}%</p>
                <p className="text-sm text-muted-foreground">{scores.macro_split.fats.grams}g</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {scores.risk_flags && scores.risk_flags.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Health Considerations</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {scores.risk_flags.map((flag: any, index: number) => (
                <div key={index} className="p-3 bg-amber-50 border border-amber-200 rounded-lg">
                  <p className="text-sm font-medium">{flag.message}</p>
                  <Badge variant="outline" className="mt-1 text-xs">{flag.type} - {flag.severity}</Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {scores.recommendations && scores.recommendations.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Personalized Recommendations</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {scores.recommendations.map((rec: string, index: number) => (
                <li key={index} className="flex items-start gap-2">
                  <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                  <span className="text-muted-foreground">{rec}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}
    </div>
  )

  const renderFrameworkResults = () => {
    switch (framework) {
      case 'ayurveda':
        return renderAyurvedaResults()
      case 'unani':
        return renderUnaniResults()
      case 'tcm':
        return renderTCMResults()
      case 'modern':
        return renderModernResults()
      default:
        return null
    }
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="text-center space-y-4">
        <div className="flex justify-center">
          {getFrameworkIcon(framework)}
        </div>
        <div className="space-y-2">
          <h2 className="text-3xl font-bold tracking-tight">Assessment Complete!</h2>
          <p className="text-muted-foreground">
            Your {getFrameworkLabel(framework)} health profile is ready
          </p>
        </div>
      </div>

      {/* Results */}
      {renderFrameworkResults()}

      {/* Actions */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button variant="outline" onClick={() => router.push('/dashboard')}>
              <ArrowRight className="w-4 h-4 mr-2" />
              Go to Dashboard
            </Button>
            <Button variant="outline" onClick={onStartNew}>
              Start New Assessment
            </Button>
            <Button variant="outline">
              <Download className="w-4 h-4 mr-2" />
              Download Report
            </Button>
            <Button variant="outline">
              <Share2 className="w-4 h-4 mr-2" />
              Share with Practitioner
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
