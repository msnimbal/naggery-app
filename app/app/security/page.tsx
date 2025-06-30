
'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { 
  Shield, 
  Mail, 
  Phone, 
  Key, 
  CheckCircle, 
  XCircle, 
  AlertTriangle,
  Settings,
  Download,
  Eye,
  EyeOff
} from 'lucide-react'
import { VerificationWizard } from '@/components/security/verification-wizard'
import { TwoFactorSetup } from '@/components/security/two-factor-setup'
import { PhoneVerification } from '@/components/security/phone-verification'
import { EmailVerificationNotice } from '@/components/security/email-verification-notice'
import { SecuritySettings, User } from '@/lib/types'
import { PageHeader } from '@/components/layout/page-header'
import { toast } from 'sonner'

export default function SecurityPage() {
  const { data: session, status, update } = useSession()
  const router = useRouter()
  const [securitySettings, setSecuritySettings] = useState<SecuritySettings | null>(null)
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [activeModal, setActiveModal] = useState<'email' | 'phone' | '2fa' | 'backup-codes' | null>(null)
  const [backupCodes, setBackupCodes] = useState<string[]>([])
  const [showBackupCodes, setShowBackupCodes] = useState(false)

  useEffect(() => {
    if (status === 'loading') return
    
    if (!session) {
      router.push('/login')
      return
    }

    fetchSecuritySettings()
  }, [session, status])

  const fetchSecuritySettings = async () => {
    try {
      const response = await fetch('/api/security/settings')
      const data = await response.json()

      if (response.ok) {
        setSecuritySettings(data.security)
        setUser(data.user)
      } else {
        toast.error(data.error || 'Failed to load security settings')
      }
    } catch (error) {
      console.error('Security settings error:', error)
      toast.error('Failed to load security settings')
    } finally {
      setIsLoading(false)
    }
  }

  const fetchBackupCodes = async () => {
    try {
      const response = await fetch('/api/auth/verify-2fa')
      const data = await response.json()

      if (response.ok) {
        setBackupCodes(data.backupCodes)
      } else {
        toast.error(data.error || 'Failed to load backup codes')
      }
    } catch (error) {
      console.error('Backup codes error:', error)
      toast.error('Failed to load backup codes')
    }
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

  const handleStepComplete = (step: string) => {
    setActiveModal(step as any)
  }

  const handleModalComplete = () => {
    setActiveModal(null)
    fetchSecuritySettings()
    update() // Update the session to reflect changes
  }

  const handleViewBackupCodes = async () => {
    if (backupCodes.length === 0) {
      await fetchBackupCodes()
    }
    setActiveModal('backup-codes')
  }

  if (status === 'loading' || isLoading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-400">Loading security settings...</p>
        </div>
      </div>
    )
  }

  if (!session || !securitySettings || !user) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <Alert variant="destructive" className="max-w-md">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            Failed to load security settings. Please try refreshing the page.
          </AlertDescription>
        </Alert>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-900 pb-20">
      <PageHeader title="Security Settings" />
      
      <div className="max-w-4xl mx-auto px-4 py-6 space-y-6">
        {/* Security Status Overview */}
        <Card className="bg-gray-800 border-gray-700">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-gray-50">
              <Shield className="h-5 w-5" />
              Account Security Status
            </CardTitle>
            <CardDescription className="text-gray-400">
              Overview of your account security features
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-3 gap-4">
              <div className="flex items-center gap-3 p-4 rounded-lg bg-gray-700/50">
                <div className={`p-2 rounded-full ${securitySettings.emailVerified ? 'bg-green-500/20' : 'bg-red-500/20'}`}>
                  <Mail className={`h-5 w-5 ${securitySettings.emailVerified ? 'text-green-400' : 'text-red-400'}`} />
                </div>
                <div>
                  <p className="font-medium text-gray-200">Email</p>
                  <Badge variant={securitySettings.emailVerified ? 'default' : 'destructive'} className="text-xs">
                    {securitySettings.emailVerified ? 'Verified' : 'Unverified'}
                  </Badge>
                </div>
              </div>
              
              <div className="flex items-center gap-3 p-4 rounded-lg bg-gray-700/50">
                <div className={`p-2 rounded-full ${securitySettings.phoneVerified ? 'bg-green-500/20' : 'bg-red-500/20'}`}>
                  <Phone className={`h-5 w-5 ${securitySettings.phoneVerified ? 'text-green-400' : 'text-red-400'}`} />
                </div>
                <div>
                  <p className="font-medium text-gray-200">Phone</p>
                  <Badge variant={securitySettings.phoneVerified ? 'default' : 'destructive'} className="text-xs">
                    {securitySettings.phoneVerified ? 'Verified' : 'Unverified'}
                  </Badge>
                </div>
              </div>
              
              <div className="flex items-center gap-3 p-4 rounded-lg bg-gray-700/50">
                <div className={`p-2 rounded-full ${securitySettings.twoFaEnabled ? 'bg-green-500/20' : 'bg-red-500/20'}`}>
                  <Key className={`h-5 w-5 ${securitySettings.twoFaEnabled ? 'text-green-400' : 'text-red-400'}`} />
                </div>
                <div>
                  <p className="font-medium text-gray-200">2FA</p>
                  <Badge variant={securitySettings.twoFaEnabled ? 'default' : 'destructive'} className="text-xs">
                    {securitySettings.twoFaEnabled ? 'Enabled' : 'Disabled'}
                  </Badge>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Verification Wizard */}
        {securitySettings.verificationStep !== 'complete' && (
          <VerificationWizard
            securitySettings={securitySettings}
            onStepComplete={handleStepComplete}
          />
        )}

        {/* Security Features Management */}
        <div className="grid md:grid-cols-2 gap-6">
          {/* Email Verification */}
          <Card className="bg-gray-800 border-gray-700">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-gray-50">
                <Mail className="h-5 w-5" />
                Email Verification
              </CardTitle>
              <CardDescription className="text-gray-400">
                Verify your email address for account security
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-300">Email: {user.email}</span>
                {securitySettings.emailVerified ? (
                  <CheckCircle className="h-5 w-5 text-green-400" />
                ) : (
                  <XCircle className="h-5 w-5 text-red-400" />
                )}
              </div>
              {!securitySettings.emailVerified && (
                <Button 
                  onClick={() => setActiveModal('email')} 
                  variant="outline"
                  className="w-full"
                >
                  Verify Email
                </Button>
              )}
            </CardContent>
          </Card>

          {/* Phone Verification */}
          <Card className="bg-gray-800 border-gray-700">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-gray-50">
                <Phone className="h-5 w-5" />
                Phone Verification
              </CardTitle>
              <CardDescription className="text-gray-400">
                Verify your phone number for SMS notifications
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-300">
                  Phone: {user.phone ? user.phone.replace(/(\+\d{1,3})\d{6}(\d{4})/, '$1******$2') : 'Not set'}
                </span>
                {securitySettings.phoneVerified ? (
                  <CheckCircle className="h-5 w-5 text-green-400" />
                ) : (
                  <XCircle className="h-5 w-5 text-red-400" />
                )}
              </div>
              {!securitySettings.phoneVerified && (
                <Button 
                  onClick={() => setActiveModal('phone')} 
                  variant="outline"
                  className="w-full"
                >
                  {user.phone ? 'Verify Phone' : 'Add & Verify Phone'}
                </Button>
              )}
            </CardContent>
          </Card>

          {/* Two-Factor Authentication */}
          <Card className="bg-gray-800 border-gray-700">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-gray-50">
                <Key className="h-5 w-5" />
                Two-Factor Authentication
              </CardTitle>
              <CardDescription className="text-gray-400">
                Add an extra layer of security to your account
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-300">
                  Status: {securitySettings.twoFaEnabled ? 'Enabled' : 'Disabled'}
                </span>
                {securitySettings.twoFaEnabled ? (
                  <CheckCircle className="h-5 w-5 text-green-400" />
                ) : (
                  <XCircle className="h-5 w-5 text-red-400" />
                )}
              </div>
              {!securitySettings.twoFaEnabled ? (
                <Button 
                  onClick={() => setActiveModal('2fa')} 
                  variant="outline"
                  className="w-full"
                  disabled={!securitySettings.emailVerified || !securitySettings.phoneVerified}
                >
                  Setup 2FA
                </Button>
              ) : (
                <div className="space-y-2">
                  <Button 
                    onClick={handleViewBackupCodes}
                    variant="outline"
                    size="sm"
                    className="w-full"
                  >
                    <Eye className="h-4 w-4 mr-2" />
                    View Backup Codes
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Account Security */}
          <Card className="bg-gray-800 border-gray-700">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-gray-50">
                <Settings className="h-5 w-5" />
                Account Security
              </CardTitle>
              <CardDescription className="text-gray-400">
                Additional security information
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-sm space-y-2 text-gray-300">
                <div className="flex justify-between">
                  <span>Account Status:</span>
                  <Badge variant={user.isActive ? 'default' : 'destructive'}>
                    {user.isActive ? 'Active' : 'Inactive'}
                  </Badge>
                </div>
                <div className="flex justify-between">
                  <span>Failed Login Attempts:</span>
                  <span>{user.loginAttempts}</span>
                </div>
                <div className="flex justify-between">
                  <span>Account Created:</span>
                  <span>{new Date(user.createdAt).toLocaleDateString()}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Security Tips */}
        <Alert className="bg-blue-950 border-blue-800">
          <Shield className="h-4 w-4 text-blue-400" />
          <AlertDescription className="text-blue-300">
            <strong>Security Tips:</strong> Keep your authenticator app and backup codes safe. 
            Never share your verification codes with anyone. Enable all security features for maximum protection.
          </AlertDescription>
        </Alert>
      </div>

      {/* Modals */}
      {activeModal === 'email' && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-800 rounded-lg max-w-md w-full">
            <div className="p-6">
              <EmailVerificationNotice
                email={user.email}
                onComplete={handleModalComplete}
              />
              <div className="mt-4 flex justify-end">
                <Button variant="ghost" onClick={() => setActiveModal(null)}>
                  Close
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeModal === 'phone' && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-800 rounded-lg max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <PhoneVerification
                phone={user.phone || ''}
                onComplete={handleModalComplete}
                onCancel={() => setActiveModal(null)}
              />
            </div>
          </div>
        </div>
      )}

      {activeModal === '2fa' && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-800 rounded-lg max-w-lg w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <TwoFactorSetup
                onComplete={handleModalComplete}
                onCancel={() => setActiveModal(null)}
              />
            </div>
          </div>
        </div>
      )}

      {activeModal === 'backup-codes' && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-800 rounded-lg max-w-md w-full">
            <div className="p-6">
              <h3 className="text-lg font-semibold text-gray-50 mb-4">Backup Codes</h3>
              {backupCodes.length > 0 ? (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-2 p-4 bg-gray-700 rounded-lg">
                    {backupCodes.map((code, index) => (
                      <code key={index} className="text-sm font-mono text-center p-2 bg-gray-600 rounded border">
                        {showBackupCodes ? code : '••••••••'}
                      </code>
                    ))}
                  </div>
                  <div className="flex gap-2">
                    <Button
                      onClick={() => setShowBackupCodes(!showBackupCodes)}
                      variant="outline"
                      size="sm"
                      className="flex-1"
                    >
                      {showBackupCodes ? <EyeOff className="h-4 w-4 mr-2" /> : <Eye className="h-4 w-4 mr-2" />}
                      {showBackupCodes ? 'Hide' : 'Show'} Codes
                    </Button>
                    {showBackupCodes && (
                      <Button onClick={downloadBackupCodes} variant="outline" size="sm" className="flex-1">
                        <Download className="h-4 w-4 mr-2" />
                        Download
                      </Button>
                    )}
                  </div>
                </div>
              ) : (
                <p className="text-gray-400">No backup codes available.</p>
              )}
              <div className="mt-4 flex justify-end">
                <Button variant="ghost" onClick={() => setActiveModal(null)}>
                  Close
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
