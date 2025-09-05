'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import {
  Flame,
  Target,
  BookOpen,
  Clock,
  Calendar,
  TrendingUp,
  Award,
  CheckCircle
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { useReadingGoals, ReadingGoal } from '@/hooks/use-reading-goals'

interface ReadingDashboardProps {
  compact?: boolean
}

export function ReadingDashboard({ compact = false }: ReadingDashboardProps) {
  const {
    streak,
    goals,
    activeGoals,
    uncelebratedMilestones,
    getWeeklyStats,
    markMilestoneCelebrated
  } = useReadingGoals()

  const weeklyStats = getWeeklyStats()

  if (compact) {
    return (
      <div className="grid grid-cols-2 gap-4">
        <motion.div
          whileHover={{ scale: 1.02 }}
          className="bg-gradient-to-br from-orange-500/10 to-red-500/10 rounded-xl p-4 border"
        >
          <div className="flex items-center gap-2 mb-2">
            <Flame className="w-5 h-5 text-orange-500" />
            <span className="text-sm font-medium">Streak</span>
          </div>
          <div className="text-2xl font-bold">{streak.current}</div>
          <div className="text-xs text-muted-foreground">days</div>
        </motion.div>

        <motion.div
          whileHover={{ scale: 1.02 }}
          className="bg-gradient-to-br from-blue-500/10 to-cyan-500/10 rounded-xl p-4 border"
        >
          <div className="flex items-center gap-2 mb-2">
            <Clock className="w-5 h-5 text-blue-500" />
            <span className="text-sm font-medium">This Week</span>
          </div>
          <div className="text-2xl font-bold">{weeklyStats.minutes}</div>
          <div className="text-xs text-muted-foreground">minutes</div>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <h2 className="text-2xl font-bold mb-2">Reading Dashboard</h2>
        <p className="text-muted-foreground">Track your progress and achievements</p>
      </div>

      {/* Main Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <motion.div whileHover={{ scale: 1.02 }}>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Current Streak</CardTitle>
              <Flame className="h-4 w-4 text-orange-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{streak.current}</div>
              <p className="text-xs text-muted-foreground">
                Longest: {streak.longest} days
              </p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div whileHover={{ scale: 1.02 }}>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Sessions</CardTitle>
              <BookOpen className="h-4 w-4 text-blue-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{streak.totalSessions}</div>
              <p className="text-xs text-muted-foreground">
                This week: {weeklyStats.sessions}
              </p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div whileHover={{ scale: 1.02 }}>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Reading Time</CardTitle>
              <Clock className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{streak.totalMinutes}</div>
              <p className="text-xs text-muted-foreground">
                This week: {weeklyStats.minutes} min
              </p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div whileHover={{ scale: 1.02 }}>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pages Read</CardTitle>
              <TrendingUp className="h-4 w-4 text-purple-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{streak.totalPages}</div>
              <p className="text-xs text-muted-foreground">
                This week: {weeklyStats.pages}
              </p>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Active Goals */}
      {activeGoals.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Target className="w-5 h-5" />
            Active Goals
          </h3>
          <div className="grid gap-4">
            {activeGoals.map((goal) => (
              <GoalProgressCard key={goal.id} goal={goal} />
            ))}
          </div>
        </div>
      )}

      {/* Recent Milestones */}
      {uncelebtratedMilestones.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Award className="w-5 h-5" />
            Recent Achievements
          </h3>
          <div className="grid gap-3">
            {uncelebtratedMilestones.slice(0, 3).map((milestone) => (
              <motion.div
                key={milestone.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="flex items-center gap-3 p-3 bg-gradient-to-r from-yellow-50 to-orange-50 dark:from-yellow-900/20 dark:to-orange-900/20 rounded-lg border"
              >
                <div className="text-2xl">🎉</div>
                <div className="flex-1">
                  <p className="font-medium">{milestone.message}</p>
                  <p className="text-sm text-muted-foreground">
                    {new Date(milestone.achievedAt).toLocaleDateString()}
                  </p>
                </div>
                <button
                  onClick={() => markMilestoneCelebrated(milestone.id)}
                  className="text-muted-foreground hover:text-foreground"
                >
                  ✕
                </button>
              </motion.div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

function GoalProgressCard({ goal }: { goal: ReadingGoal }) {
  const progress = Math.min((goal.current / goal.target) * 100, 100)
  const isCompleted = goal.current >= goal.target

  const getGoalIcon = (type: string) => {
    switch (type) {
      case 'daily_minutes':
        return '⏰'
      case 'daily_pages':
        return '📄'
      case 'weekly_sessions':
        return '📅'
      case 'monthly_books':
        return '📚'
      default:
        return '🎯'
    }
  }

  const getGoalLabel = (type: string) => {
    switch (type) {
      case 'daily_minutes':
        return 'Daily Reading Minutes'
      case 'daily_pages':
        return 'Daily Pages'
      case 'weekly_sessions':
        return 'Weekly Sessions'
      case 'monthly_books':
        return 'Monthly Books'
      default:
        return 'Goal'
    }
  }

  return (
    <motion.div
      whileHover={{ scale: 1.01 }}
      className="bg-card border rounded-lg p-4"
    >
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-3">
          <span className="text-2xl">{getGoalIcon(goal.type)}</span>
          <div>
            <h4 className="font-medium">{getGoalLabel(goal.type)}</h4>
            <p className="text-sm text-muted-foreground">
              {goal.current} / {goal.target} {goal.type.includes('minutes') ? 'min' : goal.type.includes('pages') ? 'pages' : ''}
            </p>
          </div>
        </div>
        {isCompleted && (
          <Badge variant="secondary" className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
            <CheckCircle className="w-3 h-3 mr-1" />
            Completed
          </Badge>
        )}
      </div>

      <Progress value={progress} className="h-2" />

      <div className="flex justify-between text-xs text-muted-foreground mt-2">
        <span>{Math.round(progress)}% complete</span>
        <span>
          {goal.period === 'daily' && 'Today'}
          {goal.period === 'weekly' && 'This Week'}
          {goal.period === 'monthly' && 'This Month'}
        </span>
      </div>
    </motion.div>
  )
}
