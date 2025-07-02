
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { AiProcessingService } from '@/lib/ai-processing'
import { ApiProvider } from '@/lib/types'

export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { provider, apiKey } = await request.json()

    if (!provider || !apiKey) {
      return NextResponse.json(
        { error: 'Provider and API key are required' },
        { status: 400 }
      )
    }

    // Test the API key
    const result = await AiProcessingService.testApiKey(provider as ApiProvider, apiKey)

    if (result.isValid) {
      return NextResponse.json({
        success: true,
        message: `${provider} API key is valid and working`
      })
    } else {
      return NextResponse.json({
        success: false,
        error: result.error || 'API key test failed'
      }, { status: 400 })
    }

  } catch (error) {
    console.error('Test API key error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
