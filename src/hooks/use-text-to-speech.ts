'use client'

import { useState, useEffect, useRef, useCallback } from 'react'

interface TTSOptions {
  rate?: number
  pitch?: number
  volume?: number
  voice?: SpeechSynthesisVoice | null
}

interface TTSState {
  isSupported: boolean
  isSpeaking: boolean
  isPaused: boolean
  currentWord: string
  currentIndex: number
  voices: SpeechSynthesisVoice[]
  progress: number
}

export function useTextToSpeech() {
  const [state, setState] = useState<TTSState>({
    isSupported: typeof window !== 'undefined' && 'speechSynthesis' in window,
    isSpeaking: false,
    isPaused: false,
    currentWord: '',
    currentIndex: 0,
    voices: [],
    progress: 0
  })

  const [options, setOptions] = useState<TTSOptions>({
    rate: 1,
    pitch: 1,
    volume: 1,
    voice: null
  })

  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null)
  const textRef = useRef<string>('')

  // Load voices
  useEffect(() => {
    if (!state.isSupported) return

    const loadVoices = () => {
      const voices = speechSynthesis.getVoices()
      setState(prev => ({ ...prev, voices }))

      // Set default voice if none selected
      if (!options.voice && voices.length > 0) {
        const defaultVoice = voices.find(voice =>
          voice.lang.startsWith('en') && voice.name.includes('Female')
        ) || voices.find(voice => voice.lang.startsWith('en')) || voices[0]

        setOptions(prev => ({ ...prev, voice: defaultVoice }))
      }
    }

    loadVoices()
    speechSynthesis.addEventListener('voiceschanged', loadVoices)

    return () => {
      speechSynthesis.removeEventListener('voiceschanged', loadVoices)
    }
  }, [state.isSupported, options.voice])

  // Update utterance when options change
  useEffect(() => {
    if (utteranceRef.current) {
      utteranceRef.current.rate = options.rate || 1
      utteranceRef.current.pitch = options.pitch || 1
      utteranceRef.current.volume = options.volume || 1
      utteranceRef.current.voice = options.voice || null
    }
  }, [options])

  const speak = useCallback((text: string, onProgress?: (index: number, word: string) => void) => {
    if (!state.isSupported || !text.trim()) return

    // Stop any current speech
    stop()

    textRef.current = text
    const utterance = new SpeechSynthesisUtterance(text)

    // Apply options
    utterance.rate = options.rate || 1
    utterance.pitch = options.pitch || 1
    utterance.volume = options.volume || 1
    utterance.voice = options.voice || null

    // Handle speech events
    utterance.onstart = () => {
      setState(prev => ({ ...prev, isSpeaking: true, isPaused: false }))
    }

    utterance.onend = () => {
      setState(prev => ({
        ...prev,
        isSpeaking: false,
        isPaused: false,
        currentWord: '',
        currentIndex: 0,
        progress: 100
      }))
    }

    utterance.onerror = (event) => {
      console.error('TTS Error:', event)
      setState(prev => ({ ...prev, isSpeaking: false, isPaused: false }))
    }

    utterance.onboundary = (event) => {
      if (event.name === 'word' && onProgress) {
        const wordIndex = event.charIndex
        const word = text.substring(wordIndex, wordIndex + event.charLength)
        const progress = (wordIndex / text.length) * 100

        setState(prev => ({
          ...prev,
          currentWord: word,
          currentIndex: wordIndex,
          progress
        }))

        onProgress(wordIndex, word)
      }
    }

    utteranceRef.current = utterance
    speechSynthesis.speak(utterance)
  }, [state.isSupported, options])

  const pause = useCallback(() => {
    if (state.isSupported && state.isSpeaking) {
      speechSynthesis.pause()
      setState(prev => ({ ...prev, isPaused: true }))
    }
  }, [state.isSupported, state.isSpeaking])

  const resume = useCallback(() => {
    if (state.isSupported && state.isPaused) {
      speechSynthesis.resume()
      setState(prev => ({ ...prev, isPaused: false }))
    }
  }, [state.isSupported, state.isPaused])

  const stop = useCallback(() => {
    if (state.isSupported) {
      speechSynthesis.cancel()
      setState(prev => ({
        ...prev,
        isSpeaking: false,
        isPaused: false,
        currentWord: '',
        currentIndex: 0,
        progress: 0
      }))
    }
  }, [state.isSupported])

  const setVoice = useCallback((voice: SpeechSynthesisVoice) => {
    setOptions(prev => ({ ...prev, voice }))
  }, [])

  const setRate = useCallback((rate: number) => {
    setOptions(prev => ({ ...prev, rate }))
  }, [])

  const setPitch = useCallback((pitch: number) => {
    setOptions(prev => ({ ...prev, pitch }))
  }, [])

  const setVolume = useCallback((volume: number) => {
    setOptions(prev => ({ ...prev, volume }))
  }, [])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (state.isSupported) {
        speechSynthesis.cancel()
      }
    }
  }, [state.isSupported])

  return {
    // State
    ...state,

    // Options
    options,

    // Actions
    speak,
    pause,
    resume,
    stop,
    setVoice,
    setRate,
    setPitch,
    setVolume,

    // Computed
    canSpeak: state.isSupported && !state.isSpeaking,
    canPause: state.isSupported && state.isSpeaking && !state.isPaused,
    canResume: state.isSupported && state.isSpeaking && state.isPaused,
    canStop: state.isSupported && (state.isSpeaking || state.isPaused)
  }
}
