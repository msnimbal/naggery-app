
'use client'

import { useState } from 'react'
import { signOut, useSession } from 'next-auth/react'
import { Download, LogOut, User, Shield, FileText, HelpCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { BottomNav } from '@/components/layout/bottom-nav'
import { PageHeader } from '@/components/layout/page-header'
import { useToast } from '@/hooks/use-toast'

export default function SettingsPage() {
  const { data: session } = useSession()
  const { toast } = useToast()
  const [isExporting, setIsExporting] = useState(false)

  const handleSignOut = async () => {
    if (confirm('Are you sure you want to sign out?')) {
      await signOut({ callbackUrl: '/login' })
    }
  }

  const handleExportData = async (format: 'PDF' | 'TXT' | 'JSON') => {
    setIsExporting(true)
    try {
      // Fetch all entries
      const response = await fetch('/api/entries?limit=1000')
      if (!response.ok) {
        throw new Error('Failed to fetch entries')
      }

      const data = await response.json()
      const entries = data.entries || []

      if (entries.length === 0) {
        toast({
          title: 'No data to export',
          description: 'You have no entries to export yet.',
          variant: 'destructive'
        })
        return
      }

      let content = ''
      let filename = ''
      let mimeType = ''

      if (format === 'JSON') {
        content = JSON.stringify(entries, null, 2)
        filename = `naggery-export-${new Date().toISOString().split('T')[0]}.json`
        mimeType = 'application/json'
      } else if (format === 'TXT') {
        content = entries.map((entry: any) => {
          const date = new Date(entry.createdAt).toLocaleString()
          const type = entry.type === 'VOICE' ? 'Voice Note' : 'Text Entry'
          const mood = entry.mood
          
          let entryContent = `Date: ${date}\n`
          entryContent += `Type: ${type}\n`
          entryContent += `Mood: ${mood}\n`
          if (entry.title) entryContent += `Title: ${entry.title}\n`
          if (entry.content) entryContent += `Content: ${entry.content}\n`
          if (entry.voiceUrl) entryContent += `Voice URL: ${entry.voiceUrl}\n`
          entryContent += '\n' + '='.repeat(50) + '\n\n'
          
          return entryContent
        }).join('')
        filename = `naggery-export-${new Date().toISOString().split('T')[0]}.txt`
        mimeType = 'text/plain'
      } else if (format === 'PDF') {
        // For PDF, we'll create a simple HTML content and let the browser handle it
        const htmlContent = `
          <!DOCTYPE html>
          <html>
          <head>
            <title>Naggery Export</title>
            <style>
              body { font-family: Arial, sans-serif; margin: 40px; }
              .entry { margin-bottom: 30px; border-bottom: 1px solid #ccc; padding-bottom: 20px; }
              .entry-header { background: #f5f5f5; padding: 10px; margin-bottom: 10px; }
              .entry-content { margin: 10px 0; }
            </style>
          </head>
          <body>
            <h1>Naggery Export</h1>
            <p>Generated on: ${new Date().toLocaleString()}</p>
            <p>Total entries: ${entries.length}</p>
            <hr>
            ${entries.map((entry: any) => `
              <div class="entry">
                <div class="entry-header">
                  <strong>Date:</strong> ${new Date(entry.createdAt).toLocaleString()}<br>
                  <strong>Type:</strong> ${entry.type === 'VOICE' ? 'Voice Note' : 'Text Entry'}<br>
                  <strong>Mood:</strong> ${entry.mood}
                  ${entry.title ? `<br><strong>Title:</strong> ${entry.title}` : ''}
                </div>
                ${entry.content ? `<div class="entry-content">${entry.content.replace(/\n/g, '<br>')}</div>` : ''}
                ${entry.voiceUrl ? `<div><strong>Voice URL:</strong> ${entry.voiceUrl}</div>` : ''}
              </div>
            `).join('')}
          </body>
          </html>
        `
        
        const blob = new Blob([htmlContent], { type: 'text/html' })
        const url = URL.createObjectURL(blob)
        const link = document.createElement('a')
        link.href = url
        link.download = `naggery-export-${new Date().toISOString().split('T')[0]}.html`
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
        URL.revokeObjectURL(url)
        
        toast({
          title: 'Export successful',
          description: 'Your data has been exported as HTML. You can print it as PDF from your browser.'
        })
        return
      }

      // Create and download file for JSON and TXT
      const blob = new Blob([content], { type: mimeType })
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = filename
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(url)

      toast({
        title: 'Export successful',
        description: `Your data has been exported as ${format}.`
      })
    } catch (error) {
      console.error('Export failed:', error)
      toast({
        title: 'Export failed',
        description: 'Something went wrong while exporting your data.',
        variant: 'destructive'
      })
    } finally {
      setIsExporting(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-900 pb-20">
      <PageHeader title="Settings" />
      
      <div className="max-w-2xl mx-auto p-4 space-y-6">
        {/* Account Section */}
        <Card className="bg-gray-800 border-gray-700">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-gray-50">
              <User className="h-5 w-5" />
              Account
            </CardTitle>
            <CardDescription className="text-gray-400">
              Your account information
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-gray-700/50 rounded-lg p-4">
              <div className="text-sm text-gray-400 mb-1">Name</div>
              <div className="text-gray-200">{session?.user?.name || 'Not set'}</div>
            </div>
            <div className="bg-gray-700/50 rounded-lg p-4">
              <div className="text-sm text-gray-400 mb-1">Email</div>
              <div className="text-gray-200">{session?.user?.email || 'Not set'}</div>
            </div>
          </CardContent>
        </Card>

        {/* Data Management Section */}
        <Card className="bg-gray-800 border-gray-700">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-gray-50">
              <FileText className="h-5 w-5" />
              Data Management
            </CardTitle>
            <CardDescription className="text-gray-400">
              Export and manage your personal data
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h4 className="font-medium text-gray-200 mb-3">Export Your Data</h4>
              <p className="text-sm text-gray-400 mb-4">
                Download all your entries in your preferred format for backup or legal documentation purposes.
              </p>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                <Button
                  variant="outline"
                  onClick={() => handleExportData('TXT')}
                  disabled={isExporting}
                  className="border-gray-600 text-gray-300 hover:bg-gray-700"
                >
                  <Download className="h-4 w-4 mr-2" />
                  Export as TXT
                </Button>
                <Button
                  variant="outline"
                  onClick={() => handleExportData('JSON')}
                  disabled={isExporting}
                  className="border-gray-600 text-gray-300 hover:bg-gray-700"
                >
                  <Download className="h-4 w-4 mr-2" />
                  Export as JSON
                </Button>
                <Button
                  variant="outline"
                  onClick={() => handleExportData('PDF')}
                  disabled={isExporting}
                  className="border-gray-600 text-gray-300 hover:bg-gray-700"
                >
                  <Download className="h-4 w-4 mr-2" />
                  Export as PDF
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Privacy & Security Section */}
        <Card className="bg-gray-800 border-gray-700">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-gray-50">
              <Shield className="h-5 w-5" />
              Privacy & Security
            </CardTitle>
            <CardDescription className="text-gray-400">
              Your data privacy and security information
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-green-900/20 border border-green-700/50 rounded-lg p-4">
              <h4 className="font-medium text-green-200 mb-2">🔒 End-to-End Privacy</h4>
              <p className="text-sm text-green-100">
                Your entries are stored securely and only accessible by you. Voice recordings and text data are encrypted and protected.
              </p>
            </div>
            <div className="bg-blue-900/20 border border-blue-700/50 rounded-lg p-4">
              <h4 className="font-medium text-blue-200 mb-2">📱 Offline Capability</h4>
              <p className="text-sm text-blue-100">
                This app works offline as a PWA. Your data is stored locally and synced when you're online.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* App Information Section */}
        <Card className="bg-gray-800 border-gray-700">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-gray-50">
              <HelpCircle className="h-5 w-5" />
              About Naggery
            </CardTitle>
            <CardDescription className="text-gray-400">
              Application information and usage
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-sm text-gray-300 space-y-2">
              <p>
                <strong>Purpose:</strong> Naggery is designed as a private documentation tool for recording personal experiences, thoughts, and observations.
              </p>
              <p>
                <strong>Legal Documentation:</strong> All entries are timestamped and can be exported for potential legal documentation purposes.
              </p>
              <p>
                <strong>Privacy First:</strong> Your data never leaves your control. All recordings and entries are stored securely and privately.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Sign Out Section */}
        <Card className="bg-gray-800 border-gray-700">
          <CardContent className="p-6">
            <Button
              variant="destructive"
              onClick={handleSignOut}
              className="w-full"
            >
              <LogOut className="h-4 w-4 mr-2" />
              Sign Out
            </Button>
          </CardContent>
        </Card>
      </div>

      <BottomNav />
    </div>
  )
}
