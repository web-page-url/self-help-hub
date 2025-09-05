'use client'

import { useState, useEffect, useCallback } from 'react'
import { generateId } from '@/lib/utils'

export interface ReadingGoal {
  id: string
  type: 'daily_minutes' | 'daily_pages' | 'weekly_sessions' | 'monthly_books'
  target: number
  current: number
  period: 'daily' | 'weekly' | 'monthly'
  createdAt: number
  lastUpdated: number
  isActive: boolean
}

export interface ReadingStreak {
  current: number
  longest: number
  lastReadDate: string | null
  totalSessions: number
  totalMinutes: number
  totalPages: number
}

export interface ReadingSession {
  id: string
  bookId: string
  startTime: number
  endTime: number
  pagesRead: number
  minutesSpent: number
  date: string
}

export interface Milestone {
  id: string
  type: 'streak' | 'goal' | 'session' | 'pages'
  value: number
  achievedAt: number
  message: string
  celebrated: boolean
}

export function useReadingGoals() {
  const [goals, setGoals] = useState<ReadingGoal[]>([])
  const [streak, setStreak] = useState<ReadingStreak>({
    current: 0,
    longest: 0,
    lastReadDate: null,
    totalSessions: 0,
    totalMinutes: 0,
    totalPages: 0
  })
  const [sessions, setSessions] = useState<ReadingSession[]>([])
  const [milestones, setMilestones] = useState<Milestone[]>([])
  const [isLoaded, setIsLoaded] = useState(false)

  // Load data from localStorage
  useEffect(() => {
    const loadData = () => {
      try {
        const storedGoals = localStorage.getItem('selfhelphub_goals')
        const storedStreak = localStorage.getItem('selfhelphub_streak')
        const storedSessions = localStorage.getItem('selfhelphub_sessions')
        const storedMilestones = localStorage.getItem('selfhelphub_milestones')

        if (storedGoals) {
          setGoals(JSON.parse(storedGoals))
        }

        if (storedStreak) {
          setStreak(JSON.parse(storedStreak))
        }

        if (storedSessions) {
          setSessions(JSON.parse(storedSessions))
        }

        if (storedMilestones) {
          setMilestones(JSON.parse(storedMilestones))
        }
      } catch (error) {
        console.error('Failed to load reading goals data:', error)
      } finally {
        setIsLoaded(true)
      }
    }

    loadData()
  }, [])

  // Save data to localStorage
  const saveGoals = useCallback((newGoals: ReadingGoal[]) => {
    localStorage.setItem('selfhelphub_goals', JSON.stringify(newGoals))
    setGoals(newGoals)
  }, [])

  const saveStreak = useCallback((newStreak: ReadingStreak) => {
    localStorage.setItem('selfhelphub_streak', JSON.stringify(newStreak))
    setStreak(newStreak)
  }, [])

  const saveSessions = useCallback((newSessions: ReadingSession[]) => {
    localStorage.setItem('selfhelphub_sessions', JSON.stringify(newSessions))
    setSessions(newSessions)
  }, [])

  const saveMilestones = useCallback((newMilestones: Milestone[]) => {
    localStorage.setItem('selfhelphub_milestones', JSON.stringify(newMilestones))
    setMilestones(newMilestones)
  }, [])

  // Create a new goal
  const createGoal = useCallback((type: ReadingGoal['type'], target: number, period: ReadingGoal['period'] = 'daily') => {
    const newGoal: ReadingGoal = {
      id: generateId(),
      type,
      target,
      current: 0,
      period,
      createdAt: Date.now(),
      lastUpdated: Date.now(),
      isActive: true
    }

    saveGoals([...goals, newGoal])
    return newGoal
  }, [goals, saveGoals])

  // Update goal progress
  const updateGoalProgress = useCallback((goalId: string, progress: number) => {
    const updatedGoals = goals.map(goal =>
      goal.id === goalId
        ? { ...goal, current: progress, lastUpdated: Date.now() }
        : goal
    )
    saveGoals(updatedGoals)
  }, [goals, saveGoals])

  // Delete goal
  const deleteGoal = useCallback((goalId: string) => {
    const updatedGoals = goals.filter(goal => goal.id !== goalId)
    saveGoals(updatedGoals)
  }, [goals, saveGoals])

  // Start reading session
  const startReadingSession = useCallback((bookId: string) => {
    const session: ReadingSession = {
      id: generateId(),
      bookId,
      startTime: Date.now(),
      endTime: 0,
      pagesRead: 0,
      minutesSpent: 0,
      date: new Date().toISOString().split('T')[0]
    }

    setSessions(prev => [...prev, session])
    return session.id
  }, [])

  // End reading session
  const endReadingSession = useCallback((sessionId: string, pagesRead: number) => {
    const sessionIndex = sessions.findIndex(s => s.id === sessionId)
    if (sessionIndex === -1) return

    const session = sessions[sessionIndex]
    const endTime = Date.now()
    const minutesSpent = Math.round((endTime - session.startTime) / (1000 * 60))

    const updatedSession = {
      ...session,
      endTime,
      pagesRead,
      minutesSpent
    }

    const updatedSessions = [...sessions]
    updatedSessions[sessionIndex] = updatedSession
    saveSessions(updatedSessions)

    // Update streak
    updateStreak(updatedSession)

    // Update goals
    updateGoals(updatedSession)

    // Check for milestones
    checkMilestones(updatedSession)

    return updatedSession
  }, [sessions, saveSessions])

  // Update reading streak
  const updateStreak = useCallback((session: ReadingSession) => {
    const today = new Date().toISOString().split('T')[0]
    const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString().split('T')[0]

    let newStreak = { ...streak }

    if (streak.lastReadDate === yesterday || streak.lastReadDate === today) {
      // Continue streak
      if (streak.lastReadDate !== today) {
        newStreak.current += 1
      }
    } else if (streak.lastReadDate !== today) {
      // Reset streak
      newStreak.current = 1
    }

    newStreak.longest = Math.max(newStreak.longest, newStreak.current)
    newStreak.lastReadDate = today
    newStreak.totalSessions += 1
    newStreak.totalMinutes += session.minutesSpent
    newStreak.totalPages += session.pagesRead

    saveStreak(newStreak)
  }, [streak, saveStreak])

  // Update goals based on reading session
  const updateGoals = useCallback((session: ReadingSession) => {
    const today = new Date().toISOString().split('T')[0]
    const currentWeek = getWeekNumber(new Date())
    const currentMonth = new Date().getMonth()

    goals.forEach(goal => {
      if (!goal.isActive) return

      let shouldUpdate = false
      let newProgress = goal.current

      switch (goal.type) {
        case 'daily_minutes':
          if (goal.period === 'daily') {
            const todaySessions = sessions.filter(s => s.date === today)
            newProgress = todaySessions.reduce((total, s) => total + s.minutesSpent, 0) + session.minutesSpent
            shouldUpdate = true
          }
          break

        case 'daily_pages':
          if (goal.period === 'daily') {
            const todaySessions = sessions.filter(s => s.date === today)
            newProgress = todaySessions.reduce((total, s) => total + s.pagesRead, 0) + session.pagesRead
            shouldUpdate = true
          }
          break

        case 'weekly_sessions':
          if (goal.period === 'weekly') {
            const weekSessions = sessions.filter(s => getWeekNumber(new Date(s.date)) === currentWeek)
            newProgress = weekSessions.length + 1
            shouldUpdate = true
          }
          break

        case 'monthly_books':
          if (goal.period === 'monthly') {
            const monthSessions = sessions.filter(s => new Date(s.date).getMonth() === currentMonth)
            const uniqueBooks = new Set(monthSessions.map(s => s.bookId))
            newProgress = uniqueBooks.size
            shouldUpdate = true
          }
          break
      }

      if (shouldUpdate) {
        updateGoalProgress(goal.id, newProgress)
      }
    })
  }, [goals, sessions, updateGoalProgress])

  // Check for milestones
  const checkMilestones = useCallback((session: ReadingSession) => {
    const newMilestones: Milestone[] = []

    // Streak milestones
    const streakMilestones = [7, 14, 30, 50, 100]
    if (streakMilestones.includes(streak.current + 1)) {
      newMilestones.push({
        id: generateId(),
        type: 'streak',
        value: streak.current + 1,
        achievedAt: Date.now(),
        message: `${streak.current + 1} day reading streak! 🎉`,
        celebrated: false
      })
    }

    // Session milestones
    const sessionMilestones = [10, 25, 50, 100, 250, 500]
    if (sessionMilestones.includes(streak.totalSessions + 1)) {
      newMilestones.push({
        id: generateId(),
        type: 'session',
        value: streak.totalSessions + 1,
        achievedAt: Date.now(),
        message: `${streak.totalSessions + 1} reading sessions completed! 📚`,
        celebrated: false
      })
    }

    // Time milestones
    const timeMilestones = [60, 120, 300, 500, 1000]
    if (timeMilestones.includes(streak.totalMinutes + session.minutesSpent)) {
      newMilestones.push({
        id: generateId(),
        type: 'goal',
        value: streak.totalMinutes + session.minutesSpent,
        achievedAt: Date.now(),
        message: `${streak.totalMinutes + session.minutesSpent} minutes of reading! ⏰`,
        celebrated: false
      })
    }

    if (newMilestones.length > 0) {
      saveMilestones([...milestones, ...newMilestones])
    }
  }, [streak, milestones, saveMilestones])

  // Mark milestone as celebrated
  const markMilestoneCelebrated = useCallback((milestoneId: string) => {
    const updatedMilestones = milestones.map(milestone =>
      milestone.id === milestoneId
        ? { ...milestone, celebrated: true }
        : milestone
    )
    saveMilestones(updatedMilestones)
  }, [milestones, saveMilestones])

  // Get recent sessions
  const getRecentSessions = useCallback((days: number = 7) => {
    const cutoffDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000)
    return sessions.filter(session => new Date(session.date) >= cutoffDate)
  }, [sessions])

  // Get weekly stats
  const getWeeklyStats = useCallback(() => {
    const weekSessions = getRecentSessions(7)
    return {
      sessions: weekSessions.length,
      minutes: weekSessions.reduce((total, s) => total + s.minutesSpent, 0),
      pages: weekSessions.reduce((total, s) => total + s.pagesRead, 0),
      uniqueBooks: new Set(weekSessions.map(s => s.bookId)).size
    }
  }, [getRecentSessions])

  return {
    // Data
    goals,
    streak,
    sessions,
    milestones,
    isLoaded,

    // Actions
    createGoal,
    updateGoalProgress,
    deleteGoal,
    startReadingSession,
    endReadingSession,
    markMilestoneCelebrated,
    getRecentSessions,
    getWeeklyStats,

    // Computed
    activeGoals: goals.filter(g => g.isActive),
    uncelebratedMilestones: milestones.filter(m => !m.celebrated),
    completedGoals: goals.filter(g => g.current >= g.target)
  }
}

// Helper function to get week number
function getWeekNumber(date: Date): number {
  const firstDayOfYear = new Date(date.getFullYear(), 0, 1)
  const pastDaysOfYear = (date.getTime() - firstDayOfYear.getTime()) / 86400000
  return Math.ceil((pastDaysOfYear + firstDayOfYear.getDay() + 1) / 7)
}
