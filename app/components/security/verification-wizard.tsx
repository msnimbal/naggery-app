
'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { CheckCircle, Mail, Phone, Shield, AlertCircle } from 'lucide-react'
import { VerificationStep, SecuritySettings } from '@/lib/types'
import { Badge } from '@/components/ui/badge'

interface VerificationWizardProps {
  securitySettings: SecuritySettings
  onStepComplete: (step: string) => void
  className?: string
}

export function VerificationWizard({ 
  securitySettings, 
  onStepComplete, 
  className = '' 
}: VerificationWizardProps) {
  const { data: session } = useSession()
  const [currentStep, setCurrentStep] = useState(0)

  const steps: VerificationStep[] = [
    {
      step: 1,
      title: 'Email Verification',
      description: 'Verify your email address to secure your account',
      completed: securitySettings.emailVerified,
      required: true
    },
    {
      step: 2,
      title: 'Phone Verification',
      description: 'Add and verify your phone number for SMS notifications',
      completed: securitySettings.phoneVerified,
      required: true
    },
    {
      step: 3,
      title: 'Two-Factor Authentication',
      description: 'Enable 2FA for enhanced security using an authenticator app',
      completed: securitySettings.twoFaEnabled,
      required: true
    }
  ]

  useEffect(() => {
    // Find the current step based on completion status
    const nextIncompleteStep = steps.findIndex(step => !step.completed)
    setCurrentStep(nextIncompleteStep === -1 ? steps.length : nextIncompleteStep)
  }, [securitySettings])

  const getStepIcon = (step: VerificationStep, index: number) => {
    if (step.completed) {
      return <CheckCircle className="h-6 w-6 text-green-500" />
    }
    
    if (index === currentStep) {
      return <AlertCircle className="h-6 w-6 text-yellow-500" />
    }

    switch (step.step) {
      case 1:
        return <Mail className="h-6 w-6 text-gray-400" />
      case 2:
        return <Phone className="h-6 w-6 text-gray-400" />
      case 3:
        return <Shield className="h-6 w-6 text-gray-400" />
      default:
        return <AlertCircle className="h-6 w-6 text-gray-400" />
    }
  }

  const getStepStatus = (step: VerificationStep, index: number) => {
    if (step.completed) {
      return <Badge variant="default" className="bg-green-100 text-green-800">Completed</Badge>
    }
    
    if (index === currentStep) {
      return <Badge variant="default" className="bg-yellow-100 text-yellow-800">In Progress</Badge>
    }
    
    return <Badge variant="secondary">Pending</Badge>
  }

  const completedSteps = steps.filter(step => step.completed).length
  const progressPercentage = (completedSteps / steps.length) * 100

  const handleStepClick = (stepKey: string) => {
    onStepComplete(stepKey)
  }

  if (securitySettings.verificationStep === 'complete') {
    return (
      <Card className={`border-green-200 bg-green-50 ${className}`}>
        <CardContent className="pt-6">
          <div className="flex items-center gap-3 mb-4">
            <CheckCircle className="h-8 w-8 text-green-500" />
            <div>
              <h3 className="text-lg font-semibold text-green-800">Security Setup Complete!</h3>
              <p className="text-sm text-green-600">Your account is fully secured with all verification methods enabled.</p>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-2 text-sm">
            <div className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-500" />
              <span>Email Verified</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-500" />
              <span>Phone Verified</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-500" />
              <span>2FA Enabled</span>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Shield className="h-5 w-5" />
          Security Setup
        </CardTitle>
        <CardDescription>
          Complete these steps to secure your account
        </CardDescription>
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>Progress</span>
            <span>{completedSteps} of {steps.length} completed</span>
          </div>
          <Progress value={progressPercentage} className="h-2" />
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {steps.map((step, index) => (
          <div
            key={step.step}
            className={`flex items-center gap-4 p-4 rounded-lg border transition-colors ${
              index === currentStep 
                ? 'border-blue-200 bg-blue-50' 
                : step.completed 
                ? 'border-green-200 bg-green-50'
                : 'border-gray-200 bg-gray-50'
            }`}
          >
            <div className="flex-shrink-0">
              {getStepIcon(step, index)}
            </div>
            
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <h4 className="font-medium text-sm">{step.title}</h4>
                {getStepStatus(step, index)}
              </div>
              <p className="text-sm text-gray-600">{step.description}</p>
            </div>
            
            {!step.completed && index === currentStep && (
              <Button
                size="sm"
                onClick={() => {
                  switch (step.step) {
                    case 1:
                      handleStepClick('email')
                      break
                    case 2:
                      handleStepClick('phone')
                      break
                    case 3:
                      handleStepClick('2fa')
                      break
                  }
                }}
                className="flex-shrink-0"
              >
                {step.step === 1 ? 'Verify Email' : step.step === 2 ? 'Verify Phone' : 'Setup 2FA'}
              </Button>
            )}
          </div>
        ))}
        
        {currentStep >= steps.length && (
          <div className="text-center py-4">
            <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-3" />
            <h3 className="text-lg font-semibold text-green-800 mb-2">All Set!</h3>
            <p className="text-sm text-gray-600">
              Your account security is fully configured. You can access all features now.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
