
'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'
import { Lock, Mail, User, Phone, CheckCircle, AlertTriangle, Users } from 'lucide-react'
import { EmailVerificationNotice } from '@/components/security/email-verification-notice'
import { GENDER_LABELS, Gender } from '@/lib/types'
import { toast } from 'sonner'

export default function SignupPage() {
  const [step, setStep] = useState<'signup' | 'verification'>('signup')
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [gender, setGender] = useState<Gender | ''>('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [termsAccepted, setTermsAccepted] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [passwordErrors, setPasswordErrors] = useState<string[]>([])
  const [createdUser, setCreatedUser] = useState<any>(null)
  const router = useRouter()

  const formatPhoneNumber = (value: string) => {
    // Remove all non-digits except +
    const cleaned = value.replace(/[^\d+]/g, '')
    
    // If it doesn't start with +, add +1 for US numbers
    if (!cleaned.startsWith('+')) {
      return cleaned ? `+1${cleaned}` : ''
    }
    
    return cleaned
  }

  const validatePassword = (password: string) => {
    const errors: string[] = []
    
    if (password.length < 8) {
      errors.push('Password must be at least 8 characters long')
    }
    
    if (!/[A-Z]/.test(password)) {
      errors.push('Password must contain at least one uppercase letter')
    }
    
    if (!/[a-z]/.test(password)) {
      errors.push('Password must contain at least one lowercase letter')
    }
    
    if (!/\d/.test(password)) {
      errors.push('Password must contain at least one number')
    }
    
    if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
      errors.push('Password must contain at least one special character')
    }

    setPasswordErrors(errors)
    return errors.length === 0
  }

  const handlePasswordChange = (value: string) => {
    setPassword(value)
    if (value) {
      validatePassword(value)
    } else {
      setPasswordErrors([])
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!name || !email || !phone || !password || !confirmPassword) {
      toast.error('Please fill in all fields')
      return
    }

    if (!gender) {
      toast.error('Please select your gender')
      return
    }

    if (!termsAccepted) {
      toast.error('You must accept the Terms and Conditions to continue')
      return
    }

    if (password !== confirmPassword) {
      toast.error('Passwords do not match')
      return
    }

    if (!validatePassword(password)) {
      toast.error('Please fix password requirements')
      return
    }

    const formattedPhone = formatPhoneNumber(phone)
    if (!/^\+[1-9]\d{1,14}$/.test(formattedPhone)) {
      toast.error('Invalid phone number format. Please include country code (e.g., +1234567890)')
      return
    }

    setIsLoading(true)

    try {
      const response = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ 
          name, 
          email, 
          password, 
          phone: formattedPhone,
          gender,
          termsAccepted: true
        })
      })

      const data = await response.json()

      if (!response.ok) {
        if (data.details && Array.isArray(data.details)) {
          // Show password validation errors
          toast.error(data.error)
          setPasswordErrors(data.details)
        } else {
          throw new Error(data.error || 'Something went wrong')
        }
        return
      }

      setCreatedUser(data.user)
      setStep('verification')
      toast.success('Account created successfully! Please verify your email to continue.')
    } catch (error: any) {
      toast.error(error.message || 'Something went wrong. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  if (step === 'verification' && createdUser) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-gray-900">
        <div className="w-full max-w-md">
          <EmailVerificationNotice 
            email={createdUser.email}
            onComplete={() => router.push('/login')}
          />
          <div className="mt-6 text-center">
            <Link href="/login" className="text-sm text-blue-400 hover:text-blue-300">
              ← Back to Login
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gray-900">
      <Card className="w-full max-w-md bg-gray-800 border-gray-700">
        <CardHeader className="text-center space-y-2">
          <div className="flex items-center justify-center w-16 h-16 bg-blue-500/10 rounded-lg mx-auto mb-4">
            <User className="h-8 w-8 text-blue-400" />
          </div>
          <CardTitle className="text-2xl font-bold text-gray-50">Join Naggery</CardTitle>
          <CardDescription className="text-gray-400">
            Supporting men's mental wellbeing through secure, private documentation
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="name" className="text-sm font-medium text-gray-200">
                Name
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <Input
                  id="name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Enter your full name"
                  className="pl-10 bg-gray-700 border-gray-600 text-gray-50"
                  disabled={isLoading}
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <label htmlFor="email" className="text-sm font-medium text-gray-200">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email"
                  className="pl-10 bg-gray-700 border-gray-600 text-gray-50"
                  disabled={isLoading}
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <label htmlFor="phone" className="text-sm font-medium text-gray-200">
                Phone Number
              </label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <Input
                  id="phone"
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(formatPhoneNumber(e.target.value))}
                  placeholder="+1234567890"
                  className="pl-10 bg-gray-700 border-gray-600 text-gray-50"
                  disabled={isLoading}
                />
              </div>
              <p className="text-xs text-gray-400">Include country code (e.g., +1 for US)</p>
            </div>

            <div className="space-y-2">
              <label htmlFor="gender" className="text-sm font-medium text-gray-200">
                Gender
              </label>
              <div className="relative">
                <Users className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400 z-10" />
                <Select value={gender} onValueChange={(value: Gender) => setGender(value)} disabled={isLoading}>
                  <SelectTrigger className="pl-10 bg-gray-700 border-gray-600 text-gray-50">
                    <SelectValue placeholder="Select your gender" />
                  </SelectTrigger>
                  <SelectContent className="bg-gray-700 border-gray-600">
                    {Object.entries(GENDER_LABELS).map(([key, label]) => (
                      <SelectItem 
                        key={key} 
                        value={key}
                        className="text-gray-50 focus:bg-gray-600 focus:text-gray-50"
                      >
                        {label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div className="space-y-2">
              <label htmlFor="password" className="text-sm font-medium text-gray-200">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => handlePasswordChange(e.target.value)}
                  placeholder="Create a strong password"
                  className="pl-10 bg-gray-700 border-gray-600 text-gray-50"
                  disabled={isLoading}
                />
              </div>
              {passwordErrors.length > 0 && (
                <Alert variant="destructive" className="mt-2">
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>
                    <ul className="text-xs space-y-1">
                      {passwordErrors.map((error, index) => (
                        <li key={index}>• {error}</li>
                      ))}
                    </ul>
                  </AlertDescription>
                </Alert>
              )}
            </div>
            
            <div className="space-y-2">
              <label htmlFor="confirmPassword" className="text-sm font-medium text-gray-200">
                Confirm Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <Input
                  id="confirmPassword"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Confirm your password"
                  className="pl-10 bg-gray-700 border-gray-600 text-gray-50"
                  disabled={isLoading}
                />
              </div>
              {confirmPassword && password !== confirmPassword && (
                <p className="text-xs text-red-400">Passwords do not match</p>
              )}
            </div>

            <div className="space-y-4">
              <div className="flex items-start space-x-3">
                <Checkbox
                  id="terms"
                  checked={termsAccepted}
                  onCheckedChange={(checked) => setTermsAccepted(checked as boolean)}
                  disabled={isLoading}
                  className="mt-1"
                />
                <div className="text-sm">
                  <label htmlFor="terms" className="text-gray-200 cursor-pointer">
                    I agree to the{' '}
                    <Link 
                      href="/terms" 
                      className="text-blue-400 hover:text-blue-300 underline"
                      target="_blank"
                    >
                      Terms and Conditions
                    </Link>
                  </label>
                  <p className="text-xs text-gray-400 mt-1">
                    Required to create an account
                  </p>
                </div>
              </div>
            </div>

            <Alert className="bg-blue-950 border-blue-800">
              <CheckCircle className="h-4 w-4 text-blue-400" />
              <AlertDescription className="text-blue-300">
                <strong>Security Features:</strong> Email verification, SMS verification, and 2FA setup required.
              </AlertDescription>
            </Alert>

            <Button
              type="submit"
              className="w-full bg-blue-500 hover:bg-blue-600 text-white"
              disabled={isLoading || passwordErrors.length > 0 || !!(confirmPassword && password !== confirmPassword) || !termsAccepted}
            >
              {isLoading ? 'Creating account...' : 'Create Secure Account'}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-400">
              Already have an account?{' '}
              <Link href="/login" className="text-blue-400 hover:text-blue-300 font-medium">
                Sign in
              </Link>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
