'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import FrameworkSelection from '@/components/assessment/FrameworkSelection';
import AssessmentForm from '@/components/assessment/AssessmentForm';
import AssessmentResults from '@/components/assessment/AssessmentResults';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { CheckCircle2, Sparkles } from 'lucide-react';

type OnboardingStep = 'welcome' | 'framework' | 'assessment' | 'results';

export default function OnboardingPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [currentStep, setCurrentStep] = useState<OnboardingStep>('welcome');
  const [selectedFramework, setSelectedFramework] = useState<string | null>(null);
  const [assessmentResults, setAssessmentResults] = useState<any>(null);

  // Redirect if already completed assessment
  if (user?.hasCompletedAssessment) {
    router.push('/dashboard');
    return null;
  }

  const handleFrameworkSelect = (framework: string) => {
    setSelectedFramework(framework);
    setCurrentStep('assessment');
  };

  const handleAssessmentComplete = (results: any) => {
    setAssessmentResults(results);
    setCurrentStep('results');
  };

  const handleFinishOnboarding = () => {
    router.push('/dashboard');
  };

  const getProgressPercentage = () => {
    switch (currentStep) {
      case 'welcome':
        return 0;
      case 'framework':
        return 33;
      case 'assessment':
        return 66;
      case 'results':
        return 100;
      default:
        return 0;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-blue-50">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-sm font-medium text-gray-600">
              {currentStep === 'welcome' && 'Welcome to NutriFusion'}
              {currentStep === 'framework' && 'Choose Your Medical Framework'}
              {currentStep === 'assessment' && 'Complete Health Assessment'}
              {currentStep === 'results' && 'Your Health Profile'}
            </h2>
            <span className="text-sm text-gray-500">{getProgressPercentage()}%</span>
          </div>
          <Progress value={getProgressPercentage()} className="h-2" />
        </div>

        {/* Welcome Step */}
        {currentStep === 'welcome' && (
          <Card className="border-2 shadow-lg">
            <CardHeader className="text-center">
              <div className="mx-auto mb-4 w-16 h-16 bg-gradient-to-br from-green-500 to-blue-500 rounded-full flex items-center justify-center">
                <Sparkles className="w-8 h-8 text-white" />
              </div>
              <CardTitle className="text-3xl">Welcome to NutriFusion!</CardTitle>
              <CardDescription className="text-base mt-2">
                Let's create your personalized nutrition profile
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h3 className="font-semibold text-blue-900 mb-2">What to expect:</h3>
                <ul className="space-y-2 text-sm text-blue-800">
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 mt-0.5 flex-shrink-0" />
                    <span>Choose a medical framework that resonates with you</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 mt-0.5 flex-shrink-0" />
                    <span>Answer questions about your health, lifestyle, and preferences</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 mt-0.5 flex-shrink-0" />
                    <span>Receive personalized nutrition recommendations</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 mt-0.5 flex-shrink-0" />
                    <span>Access your customized dashboard and meal plans</span>
                  </li>
                </ul>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div className="bg-gray-50 rounded-lg p-4">
                  <h4 className="font-semibold mb-1">⏱️ Time Required</h4>
                  <p className="text-sm text-gray-600">5-10 minutes</p>
                </div>
                <div className="bg-gray-50 rounded-lg p-4">
                  <h4 className="font-semibold mb-1">📋 Questions</h4>
                  <p className="text-sm text-gray-600">16-20 questions</p>
                </div>
              </div>

              <Button
                size="lg"
                className="w-full"
                onClick={() => setCurrentStep('framework')}
              >
                Let's Get Started
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Framework Selection Step */}
        {currentStep === 'framework' && (
          <div>
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold mb-2">Choose Your Medical Framework</h2>
              <p className="text-gray-600">
                Select the approach that best aligns with your health philosophy
              </p>
            </div>
            <FrameworkSelection onSelectFramework={handleFrameworkSelect} />
            <Button
              variant="ghost"
              className="mt-4"
              onClick={() => setCurrentStep('welcome')}
            >
              ← Back
            </Button>
          </div>
        )}

        {/* Assessment Step */}
        {currentStep === 'assessment' && selectedFramework && (
          <div>
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold mb-2">Health Assessment</h2>
              <p className="text-gray-600">
                Answer these questions to build your personalized profile
              </p>
            </div>
            <AssessmentForm
              framework={selectedFramework}
              onComplete={handleAssessmentComplete}
              onBack={() => setCurrentStep('framework')}
            />
          </div>
        )}

        {/* Results Step */}
        {currentStep === 'results' && assessmentResults && (
          <div>
            <div className="text-center mb-6">
              <div className="mx-auto mb-4 w-16 h-16 bg-gradient-to-br from-green-500 to-blue-500 rounded-full flex items-center justify-center">
                <CheckCircle2 className="w-8 h-8 text-white" />
              </div>
              <h2 className="text-2xl font-bold mb-2">Assessment Complete!</h2>
              <p className="text-gray-600">
                Here's your personalized health profile
              </p>
            </div>

            <AssessmentResults 
              results={assessmentResults} 
              onStartNew={() => setCurrentStep('framework')}
            />

            <div className="mt-6 text-center">
              <Button
                size="lg"
                onClick={handleFinishOnboarding}
                className="min-w-[200px]"
              >
                Continue to Dashboard →
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
