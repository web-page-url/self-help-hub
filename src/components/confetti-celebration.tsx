'use client'

import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

interface ConfettiPiece {
  id: string
  x: number
  y: number
  color: string
  size: number
  rotation: number
}

interface ConfettiCelebrationProps {
  isActive: boolean
  onComplete?: () => void
  duration?: number
  intensity?: 'low' | 'medium' | 'high'
}

export function ConfettiCelebration({
  isActive,
  onComplete,
  duration = 3000,
  intensity = 'medium'
}: ConfettiCelebrationProps) {
  const [confetti, setConfetti] = useState<ConfettiPiece[]>([])

  const colors = [
    '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7',
    '#DDA0DD', '#98D8C8', '#F7DC6F', '#BB8FCE', '#85C1E9'
  ]

  const generateConfetti = () => {
    const pieces: ConfettiPiece[] = []
    const count = intensity === 'low' ? 30 : intensity === 'medium' ? 60 : 100

    for (let i = 0; i < count; i++) {
      pieces.push({
        id: `confetti-${i}`,
        x: Math.random() * 100,
        y: -10,
        color: colors[Math.floor(Math.random() * colors.length)],
        size: Math.random() * 8 + 4,
        rotation: Math.random() * 360
      })
    }

    setConfetti(pieces)
  }

  useEffect(() => {
    if (isActive) {
      generateConfetti()

      const timer = setTimeout(() => {
        setConfetti([])
        onComplete?.()
      }, duration)

      return () => clearTimeout(timer)
    }
  }, [isActive, duration, onComplete, intensity])

  return (
    <AnimatePresence>
      {isActive && (
        <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
          {confetti.map((piece) => (
            <motion.div
              key={piece.id}
              className="absolute"
              initial={{
                x: `${piece.x}vw`,
                y: `${piece.y}vh`,
                rotate: piece.rotation,
                scale: 1
              }}
              animate={{
                y: '110vh',
                rotate: piece.rotation + 360 * 3,
                scale: [1, 1.2, 0.8]
              }}
              transition={{
                duration: 2 + Math.random() * 2,
                ease: 'easeOut',
                delay: Math.random() * 0.5
              }}
              style={{
                width: piece.size,
                height: piece.size,
                backgroundColor: piece.color,
                borderRadius: Math.random() > 0.5 ? '50%' : '2px'
              }}
            />
          ))}
        </div>
      )}
    </AnimatePresence>
  )
}

// Milestone celebration component
interface MilestoneCelebrationProps {
  milestone: {
    message: string
    type: 'streak' | 'goal' | 'session' | 'pages'
  }
  onComplete?: () => void
}

export function MilestoneCelebration({ milestone, onComplete }: MilestoneCelebrationProps) {
  const [show, setShow] = useState(true)

  useEffect(() => {
    const timer = setTimeout(() => {
      setShow(false)
      setTimeout(() => onComplete?.(), 500)
    }, 4000)

    return () => clearTimeout(timer)
  }, [onComplete])

  const getIcon = () => {
    switch (milestone.type) {
      case 'streak':
        return '🔥'
      case 'goal':
        return '🎯'
      case 'session':
        return '📚'
      case 'pages':
        return '📖'
      default:
        return '🎉'
    }
  }

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          {/* Backdrop */}
          <motion.div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          />

          {/* Celebration Modal */}
          <motion.div
            className="relative bg-background border rounded-2xl p-8 shadow-2xl max-w-md w-full text-center"
            initial={{ scale: 0.8, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.8, y: 20 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          >
            <motion.div
              className="text-6xl mb-4"
              animate={{
                scale: [1, 1.2, 1],
                rotate: [0, 10, -10, 0]
              }}
              transition={{
                duration: 1,
                repeat: 2,
                repeatDelay: 0.5
              }}
            >
              {getIcon()}
            </motion.div>

            <motion.h2
              className="text-2xl font-bold mb-2"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              Achievement Unlocked!
            </motion.h2>

            <motion.p
              className="text-muted-foreground mb-6"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              {milestone.message}
            </motion.p>

            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.4 }}
            >
              <div className="text-4xl">🎉</div>
            </motion.div>
          </motion.div>

          {/* Confetti */}
          <ConfettiCelebration
            isActive={show}
            intensity="high"
            duration={3000}
          />
        </motion.div>
      )}
    </AnimatePresence>
  )
}

// Quick achievement toast
interface AchievementToastProps {
  message: string
  onClose?: () => void
}

export function AchievementToast({ message, onClose }: AchievementToastProps) {
  const [show, setShow] = useState(true)

  useEffect(() => {
    const timer = setTimeout(() => {
      setShow(false)
      setTimeout(() => onClose?.(), 300)
    }, 3000)

    return () => clearTimeout(timer)
  }, [onClose])

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          className="fixed top-4 right-4 z-50"
          initial={{ opacity: 0, x: 300, scale: 0.8 }}
          animate={{ opacity: 1, x: 0, scale: 1 }}
          exit={{ opacity: 0, x: 300, scale: 0.8 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
        >
          <div className="bg-primary text-primary-foreground px-4 py-3 rounded-lg shadow-lg flex items-center gap-3 max-w-sm">
            <span className="text-lg">🎉</span>
            <p className="text-sm font-medium">{message}</p>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
