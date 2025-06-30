
'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Phone, MessageSquare, CheckCircle, AlertTriangle, Clock } from 'lucide-react'
import { toast } from 'sonner'

interface PhoneVerificationProps {
  phone?: string
  onComplete?: () => void
  onCancel?: () => void
}

export function PhoneVerification({ phone, onComplete, onCancel }: PhoneVerificationProps) {
  const [step, setStep] = useState<'phone' | 'verify' | 'complete'>('phone')
  const [phoneNumber, setPhoneNumber] = useState(phone || '')
  const [verificationCode, setVerificationCode] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [token, setToken] = useState('')
  const [resendCooldown, setResendCooldown] = useState(0)

  const formatPhoneNumber = (value: string) => {
    // Remove all non-digits except +
    const cleaned = value.replace(/[^\d+]/g, '')
    
    // If it doesn't start with +, add +1 for US numbers
    if (!cleaned.startsWith('+')) {
      return cleaned ? `+1${cleaned}` : ''
    }
    
    return cleaned
  }

  const sendVerificationCode = async (phoneToVerify: string = phoneNumber) => {
    if (!phoneToVerify) {
      setError('Phone number is required')
      return
    }

    const formattedPhone = formatPhoneNumber(phoneToVerify)
    
    if (!/^\+[1-9]\d{1,14}$/.test(formattedPhone)) {
      setError('Invalid phone number format. Please include country code (e.g., +1234567890)')
      return
    }

    setIsLoading(true)
    setError('')
    
    try {
      const response = await fetch('/api/auth/verify-sms', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          phone: formattedPhone
        })
      })
      
      const data = await response.json()
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to send verification code')
      }
      
      setPhoneNumber(formattedPhone)
      setStep('verify')
      setResendCooldown(60) // 60 second cooldown
      
      // Start countdown
      const interval = setInterval(() => {
        setResendCooldown((prev) => {
          if (prev <= 1) {
            clearInterval(interval)
            return 0
          }
          return prev - 1
        })
      }, 1000)
      
      toast.success(`Verification code sent to ${data.maskedPhone}`)
    } catch (error) {
      console.error('SMS sending error:', error)
      setError(error instanceof Error ? error.message : 'Failed to send verification code')
    } finally {
      setIsLoading(false)
    }
  }

  const verifyCode = async () => {
    if (!verificationCode || verificationCode.length !== 6) {
      setError('Please enter a valid 6-digit code')
      return
    }

    setIsLoading(true)
    setError('')
    
    try {
      const response = await fetch('/api/auth/verify-sms', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          token,
          code: verificationCode
        })
      })
      
      const data = await response.json()
      
      if (!response.ok) {
        throw new Error(data.error || 'Invalid verification code')
      }
      
      setStep('complete')
      toast.success('Phone number verified successfully!')
      
      setTimeout(() => {
        onComplete?.()
      }, 2000)
    } catch (error) {
      console.error('SMS verification error:', error)
      setError(error instanceof Error ? error.message : 'Verification failed')
    } finally {
      setIsLoading(false)
    }
  }

  const handlePhoneSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    sendVerificationCode()
  }

  const handleCodeSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    verifyCode()
  }

  return (
    <div className="space-y-6">
      {step === 'phone' && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Phone className="h-5 w-5" />
              Phone Verification
            </CardTitle>
            <CardDescription>
              Enter your phone number to receive a verification code via SMS
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handlePhoneSubmit} className="space-y-4">
              {error && (
                <Alert variant="destructive">
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}
              
              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number</Label>
                <Input
                  id="phone"
                  type="tel"
                  placeholder="+1234567890"
                  value={phoneNumber}
                  onChange={(e) => {
                    setPhoneNumber(formatPhoneNumber(e.target.value))
                    setError('')
                  }}
                  className="text-lg"
                />
                <p className="text-sm text-gray-600">
                  Include country code (e.g., +1 for US, +44 for UK)
                </p>
              </div>
              
              <div className="flex gap-2">
                <Button 
                  type="submit" 
                  disabled={isLoading || !phoneNumber}
                  className="flex-1"
                >
                  {isLoading ? 'Sending...' : 'Send Verification Code'}
                </Button>
                <Button type="button" variant="outline" onClick={onCancel}>
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {step === 'verify' && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MessageSquare className="h-5 w-5" />
              Enter Verification Code
            </CardTitle>
            <CardDescription>
              We sent a 6-digit code to {phoneNumber}. Enter it below to verify your phone number.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleCodeSubmit} className="space-y-4">
              {error && (
                <Alert variant="destructive">
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}
              
              <div className="space-y-2">
                <Label htmlFor="verification-code">Verification Code</Label>
                <Input
                  id="verification-code"
                  placeholder="000000"
                  value={verificationCode}
                  onChange={(e) => {
                    const value = e.target.value.replace(/\D/g, '').slice(0, 6)
                    setVerificationCode(value)
                    setError('')
                  }}
                  className="text-center text-lg tracking-widest"
                  maxLength={6}
                />
              </div>
              
              <div className="flex gap-2">
                <Button 
                  type="submit" 
                  disabled={isLoading || verificationCode.length !== 6}
                  className="flex-1"
                >
                  {isLoading ? 'Verifying...' : 'Verify Phone Number'}
                </Button>
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => sendVerificationCode()}
                  disabled={resendCooldown > 0}
                >
                  {resendCooldown > 0 ? (
                    <>
                      <Clock className="h-4 w-4 mr-2" />
                      {resendCooldown}s
                    </>
                  ) : (
                    'Resend Code'
                  )}
                </Button>
              </div>
              
              <div className="text-center">
                <Button 
                  type="button" 
                  variant="ghost" 
                  onClick={() => setStep('phone')}
                  className="text-sm"
                >
                  Change phone number
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {step === 'complete' && (
        <Card className="border-green-200 bg-green-50">
          <CardContent className="pt-6 text-center">
            <CheckCircle className="h-12 w-12 text-green-600 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-green-800 mb-2">Phone Verified!</h3>
            <p className="text-sm text-green-600 mb-4">
              Your phone number {phoneNumber} has been successfully verified.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
