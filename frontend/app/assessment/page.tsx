'use client'

import { useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import FrameworkSelection from '@/components/assessment/FrameworkSelection'
import AssessmentForm from '@/components/assessment/AssessmentForm'
import AssessmentResults from '@/components/assessment/AssessmentResults'

type AssessmentStep = 'selection' | 'assessment' | 'results'

export default function AssessmentPage() {
  const [currentStep, setCurrentStep] = useState<AssessmentStep>('selection')
  const [selectedFramework, setSelectedFramework] = useState<string>('')
  const [assessmentResults, setAssessmentResults] = useState<any>(null)

  const handleFrameworkSelection = (frameworkId: string) => {
    setSelectedFramework(frameworkId)
    setCurrentStep('assessment')
  }

  const handleBackToSelection = () => {
    setCurrentStep('selection')
    setSelectedFramework('')
  }

  const handleAssessmentComplete = (results: any) => {
    setAssessmentResults(results)
    setCurrentStep('results')
  }

  const handleStartNew = () => {
    setCurrentStep('selection')
    setSelectedFramework('')
    setAssessmentResults(null)
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20 py-12 px-4">
      <div className="container mx-auto">
        {currentStep === 'selection' && (
          <FrameworkSelection
            onSelectFramework={handleFrameworkSelection}
            selectedFramework={selectedFramework}
          />
        )}

        {currentStep === 'assessment' && selectedFramework && (
          <AssessmentForm
            framework={selectedFramework}
            onBack={handleBackToSelection}
            onComplete={handleAssessmentComplete}
          />
        )}

        {currentStep === 'results' && assessmentResults && (
          <AssessmentResults
            results={assessmentResults}
            onStartNew={handleStartNew}
          />
        )}
      </div>
    </div>
  )
}
