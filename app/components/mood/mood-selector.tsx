
'use client'

import { Mood, MOOD_EMOJIS, MOOD_LABELS } from '@/lib/types'
import { cn } from '@/lib/utils'

interface MoodSelectorProps {
  selectedMood: Mood
  onMoodSelect: (mood: Mood) => void
  className?: string
}

export function MoodSelector({ selectedMood, onMoodSelect, className }: MoodSelectorProps) {
  const moods: Mood[] = ['HAPPY', 'NEUTRAL', 'ANGRY', 'SAD', 'CONFUSED', 'FRUSTRATED', 'ANXIOUS', 'CALM']

  return (
    <div className={cn('space-y-3', className)}>
      <label className="text-sm font-medium text-gray-200">How are you feeling?</label>
      <div className="grid grid-cols-4 gap-3 sm:grid-cols-8">
        {moods.map((mood) => (
          <button
            key={mood}
            type="button"
            onClick={() => onMoodSelect(mood)}
            className={cn(
              'flex flex-col items-center justify-center p-3 rounded-lg border-2 transition-all touch-button',
              selectedMood === mood
                ? 'border-blue-400 bg-blue-400/10 text-blue-400'
                : 'border-gray-600 bg-gray-700/50 text-gray-300 hover:border-gray-500 hover:bg-gray-700'
            )}
          >
            <span className="text-2xl mb-1">{MOOD_EMOJIS[mood]}</span>
            <span className="text-xs font-medium text-center leading-tight">
              {MOOD_LABELS[mood]}
            </span>
          </button>
        ))}
      </div>
    </div>
  )
}
