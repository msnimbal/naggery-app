
'use client'

import { useEffect } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Shield, Lock, Mic, BookOpen, Heart } from "lucide-react"

export default function LandingPage() {
  const { data: session, status } = useSession()
  const router = useRouter()

  useEffect(() => {
    if (status === "authenticated" && session) {
      router.push("/dashboard")
    }
  }, [session, status, router])

  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (status === "authenticated") {
    return null // Will redirect to dashboard
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-16 max-w-6xl">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <div className="mb-8">
            <Heart className="mx-auto h-16 w-16 text-primary mb-4" />
            <h1 className="text-4xl md:text-6xl font-bold text-foreground mb-4">
              Your Private Space
            </h1>
            <p className="text-xl md:text-2xl text-muted-foreground max-w-3xl mx-auto">
              A secure platform for men's mental wellbeing, designed for privacy and personal growth.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild size="lg" className="text-lg px-8 py-3">
              <Link href="/register">Get Started</Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="text-lg px-8 py-3">
              <Link href="/login">Sign In</Link>
            </Button>
          </div>
        </div>

        {/* Features Section */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <Lock className="h-12 w-12 text-primary mb-2" />
              <CardTitle>Privacy First</CardTitle>
              <CardDescription>
                End-to-end encryption ensures your personal data stays completely private and secure.
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <BookOpen className="h-12 w-12 text-primary mb-2" />
              <CardTitle>Personal Journaling</CardTitle>
              <CardDescription>
                Document your thoughts and experiences with our rich text editor and organize with tags.
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <Mic className="h-12 w-12 text-primary mb-2" />
              <CardTitle>Voice Recording</CardTitle>
              <CardDescription>
                Record voice notes and get AI-powered transcriptions for easy searching and reflection.
              </CardDescription>
            </CardHeader>
          </Card>
        </div>

        {/* Security Section */}
        <div className="bg-muted rounded-lg p-8 mb-16">
          <div className="text-center mb-8">
            <Shield className="mx-auto h-12 w-12 text-primary mb-4" />
            <h2 className="text-3xl font-bold text-foreground mb-4">
              Built for Security & Privacy
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Your mental health journey deserves the highest level of protection. 
              All data is encrypted and you maintain complete control over your information.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            <div className="text-center">
              <h3 className="font-semibold text-foreground mb-2">Encrypted Storage</h3>
              <p className="text-sm text-muted-foreground">
                All journal entries and voice recordings are encrypted before storage.
              </p>
            </div>
            <div className="text-center">
              <h3 className="font-semibold text-foreground mb-2">Data Control</h3>
              <p className="text-sm text-muted-foreground">
                Export your data anytime or delete your account completely.
              </p>
            </div>
            <div className="text-center">
              <h3 className="font-semibold text-foreground mb-2">GDPR Compliant</h3>
              <p className="text-sm text-muted-foreground">
                Full compliance with privacy regulations and transparent data practices.
              </p>
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="text-center">
          <h2 className="text-3xl font-bold text-foreground mb-4">
            Start Your Journey Today
          </h2>
          <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
            Take the first step towards better mental wellbeing with a platform designed for your privacy and growth.
          </p>
          <Button asChild size="lg" className="text-lg px-8 py-3">
            <Link href="/register">Create Your Account</Link>
          </Button>
        </div>
      </div>
    </div>
  )
}
