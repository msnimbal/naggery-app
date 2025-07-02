
'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { PageHeader } from '@/components/layout/page-header'
import { Shield, AlertTriangle, FileText, Users, Lock } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-gray-900">
      <PageHeader title="Terms and Conditions" />
      
      <div className="max-w-4xl mx-auto p-4 space-y-6">
        <Card className="bg-gray-800 border-gray-700">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-gray-50">
              <FileText className="h-6 w-6 text-blue-400" />
              Terms and Conditions
            </CardTitle>
            <p className="text-gray-400 text-sm">
              Last updated: {new Date().toLocaleDateString()}
            </p>
          </CardHeader>
          <CardContent className="space-y-6 text-gray-300">
            
            {/* Introduction */}
            <section>
              <h3 className="text-lg font-semibold text-gray-200 mb-3 flex items-center gap-2">
                <Users className="h-5 w-5 text-blue-400" />
                Introduction
              </h3>
              <p className="mb-4">
                Welcome to Naggery, a personal documentation platform designed specifically to support men's mental wellbeing and emotional wellness. 
                By using our service, you agree to these terms and conditions.
              </p>
              <p>
                Naggery provides a secure, private space for documenting your thoughts, experiences, and emotional journey through text and voice entries.
              </p>
            </section>

            {/* Personal Use Only */}
            <section className="bg-amber-950/20 border border-amber-800/30 rounded-lg p-4">
              <h3 className="text-lg font-semibold text-amber-300 mb-3 flex items-center gap-2">
                <AlertTriangle className="h-5 w-5" />
                Personal Documentation Use Only
              </h3>
              <p className="text-amber-200 font-medium mb-2">
                IMPORTANT: This app is for personal documentation use only.
              </p>
              <p className="text-amber-100">
                Naggery is intended solely for your personal reflection, mental health tracking, and private documentation. 
                It is not a substitute for professional medical or psychological treatment, therapy, or counseling.
              </p>
            </section>

            {/* Privacy and Recording Laws */}
            <section className="bg-red-950/20 border border-red-800/30 rounded-lg p-4">
              <h3 className="text-lg font-semibold text-red-300 mb-3 flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Privacy Laws and Recording Consent
              </h3>
              <p className="text-red-200 font-medium mb-2">
                WARNING: Recording others without their consent may violate privacy laws.
              </p>
              <p className="text-red-100 mb-3">
                You are strictly prohibited from using Naggery to record conversations, meetings, or any audio content 
                involving other individuals without their explicit consent. Privacy laws vary by jurisdiction, and 
                unauthorized recording may constitute a criminal offense.
              </p>
              <p className="text-red-100">
                Always ensure you have proper consent before recording any content that includes other people's voices or private information.
              </p>
            </section>

            {/* User Responsibility */}
            <section>
              <h3 className="text-lg font-semibold text-gray-200 mb-3 flex items-center gap-2">
                <Lock className="h-5 w-5 text-blue-400" />
                User Responsibility and Legal Compliance
              </h3>
              <p className="text-yellow-200 font-medium mb-3">
                Users are solely responsible for compliance with local laws.
              </p>
              <ul className="space-y-2 text-gray-300">
                <li>• You are responsible for ensuring your use of Naggery complies with all applicable local, state, federal, and international laws</li>
                <li>• You must respect the privacy rights of others and obtain necessary permissions before recording or documenting information involving third parties</li>
                <li>• You agree not to use the platform for any illegal activities or to store illegal content</li>
                <li>• You are responsible for maintaining the confidentiality of your account credentials</li>
                <li>• You must immediately report any unauthorized access to your account</li>
              </ul>
            </section>

            {/* Liability Disclaimer */}
            <section className="bg-gray-750 border border-gray-600 rounded-lg p-4">
              <h3 className="text-lg font-semibold text-gray-200 mb-3">
                Limitation of Liability
              </h3>
              <p className="text-yellow-200 font-medium mb-3">
                The app and its creators are not liable for misuse.
              </p>
              <p className="text-gray-300 mb-3">
                Naggery, its developers, and associated parties shall not be held liable for:
              </p>
              <ul className="space-y-2 text-gray-300">
                <li>• Any misuse of the platform or violation of privacy laws by users</li>
                <li>• Legal consequences arising from unauthorized recording or documentation</li>
                <li>• Any damages resulting from the use or inability to use the service</li>
                <li>• Loss of data, though we implement reasonable security measures</li>
                <li>• Any decisions made based on personal documentation or AI-generated insights</li>
              </ul>
            </section>

            {/* Men's Mental Health Focus */}
            <section className="bg-blue-950/20 border border-blue-800/30 rounded-lg p-4">
              <h3 className="text-lg font-semibold text-blue-300 mb-3">
                Supporting Men's Mental Wellbeing
              </h3>
              <p className="text-blue-100 mb-3">
                Naggery is specifically designed to support men's emotional wellness and mental health journey. 
                We recognize the unique challenges men face in expressing emotions and seeking mental health support.
              </p>
              <p className="text-blue-100">
                While our platform provides tools for self-reflection and documentation, we strongly encourage users 
                to seek professional help when needed. Mental health is important, and professional support can be invaluable.
              </p>
            </section>

            {/* Data Security */}
            <section>
              <h3 className="text-lg font-semibold text-gray-200 mb-3">
                Data Security and Privacy
              </h3>
              <ul className="space-y-2 text-gray-300">
                <li>• All data is encrypted and stored securely</li>
                <li>• We implement industry-standard security measures including 2FA</li>
                <li>• Your personal entries are private and not shared with third parties</li>
                <li>• We do not sell or monetize your personal data</li>
                <li>• You have the right to delete your account and all associated data</li>
              </ul>
            </section>

            {/* Changes to Terms */}
            <section>
              <h3 className="text-lg font-semibold text-gray-200 mb-3">
                Changes to Terms
              </h3>
              <p className="text-gray-300">
                We may update these terms from time to time. Users will be notified of significant changes via email 
                or through the platform. Continued use of the service after changes constitutes acceptance of the new terms.
              </p>
            </section>

            {/* Contact */}
            <section>
              <h3 className="text-lg font-semibold text-gray-200 mb-3">
                Contact Information
              </h3>
              <p className="text-gray-300">
                If you have questions about these terms, please contact our support team through the app's contact features.
              </p>
            </section>

          </CardContent>
        </Card>

        {/* Navigation */}
        <div className="flex gap-4 justify-center">
          <Link href="/signup">
            <Button variant="outline" className="border-gray-600 text-gray-300 hover:bg-gray-700">
              Back to Signup
            </Button>
          </Link>
          <Link href="/login">
            <Button className="bg-blue-500 hover:bg-blue-600 text-white">
              I Understand - Continue to Login
            </Button>
          </Link>
        </div>
      </div>
    </div>
  )
}
