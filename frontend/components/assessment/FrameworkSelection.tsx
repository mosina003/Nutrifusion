'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Loader2, Check, Heart, Leaf, Lightbulb, FlaskConical } from 'lucide-react'
import { getAssessmentFrameworks } from '@/lib/api'

interface Framework {
  id: string
  label: string
  description: string
}

interface FrameworkSelectionProps {
  onSelectFramework: (frameworkId: string) => void
  selectedFramework?: string
}

export default function FrameworkSelection({ onSelectFramework, selectedFramework }: FrameworkSelectionProps) {
  const [frameworks, setFrameworks] = useState<Framework[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchFrameworks()
  }, [])

  const fetchFrameworks = async () => {
    try {
      setLoading(true)
      const response = await getAssessmentFrameworks()
      
      if (response.success && response.data?.frameworks) {
        setFrameworks(response.data.frameworks)
      } else {
        setError('Failed to load frameworks')
      }
    } catch (err) {
      console.error('Error fetching frameworks:', err)
      setError('An error occurred while loading frameworks')
    } finally {
      setLoading(false)
    }
  }

  const getFrameworkIcon = (frameworkId: string) => {
    switch (frameworkId) {
      case 'ayurveda':
        return <Leaf className="w-12 h-12 text-green-600" />
      case 'unani':
        return <Heart className="w-12 h-12 text-rose-600" />
      case 'tcm':
        return <Lightbulb className="w-12 h-12 text-amber-600" />
      case 'modern':
        return <FlaskConical className="w-12 h-12 text-blue-600" />
      default:
        return <Leaf className="w-12 h-12 text-gray-600" />
    }
  }

  const getFrameworkColor = (frameworkId: string) => {
    switch (frameworkId) {
      case 'ayurveda':
        return 'border-green-200 hover:border-green-400 bg-green-50/30'
      case 'unani':
        return 'border-rose-200 hover:border-rose-400 bg-rose-50/30'
      case 'tcm':
        return 'border-amber-200 hover:border-amber-400 bg-amber-50/30'
      case 'modern':
        return 'border-blue-200 hover:border-blue-400 bg-blue-50/30'
      default:
        return 'border-gray-200 hover:border-gray-400'
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    )
  }

  if (error) {
    return (
      <Card className="border-destructive">
        <CardHeader>
          <CardTitle className="text-destructive">Error</CardTitle>
          <CardDescription>{error}</CardDescription>
        </CardHeader>
        <CardContent>
          <Button onClick={fetchFrameworks} variant="outline">
            Try Again
          </Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Choose Your Assessment Framework</h2>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          Select the medical framework that resonates with you. Each approach offers unique insights into your health and nutrition needs.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {frameworks.map((framework) => {
          const isSelected = selectedFramework === framework.id
          
          return (
            <Card
              key={framework.id}
              className={`cursor-pointer transition-all duration-200 relative overflow-hidden ${getFrameworkColor(framework.id)} ${
                isSelected ? 'ring-2 ring-primary shadow-lg scale-[1.02]' : 'hover:shadow-md'
              }`}
              onClick={() => onSelectFramework(framework.id)}
            >
              {isSelected && (
                <div className="absolute top-4 right-4">
                  <Badge className="bg-primary">
                    <Check className="w-4 h-4 mr-1" />
                    Selected
                  </Badge>
                </div>
              )}
              
              <CardHeader className="pb-4">
                <div className="flex items-start justify- between gap-4">
                  <div className="flex-shrink-0">
                    {getFrameworkIcon(framework.id)}
                  </div>
                  <div className="flex-1 space-y-1">
                    <CardTitle className="text-2xl">{framework.label}</CardTitle>
                    <CardDescription className="text-base leading-relaxed">
                      {framework.description}
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              
              <CardContent className="pt-0">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">
                    {framework.id === 'ayurveda' && '18 questions • 5 categories'}
                    {framework.id === 'unani' && '16 questions • 5 categories'}
                    {framework.id === 'tcm' && '18 questions • 5 categories'}
                    {framework.id === 'modern' && '20 questions • Clinical assessment'}
                  </span>
                  <Button
                    variant={isSelected ? 'default' : 'outline'}
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation()
                      onSelectFramework(framework.id)
                    }}
                  >
                    {isSelected ? 'Selected' : 'Select'}
                  </Button>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {selectedFramework && (
        <div className="flex justify-center pt-4">
          <Button size="lg" onClick={() => onSelectFramework(selectedFramework)}>
            Continue to Assessment
          </Button>
        </div>
      )}
    </div>
  )
}
