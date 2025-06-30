
'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { QrCode, Copy, Shield, Download, CheckCircle, AlertTriangle } from 'lucide-react'
import { toast } from 'sonner'
import Image from 'next/image'

interface TwoFactorSetupProps {
  onComplete?: () => void
  onCancel?: () => void
}

export function TwoFactorSetup({ onComplete, onCancel }: TwoFactorSetupProps) {
  const [step, setStep] = useState<'generate' | 'verify' | 'backup' | 'complete'>('generate')
  const [qrCodeUrl, setQrCodeUrl] = useState<string>('')
  const [secret, setSecret] = useState<string>('')
  const [backupCodes, setBackupCodes] = useState<string[]>([])
  const [verificationCode, setVerificationCode] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

  const generateTwoFactor = async () => {
    setIsLoading(true)
    setError('')
    
    try {
      const response = await fetch('/api/auth/setup-2fa', {
        method: 'GET'
      })
      
      const data = await response.json()
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to generate 2FA setup')
      }
      
      setQrCodeUrl(data.qrCodeUrl)
      setSecret(data.secret)
      setBackupCodes(data.backupCodes)
      setStep('verify')
    } catch (error) {
      console.error('2FA generation error:', error)
      setError(error instanceof Error ? error.message : 'Failed to generate 2FA setup')
    } finally {
      setIsLoading(false)
    }
  }

  const verifyTwoFactor = async () => {
    if (!verificationCode || verificationCode.length !== 6) {
      setError('Please enter a valid 6-digit code')
      return
    }

    setIsLoading(true)
    setError('')
    
    try {
      const response = await fetch('/api/auth/setup-2fa', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          code: verificationCode
        })
      })
      
      const data = await response.json()
      
      if (!response.ok) {
        throw new Error(data.error || 'Invalid verification code')
      }
      
      setStep('backup')
      toast.success('2FA enabled successfully!')
    } catch (error) {
      console.error('2FA verification error:', error)
      setError(error instanceof Error ? error.message : 'Verification failed')
    } finally {
      setIsLoading(false)
    }
  }

  const copySecret = () => {
    navigator.clipboard.writeText(secret)
    toast.success('Secret copied to clipboard')
  }

  const downloadBackupCodes = () => {
    const content = `Naggery Backup Codes\n\nThese codes can be used to access your account if you lose your phone.\nEach code can only be used once.\n\n${backupCodes.join('\n')}\n\nKeep these codes safe and secure!`
    
    const blob = new Blob([content], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'naggery-backup-codes.txt'
    a.click()
    URL.revokeObjectURL(url)
    toast.success('Backup codes downloaded')
  }

  const copyBackupCodes = () => {
    navigator.clipboard.writeText(backupCodes.join(', '))
    toast.success('Backup codes copied to clipboard')
  }

  const handleComplete = () => {
    setStep('complete')
    setTimeout(() => {
      onComplete?.()
    }, 2000)
  }

  useEffect(() => {
    generateTwoFactor()
  }, [])

  return (
    <div className="space-y-6">
      {/* Progress indicator */}
      <div className="flex items-center justify-center space-x-4">
        <div className={`flex items-center ${step === 'generate' || step === 'verify' ? 'text-blue-600' : 'text-gray-400'}`}>
          <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 ${
            step === 'generate' || step === 'verify' ? 'border-blue-600 bg-blue-50' : 'border-gray-300'
          }`}>
            {step !== 'generate' && step !== 'verify' ? 
              <CheckCircle className="w-5 h-5 text-green-600" /> : 
              <span className="text-sm font-medium">1</span>
            }
          </div>
          <span className="ml-2 text-sm font-medium">Setup</span>
        </div>
        
        <div className={`w-8 h-0.5 ${step === 'backup' || step === 'complete' ? 'bg-blue-600' : 'bg-gray-300'}`} />
        
        <div className={`flex items-center ${step === 'backup' ? 'text-blue-600' : step === 'complete' ? 'text-green-600' : 'text-gray-400'}`}>
          <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 ${
            step === 'backup' ? 'border-blue-600 bg-blue-50' : 
            step === 'complete' ? 'border-green-600 bg-green-50' : 'border-gray-300'
          }`}>
            {step === 'complete' ? 
              <CheckCircle className="w-5 h-5 text-green-600" /> : 
              <span className="text-sm font-medium">2</span>
            }
          </div>
          <span className="ml-2 text-sm font-medium">Backup Codes</span>
        </div>
      </div>

      {/* Step content */}
      {(step === 'generate' || step === 'verify') && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <QrCode className="h-5 w-5" />
              {step === 'generate' ? 'Setting up 2FA...' : 'Scan QR Code'}
            </CardTitle>
            <CardDescription>
              {step === 'generate' 
                ? 'Please wait while we generate your 2FA setup...'
                : 'Use your authenticator app to scan the QR code below'
              }
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {error && (
              <Alert variant="destructive">
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            
            {step === 'verify' && qrCodeUrl && (
              <>
                {/* QR Code */}
                <div className="flex justify-center">
                  <div className="p-4 bg-white rounded-lg border border-gray-200">
                    <Image 
                      src={qrCodeUrl} 
                      alt="2FA QR Code" 
                      width={200} 
                      height={200}
                      className="rounded"
                    />
                  </div>
                </div>

                {/* Manual entry */}
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Can't scan? Enter this code manually:</Label>
                  <div className="flex items-center gap-2">
                    <code className="flex-1 p-2 bg-gray-100 rounded text-sm font-mono break-all">
                      {secret}
                    </code>
                    <Button variant="outline" size="sm" onClick={copySecret}>
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                {/* Instructions */}
                <Alert>
                  <Shield className="h-4 w-4" />
                  <AlertDescription className="text-sm">
                    <strong>Recommended apps:</strong> Google Authenticator, Authy, Microsoft Authenticator, or 1Password.
                    After scanning, enter the 6-digit code from your app below.
                  </AlertDescription>
                </Alert>

                {/* Verification input */}
                <div className="space-y-3">
                  <Label htmlFor="verification-code">Enter verification code from your app</Label>
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
                  <div className="flex gap-2">
                    <Button 
                      onClick={verifyTwoFactor} 
                      disabled={isLoading || verificationCode.length !== 6}
                      className="flex-1"
                    >
                      {isLoading ? 'Verifying...' : 'Verify & Enable 2FA'}
                    </Button>
                    <Button variant="outline" onClick={onCancel}>
                      Cancel
                    </Button>
                  </div>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      )}

      {step === 'backup' && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Download className="h-5 w-5" />
              Save Your Backup Codes
            </CardTitle>
            <CardDescription>
              These codes can be used to access your account if you lose your authenticator device. 
              Each code can only be used once.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <Alert>
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                <strong>Important:</strong> Store these codes in a safe place. You won't be able to see them again.
              </AlertDescription>
            </Alert>
            
            <div className="grid grid-cols-2 gap-2 p-4 bg-gray-50 rounded-lg">
              {backupCodes.map((code, index) => (
                <code key={index} className="text-sm font-mono text-center p-2 bg-white rounded border">
                  {code}
                </code>
              ))}
            </div>
            
            <div className="flex gap-2">
              <Button onClick={downloadBackupCodes} variant="outline" className="flex-1">
                <Download className="h-4 w-4 mr-2" />
                Download Codes
              </Button>
              <Button onClick={copyBackupCodes} variant="outline" className="flex-1">
                <Copy className="h-4 w-4 mr-2" />
                Copy Codes
              </Button>
            </div>
            
            <Button onClick={handleComplete} className="w-full">
              I've Saved My Backup Codes
            </Button>
          </CardContent>
        </Card>
      )}

      {step === 'complete' && (
        <Card className="border-green-200 bg-green-50">
          <CardContent className="pt-6 text-center">
            <CheckCircle className="h-12 w-12 text-green-600 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-green-800 mb-2">2FA Setup Complete!</h3>
            <p className="text-sm text-green-600 mb-4">
              Your account is now protected with two-factor authentication.
            </p>
            <Badge variant="default" className="bg-green-100 text-green-800">
              Security Enhanced
            </Badge>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
