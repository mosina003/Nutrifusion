'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Checkbox } from '@/components/ui/checkbox'
import { Progress } from '@/components/ui/progress'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Loader2, ArrowLeft, ArrowRight, CheckCircle2, AlertCircle } from 'lucide-react'
import { getAssessmentQuestions, submitAssessment } from '@/lib/api'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/context/AuthContext'

interface Question {
  id: string
  category: string
  weight?: number
  question: string
  type?: string
  options?: any[]
  validation?: any
  unit?: string
  required?: boolean
}

interface AssessmentFormProps {
  framework: string
  onBack: () => void
  onComplete: (result: any) => void
}

export default function AssessmentForm({ framework, onBack, onComplete }: AssessmentFormProps) {
  const router = useRouter()
  const { refreshUser } = useAuth()
  const [questions, setQuestions] = useState<Question[]>([])
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [responses, setResponses] = useState<Record<string, any>>({})
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchQuestions()
  }, [framework])

  const fetchQuestions = async () => {
    try {
      setLoading(true)
      setError(null)
      const response = await getAssessmentQuestions(framework)
      
      if (response.success && response.data?.questions) {
        setQuestions(response.data.questions.questions || [])
      } else {
        setError('Failed to load questions')
      }
    } catch (err) {
      console.error('Error fetching questions:', err)
      setError('An error occurred while loading questions')
    } finally {
      setLoading(false)
    }
  }

  const currentQuestion = questions[currentQuestionIndex]
  const progress = ((currentQuestionIndex + 1) / questions.length) * 100
  const isLastQuestion = currentQuestionIndex === questions.length - 1
  const isFirstQuestion = currentQuestionIndex === 0

  const handleResponse = (questionId: string, value: any) => {
    setResponses(prev => ({
      ...prev,
      [questionId]: value
    }))
    // Clear error when user provides an answer
    if (error) setError(null)
  }

  const handleNext = () => {
    // Check if current question is required and answered
    if (currentQuestion?.required && !isCurrentQuestionAnswered()) {
      setError('Please answer this question before proceeding')
      return
    }
    
    setError(null)
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1)
    }
  }

  const handlePrevious = () => {
    setError(null)
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prev => prev - 1)
    }
  }

  const handleSubmit = async () => {
    try {
      setSubmitting(true)
      setError(null)

      // Validate all required questions are answered
      const unansweredRequired = questions.filter(q => {
        if (!q.required) return false
        const response = responses[q.id]
        if (!response) return true
        
        // For modern framework with structured responses
        if (framework === 'modern' && response.value !== undefined) {
          if (Array.isArray(response.value)) {
            return response.value.length === 0
          }
          return response.value === '' || response.value === null
        }
        
        return false
      })

      if (unansweredRequired.length > 0) {
        const firstUnanswered = questions.findIndex(q => q.id === unansweredRequired[0].id)
        setCurrentQuestionIndex(firstUnanswered)
        setError(`Please answer all required questions. "${unansweredRequired[0].question}" is required.`)
        setSubmitting(false)
        return
      }

      const response = await submitAssessment({
        framework,
        responses
      })

      if (response.success) {
        // Refresh user data to update hasCompletedAssessment status
        await refreshUser()
        onComplete(response.data)
      } else {
        console.error('❌ Assessment submission failed:', response.error)
        setError(response.error || 'Failed to submit assessment')
      }
    } catch (err: any) {
      console.error('❌ Error submitting assessment:', err)
      setError(err.message || 'An error occurred while submitting assessment')
    } finally {
      setSubmitting(false)
    }
  }

  const isCurrentQuestionAnswered = () => {
    if (!currentQuestion) return false
    const response = responses[currentQuestion.id]
    
    if (!response) return false
    
    // For modern framework with structured responses
    if (framework === 'modern' && response.value !== undefined) {
      // Check if value is not empty
      if (Array.isArray(response.value)) {
        return response.value.length > 0
      }
      return response.value !== '' && response.value !== null
    }
    
    // For other frameworks (Ayurveda, Unani, TCM)
    return response !== undefined && response !== ''
  }

  const renderQuestionInput = () => {
    if (!currentQuestion) return null

    const currentResponse = responses[currentQuestion.id]

    // For modern clinical questions with different types
    if (framework === 'modern') {
      switch (currentQuestion.type) {
        case 'number':
          return (
            <div className="space-y-2">
              <Input
                type="number"
                value={currentResponse?.value || ''}
                onChange={(e) => handleResponse(currentQuestion.id, { value: e.target.value })}
                placeholder={`Enter ${currentQuestion.question.toLowerCase()}`}
                min={currentQuestion.validation?.min}
                max={currentQuestion.validation?.max}
                className="text-lg"
              />
              {currentQuestion.unit && (
                <p className="text-sm text-muted-foreground">Unit: {currentQuestion.unit}</p>
              )}
            </div>
          )

        case 'select':
          return (
            <RadioGroup
              value={currentResponse?.value || ''}
              onValueChange={(value) => handleResponse(currentQuestion.id, { value })}
            >
              <div className="space-y-3">
                {currentQuestion.options?.map((option: any) => (
                  <div key={option.value} className="flex items-center space-x-3 p-4 border rounded-lg hover:bg-accent transition-colors">
                    <RadioGroupItem value={option.value} id={option.value} />
                    <Label htmlFor={option.value} className="flex-1 cursor-pointer text-base leading-relaxed">
                      {option.label}
                    </Label>
                  </div>
                ))}
              </div>
            </RadioGroup>
          )

        case 'multiselect':
          const selectedValues = currentResponse?.value || []
          return (
            <div className="space-y-3">
              {currentQuestion.options?.map((option: any) => (
                <div key={option.value} className="flex items-center space-x-3 p-4 border rounded-lg hover:bg-accent transition-colors">
                  <Checkbox
                    id={option.value}
                    checked={selectedValues.includes(option.value)}
                    onCheckedChange={(checked) => {
                      const newValues = checked
                        ? [...selectedValues, option.value]
                        : selectedValues.filter((v: string) => v !== option.value)
                      handleResponse(currentQuestion.id, { value: newValues })
                    }}
                  />
                  <Label htmlFor={option.value} className="flex-1 cursor-pointer text-base leading-relaxed">
                    {option.label}
                  </Label>
                </div>
              ))}
            </div>
          )

        default:
          return null
      }
    }

    // For other frameworks (Ayurveda, Unani, TCM) with simple options
    return (
      <RadioGroup
        value={currentResponse ? JSON.stringify(currentResponse) : ''}
        onValueChange={(value) => handleResponse(currentQuestion.id, JSON.parse(value))}
      >
        <div className="space-y-3">
          {currentQuestion.options?.map((option: any, index: number) => {
            const optionValue = JSON.stringify(option)
            return (
              <div key={index} className="flex items-center space-x-3 p-4 border rounded-lg hover:bg-accent transition-colors">
                <RadioGroupItem value={optionValue} id={`${currentQuestion.id}-${index}`} />
                <Label htmlFor={`${currentQuestion.id}-${index}`} className="flex-1 cursor-pointer text-base leading-relaxed">
                  {option.text || option.label}
                </Label>
              </div>
            )
          })}
        </div>
      </RadioGroup>
    )
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    )
  }

  if (error && questions.length === 0) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    )
  }

  if (questions.length === 0) {
    return (
      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>No questions available for this framework.</AlertDescription>
      </Alert>
    )
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Progress Bar */}
      <div className="space-y-2">
        <div className="flex justify-between items-center text-sm">
          <span className="font-medium">Question {currentQuestionIndex + 1} of {questions.length}</span>
          <span className="text-muted-foreground">{Math.round(progress)}% Complete</span>
        </div>
        <Progress value={progress} className="h-2" />
      </div>

      {/* Question Card */}
      <Card>
        <CardHeader>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
                {currentQuestion.category}
              </CardTitle>
              {currentQuestion.required && (
                <span className="text-sm text-destructive">* Required</span>
              )}
            </div>
            <CardDescription className="text-2xl font-semibold text-foreground leading-relaxed">
              {currentQuestion.question}
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {renderQuestionInput()}

          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* Navigation Buttons */}
          <div className="flex justify-between items-center pt-4">
            <Button
              variant="outline"
              onClick={isFirstQuestion ? onBack : handlePrevious}
              disabled={submitting}
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              {isFirstQuestion ? 'Back to Selection' : 'Previous'}
            </Button>

            {isLastQuestion ? (
              <Button
                onClick={handleSubmit}
                disabled={!isCurrentQuestionAnswered() || submitting}
                size="lg"
              >
                {submitting ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Submitting...
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-4 h-4 mr-2" />
                    Complete Assessment
                  </>
                )}
              </Button>
            ) : (
              <Button
                onClick={handleNext}
                disabled={!isCurrentQuestionAnswered()}
                size="lg"
              >
                Next
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            )}
          </div>

          {/* Answer counter */}
          <div className="text-center text-sm text-muted-foreground">
            {Object.keys(responses).length} of {questions.length} questions answered
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
