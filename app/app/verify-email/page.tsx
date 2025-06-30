
'use client'

import { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { CheckCircle, AlertTriangle, Mail, Loader2 } from 'lucide-react'

export default function VerifyEmailPage() {
  const [status, setStatus] = useState<'verifying' | 'success' | 'error'>('verifying')
  const [message, setMessage] = useState('')
  const router = useRouter()
  const searchParams = useSearchParams()
  const token = searchParams.get('token')

  useEffect(() => {
    if (!token) {
      setStatus('error')
      setMessage('Invalid verification link. No token provided.')
      return
    }

    verifyEmail(token)
  }, [token])

  const verifyEmail = async (token: string) => {
    try {
      const response = await fetch(`/api/auth/verify-email?token=${token}`, {
        method: 'GET'
      })

      const data = await response.json()

      if (response.ok) {
        setStatus('success')
        setMessage(data.message || 'Email verified successfully!')
        
        // Redirect to login after 3 seconds
        setTimeout(() => {
          router.push('/login?verified=true')
        }, 3000)
      } else {
        setStatus('error')
        setMessage(data.error || 'Email verification failed')
      }
    } catch (error) {
      console.error('Email verification error:', error)
      setStatus('error')
      setMessage('An error occurred while verifying your email')
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gray-900">
      <Card className="w-full max-w-md bg-gray-800 border-gray-700">
        <CardHeader className="text-center space-y-2">
          <div className="flex items-center justify-center w-16 h-16 mx-auto mb-4 rounded-lg">
            {status === 'verifying' && (
              <div className="bg-blue-500/10 rounded-lg w-full h-full flex items-center justify-center">
                <Loader2 className="h-8 w-8 text-blue-400 animate-spin" />
              </div>
            )}
            {status === 'success' && (
              <div className="bg-green-500/10 rounded-lg w-full h-full flex items-center justify-center">
                <CheckCircle className="h-8 w-8 text-green-400" />
              </div>
            )}
            {status === 'error' && (
              <div className="bg-red-500/10 rounded-lg w-full h-full flex items-center justify-center">
                <AlertTriangle className="h-8 w-8 text-red-400" />
              </div>
            )}
          </div>
          
          <CardTitle className="text-2xl font-bold text-gray-50">
            {status === 'verifying' && 'Verifying Email...'}
            {status === 'success' && 'Email Verified!'}
            {status === 'error' && 'Verification Failed'}
          </CardTitle>
          
          <CardDescription className="text-gray-400">
            {status === 'verifying' && 'Please wait while we verify your email address'}
            {status === 'success' && 'Your email has been successfully verified'}
            {status === 'error' && 'There was a problem verifying your email'}
          </CardDescription>
        </CardHeader>
        
        <CardContent className="text-center space-y-4">
          <p className={`text-sm ${
            status === 'success' ? 'text-green-300' : 
            status === 'error' ? 'text-red-300' : 'text-gray-300'
          }`}>
            {message}
          </p>
          
          {status === 'success' && (
            <div className="space-y-3">
              <div className="bg-green-950 border border-green-800 rounded-lg p-4">
                <h4 className="font-medium text-green-200 mb-2">What's Next?</h4>
                <ul className="text-sm text-green-300 space-y-1 text-left">
                  <li>• You can now log in to your account</li>
                  <li>• Next: Verify your phone number</li>
                  <li>• Finally: Set up two-factor authentication</li>
                </ul>
              </div>
              
              <p className="text-sm text-gray-400">
                You'll be redirected to login in a few seconds...
              </p>
            </div>
          )}
          
          {status === 'error' && (
            <div className="space-y-3">
              <div className="bg-red-950 border border-red-800 rounded-lg p-4">
                <h4 className="font-medium text-red-200 mb-2">Possible Reasons:</h4>
                <ul className="text-sm text-red-300 space-y-1 text-left">
                  <li>• The verification link has expired</li>
                  <li>• The link has already been used</li>
                  <li>• The verification token is invalid</li>
                </ul>
              </div>
            </div>
          )}
          
          <div className="flex gap-2 pt-4">
            <Button 
              onClick={() => router.push('/login')}
              className="flex-1 bg-blue-500 hover:bg-blue-600"
            >
              {status === 'success' ? 'Continue to Login' : 'Back to Login'}
            </Button>
            
            {status === 'error' && (
              <Button 
                onClick={() => router.push('/signup')}
                variant="outline"
                className="flex-1 border-gray-600 text-gray-300 hover:bg-gray-700"
              >
                Sign Up Again
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
