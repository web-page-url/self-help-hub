'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Volume2,
  VolumeX,
  Play,
  Pause,
  Square,
  Settings,
  ChevronUp,
  ChevronDown
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Slider } from '@/components/ui/slider'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible'

interface TTSControlsProps {
  isSupported: boolean
  isSpeaking: boolean
  isPaused: boolean
  progress: number
  voices: SpeechSynthesisVoice[]
  currentVoice: SpeechSynthesisVoice | null
  rate: number
  pitch: number
  volume: number
  onSpeak: (text: string) => void
  onPause: () => void
  onResume: () => void
  onStop: () => void
  onVoiceChange: (voice: SpeechSynthesisVoice) => void
  onRateChange: (rate: number) => void
  onPitchChange: (pitch: number) => void
  onVolumeChange: (volume: number) => void
  selectedText?: string
}

export function TTSControls({
  isSupported,
  isSpeaking,
  isPaused,
  progress,
  voices,
  currentVoice,
  rate,
  pitch,
  volume,
  onSpeak,
  onPause,
  onResume,
  onStop,
  onVoiceChange,
  onRateChange,
  onPitchChange,
  onVolumeChange,
  selectedText
}: TTSControlsProps) {
  const [isExpanded, setIsExpanded] = useState(false)

  if (!isSupported) {
    return (
      <div className="p-4 text-center text-muted-foreground">
        <VolumeX className="w-6 h-6 mx-auto mb-2 opacity-50" />
        <p className="text-sm">Text-to-speech is not supported in this browser</p>
      </div>
    )
  }

  return (
    <div className="border-t bg-muted/20">
      <div className="p-4 space-y-4">
        {/* Main Controls */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={() => setIsExpanded(!isExpanded)}
              className="gap-2"
            >
              <Settings className="w-4 h-4" />
              Voice Settings
              {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </Button>
          </div>

          <div className="flex items-center gap-2">
            {!isSpeaking ? (
              <Button
                size="sm"
                onClick={() => onSpeak(selectedText || 'Please select some text to read')}
                disabled={!selectedText?.trim()}
                className="gap-2"
              >
                <Play className="w-4 h-4" />
                Speak
              </Button>
            ) : isPaused ? (
              <Button size="sm" onClick={onResume} className="gap-2">
                <Play className="w-4 h-4" />
                Resume
              </Button>
            ) : (
              <Button size="sm" variant="secondary" onClick={onPause} className="gap-2">
                <Pause className="w-4 h-4" />
                Pause
              </Button>
            )}

            <Button size="sm" variant="outline" onClick={onStop} disabled={!isSpeaking && !isPaused}>
              <Square className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Progress Bar */}
        <AnimatePresence>
          {(isSpeaking || isPaused) && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="space-y-2"
            >
              <div className="flex items-center justify-between text-sm text-muted-foreground">
                <span>Reading Progress</span>
                <span>{Math.round(progress)}%</span>
              </div>
              <div className="w-full bg-muted rounded-full h-2">
                <motion.div
                  className="bg-primary h-2 rounded-full"
                  initial={{ width: 0 }}
                  animate={{ width: `${progress}%` }}
                  transition={{ duration: 0.3 }}
                />
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Advanced Settings */}
        <Collapsible open={isExpanded} onOpenChange={setIsExpanded}>
          <CollapsibleContent className="space-y-4">
            {/* Voice Selection */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Voice</label>
              <Select
                value={currentVoice?.name || ''}
                onValueChange={(value) => {
                  const voice = voices.find(v => v.name === value)
                  if (voice) onVoiceChange(voice)
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a voice" />
                </SelectTrigger>
                <SelectContent>
                  {voices.map((voice) => (
                    <SelectItem key={voice.name} value={voice.name}>
                      {voice.name} ({voice.lang})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Rate Control */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium">Speed</label>
                <span className="text-sm text-muted-foreground">{rate.toFixed(1)}x</span>
              </div>
              <Slider
                value={[rate]}
                onValueChange={([value]) => onRateChange(value)}
                min={0.5}
                max={2}
                step={0.1}
                className="w-full"
              />
            </div>

            {/* Pitch Control */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium">Pitch</label>
                <span className="text-sm text-muted-foreground">{pitch.toFixed(1)}</span>
              </div>
              <Slider
                value={[pitch]}
                onValueChange={([value]) => onPitchChange(value)}
                min={0}
                max={2}
                step={0.1}
                className="w-full"
              />
            </div>

            {/* Volume Control */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium">Volume</label>
                <span className="text-sm text-muted-foreground">{Math.round(volume * 100)}%</span>
              </div>
              <Slider
                value={[volume]}
                onValueChange={([value]) => onVolumeChange(value)}
                min={0}
                max={1}
                step={0.1}
                className="w-full"
              />
            </div>
          </CollapsibleContent>
        </Collapsible>
      </div>
    </div>
  )
}
