
import { AiProcessingRequest, AiProcessingResponse, ApiProvider } from '@/lib/types'

export class AiProcessingService {
  private static readonly SYSTEM_PROMPTS = {
    professional: `You are a professional documentation assistant specializing in converting personal accounts into structured, legally-relevant notes. Your task is to transform user transcriptions into clear, organized bullet points that highlight key incidents, emotions, and important details.

Focus on:
- Factual information and specific incidents
- Emotional states and reactions
- Dates, times, and contextual details
- Patterns of behavior or escalation
- Direct quotes when mentioned
- Categorizing incidents (verbal abuse, emotional manipulation, threats, etc.)

Format your response as structured notes with clear bullet points. Be empathetic but maintain professional objectivity.`,

    casual: `You are a helpful assistant that organizes personal notes. Convert the user's spoken thoughts into clear, easy-to-read bullet points that capture the main ideas and emotions.

Focus on:
- Key points and important details
- How the person was feeling
- What happened and when
- Important people or situations mentioned
- Any patterns or recurring themes

Keep the tone friendly and supportive while organizing the information clearly.`,

    legal: `You are a legal documentation specialist. Transform personal accounts into precise, factual notes suitable for legal documentation. Focus strictly on verifiable facts, specific incidents, and measurable impacts.

Prioritize:
- Specific dates, times, and locations
- Direct quotes and exact wording
- Witness information if mentioned
- Documented evidence or communications
- Patterns of behavior with specific examples
- Financial, emotional, or physical impacts
- Violations of agreements or laws

Maintain objectivity and avoid subjective interpretations. Structure information chronologically when possible.`
  }

  static async processText(
    text: string,
    provider: ApiProvider,
    apiKey: string,
    options?: AiProcessingRequest['options']
  ): Promise<AiProcessingResponse> {
    const startTime = Date.now()

    try {
      if (!text?.trim()) {
        return {
          success: false,
          error: 'No text provided for processing'
        }
      }

      if (!apiKey?.trim()) {
        return {
          success: false,
          error: 'API key not provided'
        }
      }

      const tone = options?.tone || 'professional'
      const maxBulletPoints = options?.maxBulletPoints || 15
      const includeCategories = options?.includeCategories !== false
      const includeEmotionalAnalysis = options?.includeEmotionalAnalysis !== false

      const systemPrompt = this.SYSTEM_PROMPTS[tone]
      
      const userPrompt = this.buildUserPrompt(text, {
        maxBulletPoints,
        includeCategories,
        includeEmotionalAnalysis
      })

      let response: AiProcessingResponse

      if (provider === 'OPENAI') {
        response = await this.processWithOpenAI(apiKey, systemPrompt, userPrompt)
      } else if (provider === 'CLAUDE') {
        response = await this.processWithClaude(apiKey, systemPrompt, userPrompt)
      } else {
        return {
          success: false,
          error: 'Unsupported AI provider'
        }
      }

      const processingTime = Date.now() - startTime
      
      if (response.success) {
        return {
          ...response,
          provider,
        }
      }

      return response

    } catch (error) {
      console.error('AI processing error:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to process text with AI',
        provider
      }
    }
  }

  private static buildUserPrompt(
    text: string,
    options: {
      maxBulletPoints: number
      includeCategories: boolean
      includeEmotionalAnalysis: boolean
    }
  ): string {
    let prompt = `Please analyze the following personal account and convert it into structured notes:\n\n"${text}"\n\n`

    prompt += `Instructions:
1. Create clear, organized bullet points (maximum ${options.maxBulletPoints} points)
2. Highlight key incidents, emotions, and important details
3. Extract any dates, times, or specific contexts mentioned
4. Focus on actionable or legally-relevant information`

    if (options.includeCategories) {
      prompt += `\n5. Categorize incidents (e.g., verbal abuse, emotional manipulation, threats, harassment, etc.)`
    }

    if (options.includeEmotionalAnalysis) {
      prompt += `\n6. Note emotional states and psychological impacts`
    }

    prompt += `\n\nFormat your response as clean bullet points with clear organization. Be thorough but concise.`

    return prompt
  }

  private static async processWithOpenAI(
    apiKey: string,
    systemPrompt: string,
    userPrompt: string
  ): Promise<AiProcessingResponse> {
    try {
      const response = await fetch('https://apps.abacus.ai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.ABACUSAI_API_KEY}`
        },
        body: JSON.stringify({
          model: 'gpt-4o-mini',
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: userPrompt }
          ],
          temperature: 0.3,
          max_tokens: 2000
        })
      })

      if (!response.ok) {
        const errorData = await response.text()
        throw new Error(`OpenAI API error: ${response.status} - ${errorData}`)
      }

      const data = await response.json()
      
      if (!data.choices?.[0]?.message?.content) {
        throw new Error('Invalid response from OpenAI API')
      }

      const notes = data.choices[0].message.content.trim()
      
      // Extract categories and key points from the response
      const categories = this.extractCategories(notes)
      const keyPoints = this.extractKeyPoints(notes)
      const emotionalContext = this.extractEmotionalContext(notes)

      return {
        success: true,
        notes,
        categories,
        keyPoints,
        emotionalContext: emotionalContext || undefined
      }

    } catch (error) {
      console.error('OpenAI processing error:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'OpenAI processing failed'
      }
    }
  }

  private static async processWithClaude(
    apiKey: string,
    systemPrompt: string,
    userPrompt: string
  ): Promise<AiProcessingResponse> {
    try {
      const response = await fetch('https://apps.abacus.ai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.ABACUSAI_API_KEY}`
        },
        body: JSON.stringify({
          model: 'claude-3-5-sonnet-20241022',
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: userPrompt }
          ],
          temperature: 0.3,
          max_tokens: 2000
        })
      })

      if (!response.ok) {
        const errorData = await response.text()
        throw new Error(`Claude API error: ${response.status} - ${errorData}`)
      }

      const data = await response.json()
      
      if (!data.choices?.[0]?.message?.content) {
        throw new Error('Invalid response from Claude API')
      }

      const notes = data.choices[0].message.content.trim()
      
      // Extract categories and key points from the response
      const categories = this.extractCategories(notes)
      const keyPoints = this.extractKeyPoints(notes)
      const emotionalContext = this.extractEmotionalContext(notes)

      return {
        success: true,
        notes,
        categories,
        keyPoints,
        emotionalContext: emotionalContext || undefined
      }

    } catch (error) {
      console.error('Claude processing error:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Claude processing failed'
      }
    }
  }

  private static extractCategories(notes: string): string[] {
    const categories: string[] = []
    const categoryPatterns = [
      /verbal abuse/gi,
      /emotional manipulation/gi,
      /threats/gi,
      /harassment/gi,
      /intimidation/gi,
      /gaslighting/gi,
      /financial abuse/gi,
      /isolation/gi,
      /stalking/gi,
      /physical aggression/gi
    ]

    categoryPatterns.forEach(pattern => {
      const matches = notes.match(pattern)
      if (matches) {
        const category = matches[0].toLowerCase()
        if (!categories.includes(category)) {
          categories.push(category)
        }
      }
    })

    return categories
  }

  private static extractKeyPoints(notes: string): string[] {
    // Extract bullet points from the notes
    const bulletPoints = notes
      .split('\n')
      .map(line => line.trim())
      .filter(line => line.startsWith('•') || line.startsWith('-') || line.startsWith('*') || line.match(/^\d+\./))
      .map(line => line.replace(/^[•\-*\d.]\s*/, '').trim())
      .filter(line => line.length > 10) // Filter out very short points
      .slice(0, 10) // Limit to top 10 key points

    return bulletPoints
  }

  private static extractEmotionalContext(notes: string): string | null {
    const emotionalKeywords = [
      'anxious', 'scared', 'angry', 'frustrated', 'sad', 'depressed',
      'overwhelmed', 'confused', 'helpless', 'afraid', 'worried',
      'stressed', 'upset', 'hurt', 'devastated', 'shocked'
    ]

    const foundEmotions = emotionalKeywords.filter(emotion => 
      notes.toLowerCase().includes(emotion)
    )

    if (foundEmotions.length > 0) {
      return `Emotional state includes: ${foundEmotions.join(', ')}`
    }

    return null
  }

  static async testApiKey(provider: ApiProvider, apiKey: string): Promise<{
    isValid: boolean
    error?: string
  }> {
    try {
      const testPrompt = "Please respond with exactly: 'API test successful'"
      
      const response = await this.processText(
        testPrompt,
        provider,
        apiKey,
        { tone: 'casual', maxBulletPoints: 1 }
      )

      if (response.success && response.notes?.includes('API test successful')) {
        return { isValid: true }
      }

      return { 
        isValid: false, 
        error: response.error || 'API key test failed' 
      }

    } catch (error) {
      return {
        isValid: false,
        error: error instanceof Error ? error.message : 'API key validation failed'
      }
    }
  }
}
