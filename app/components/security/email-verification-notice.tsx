
'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Mail, CheckCircle, AlertTriangle, RefreshCw } from 'lucide-react'
import { toast } from 'sonner'

interface EmailVerificationNoticeProps {
  email: string
  onComplete?: () => void
}

export function EmailVerificationNotice({ email, onComplete }: EmailVerificationNoticeProps) {
  const [isResending, setIsResending] = useState(false)
  const [error, setError] = useState('')
  const [resentAt, setResentAt] = useState<Date | null>(null)

  const resendVerificationEmail = async () => {
    setIsResending(true)
    setError('')
    
    try {
      const response = await fetch('/api/auth/verify-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email })
      })
      
      const data = await response.json()
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to resend verification email')
      }
      
      setResentAt(new Date())
      toast.success('Verification email sent successfully!')
    } catch (error) {
      console.error('Resend email error:', error)
      setError(error instanceof Error ? error.message : 'Failed to resend verification email')
    } finally {
      setIsResending(false)
    }
  }

  return (
    <Card className="border-yellow-200 bg-yellow-50">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-yellow-800">
          <Mail className="h-5 w-5" />
          Email Verification Required
        </CardTitle>
        <CardDescription className="text-yellow-700">
          Please verify your email address to continue using your account
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {error && (
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        
        <div className="space-y-3">
          <p className="text-sm text-gray-700">
            We sent a verification link to <strong>{email}</strong>. 
            Click the link in the email to verify your account.
          </p>
          
          <div className="bg-white p-4 rounded-lg border border-yellow-200">
            <h4 className="font-medium text-sm mb-2">Check your email for:</h4>
            <ul className="text-sm space-y-1 text-gray-600">
              <li>• A message from Naggery</li>
              <li>• Subject: "Verify your Naggery account"</li>
              <li>• Click the "Verify Email Address" button</li>
            </ul>
          </div>
          
          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription className="text-sm">
              Can't find the email? Check your spam/junk folder. The verification link expires in 24 hours.
            </AlertDescription>
          </Alert>
          
          {resentAt && (
            <Alert className="border-green-200 bg-green-50">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <AlertDescription className="text-green-700">
                Email resent successfully at {resentAt.toLocaleTimeString()}
              </AlertDescription>
            </Alert>
          )}
        </div>
        
        <div className="flex gap-2">
          <Button 
            onClick={resendVerificationEmail}
            disabled={isResending}
            variant="outline"
            className="flex-1"
          >
            {isResending ? (
              <>
                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                Sending...
              </>
            ) : (
              <>
                <Mail className="h-4 w-4 mr-2" />
                Resend Verification Email
              </>
            )}
          </Button>
          
          <Button 
            onClick={onComplete}
            variant="ghost"
          >
            I'll verify later
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
