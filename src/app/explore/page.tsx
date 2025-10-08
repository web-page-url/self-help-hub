'use client'

import { useState, useMemo, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { BookOpen, FileText, Search, Filter, ArrowLeft, Sparkles, Heart, Trophy, Target, Star, Zap, Flame, Rocket, Gem, Crown, Wand2, Eye, Brain, Lightbulb, Award } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import Link from 'next/link'

// Floating Particles Component
const FloatingParticles = () => {
  const particles = Array.from({ length: 50 }, (_, i) => ({
    id: i,
    x: Math.random() * 100,
    y: Math.random() * 100,
    size: Math.random() * 4 + 2,
    duration: Math.random() * 20 + 10,
    delay: Math.random() * 5,
  }))

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {particles.map((particle) => (
        <motion.div
          key={particle.id}
          className="absolute rounded-full bg-gradient-to-r from-primary/20 to-purple-500/20"
          style={{
            width: particle.size,
            height: particle.size,
            left: `${particle.x}%`,
            top: `${particle.y}%`,
          }}
          animate={{
            y: [-20, -100],
            opacity: [0, 1, 0],
            scale: [0.5, 1, 0.5],
          }}
          transition={{
            duration: particle.duration,
            delay: particle.delay,
            repeat: Infinity,
            ease: "easeOut",
          }}
        />
      ))}
    </div>
  )
}

export default function ExplorePage() {
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [searchTerm, setSearchTerm] = useState<string>('')
  const [isLoaded, setIsLoaded] = useState(false)
  const [hoveredBook, setHoveredBook] = useState<string | null>(null)

  useEffect(() => {
    setIsLoaded(true)
  }, [])

  const categories = [
    {
      id: 'all',
      name: 'All Categories',
      icon: '🌟',
      color: 'from-violet-500 via-purple-500 to-pink-500',
      glowColor: 'shadow-violet-500/50',
      description: 'Explore everything'
    },
    {
      id: 'success',
      name: 'Success & Achievement',
      icon: '🏆',
      color: 'from-amber-400 via-orange-500 to-red-500',
      glowColor: 'shadow-amber-500/50',
      description: 'Rise to greatness'
    },
    {
      id: 'productivity',
      name: 'Productivity & Motivation',
      icon: '⚡',
      color: 'from-emerald-400 via-green-500 to-teal-500',
      glowColor: 'shadow-emerald-500/50',
      description: 'Unleash your potential'
    },
    {
      id: 'personal',
      name: 'Personal Development',
      icon: '🧠',
      color: 'from-cyan-400 via-blue-500 to-indigo-500',
      glowColor: 'shadow-cyan-500/50',
      description: 'Transform yourself'
    }
  ]

  const books = useMemo(() => [
    {
      title: "Atomic Habits",
      description: "Small changes, remarkable results - build good habits and break bad ones",
      pdfUrl: "/Atomic-Habit.pdf",
      coverColor: "from-amber-400 via-orange-500 to-red-500",
      category: "Success & Achievement",
      rating: 4.8,
      icon: "⚡",
      glowColor: "shadow-amber-500/30",
      author: "James Clear"
    },
    {
      title: "How to Become Successful",
      description: "Essential guide to achieving success in life and career",
      pdfUrl: "/How-to-Become-Successful-in-Life.pdf",
      coverColor: "from-violet-400 via-purple-500 to-indigo-500",
      category: "Success & Achievement",
      rating: 4.9,
      icon: "🚀",
      glowColor: "shadow-violet-500/30",
      author: "Success Masters"
    },
    {
      title: "Eat That Frog",
      description: "Overcome procrastination and get more done in less time",
      pdfUrl: "/Eat-That-Frog.pdf",
      coverColor: "from-emerald-400 via-green-500 to-teal-500",
      category: "Productivity & Motivation",
      rating: 4.7,
      icon: "🐸",
      glowColor: "shadow-emerald-500/30",
      author: "Brian Tracy"
    },
    {
      title: "Secret",
      description: "Discover the power of hidden knowledge and personal transformation",
      pdfUrl: "/Secret.pdf",
      coverColor: "from-cyan-400 via-blue-500 to-indigo-500",
      category: "Personal Development",
      rating: 4.6,
      icon: "🔮",
      glowColor: "shadow-cyan-500/30",
      author: "Rhonda Byrne"
    }
  ], [])

  const filteredBooks = useMemo(() => {
    return books.filter(book => {
      const matchesCategory = selectedCategory === 'all' ||
        (selectedCategory === 'success' && book.category === 'Success & Achievement') ||
        (selectedCategory === 'productivity' && book.category === 'Productivity & Motivation') ||
        (selectedCategory === 'personal' && book.category === 'Personal Development')

      const searchLower = searchTerm.toLowerCase()
      const matchesSearch = searchTerm === '' ||
        book.title.toLowerCase().includes(searchLower) ||
        book.description.toLowerCase().includes(searchLower) ||
        book.category.toLowerCase().includes(searchLower)

      return matchesCategory && matchesSearch
    })
  }, [selectedCategory, searchTerm, books])

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Dynamic Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-slate-950 via-purple-950/20 to-slate-950">
        <motion.div
          className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-violet-500/10 via-transparent to-cyan-500/10"
          animate={{
            background: [
              "linear-gradient(45deg, rgba(139, 92, 246, 0.1), transparent, rgba(6, 182, 212, 0.1))",
              "linear-gradient(135deg, rgba(6, 182, 212, 0.1), transparent, rgba(139, 92, 246, 0.1))",
              "linear-gradient(225deg, rgba(139, 92, 246, 0.1), transparent, rgba(6, 182, 212, 0.1))",
              "linear-gradient(315deg, rgba(6, 182, 212, 0.1), transparent, rgba(139, 92, 246, 0.1))"
            ]
          }}
          transition={{
            duration: 12,
            repeat: Infinity,
            ease: "linear"
          }}
        />

        {/* Floating Particles */}
        <FloatingParticles />

        {/* Animated Orbs */}
        <motion.div
          className="absolute top-20 left-10 w-96 h-96 bg-gradient-to-r from-violet-500/20 to-cyan-500/20 rounded-full blur-3xl"
          animate={{
            x: [0, 50, 0],
            y: [0, -30, 0],
            scale: [1, 1.2, 1],
          }}
          transition={{
            duration: 10,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
        <motion.div
          className="absolute bottom-20 right-10 w-80 h-80 bg-gradient-to-r from-pink-500/20 to-orange-500/20 rounded-full blur-3xl"
          animate={{
            x: [0, -40, 0],
            y: [0, 25, 0],
            scale: [1, 1.3, 1],
          }}
          transition={{
            duration: 12,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 2
          }}
        />
      </div>

      {/* Enhanced Header */}
      <motion.div
        className="relative bg-black/20 backdrop-blur-2xl border-b border-white/10 sticky top-0 z-50"
        initial={{ opacity: 0, y: -50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1, type: "spring", stiffness: 100 }}
      >
        <div className="absolute inset-0 bg-gradient-to-r from-violet-500/5 via-transparent to-cyan-500/5" />
        <div className="absolute inset-0 bg-gradient-to-b from-white/5 to-transparent" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-between">
            <motion.div
              className="flex items-center gap-6"
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3, type: "spring", stiffness: 200 }}
            >
              <motion.div
                whileHover={{ scale: 1.1, rotate: 5 }}
                whileTap={{ scale: 0.95 }}
              >
                <Button
                  variant="ghost"
                  asChild
                  className="bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 transition-all duration-300 backdrop-blur-sm"
                >
                  <Link href="/">
                    <ArrowLeft className="w-5 h-5 mr-2" />
                    Back to Home
                  </Link>
                </Button>
              </motion.div>

              <div className="space-y-2">
                <motion.div
                  className="flex items-center gap-3"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 }}
                >
                  <motion.div
                    animate={{ rotate: [0, 10, -10, 0] }}
                    transition={{ duration: 2, repeat: Infinity, delay: 1 }}
                  >
                    <Sparkles className="w-8 h-8 text-yellow-400" />
                  </motion.div>
                  <motion.h1
                    className="text-5xl font-black bg-gradient-to-r from-white via-purple-200 to-cyan-200 bg-clip-text text-transparent"
                    whileHover={{ scale: 1.05 }}
                    transition={{ type: "spring", stiffness: 300 }}
                  >
                    Explore Books
                  </motion.h1>
                </motion.div>

                <motion.p
                  className="text-white/80 text-lg font-medium"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.7 }}
                >
                  🚀 Transform your life with mind-blowing knowledge
                </motion.p>
              </div>
            </motion.div>

            <motion.div
              className="text-right space-y-2"
              initial={{ opacity: 0, x: 50, scale: 0.8 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              transition={{ delay: 0.4, type: "spring", stiffness: 200 }}
            >
              <motion.div
                className="flex items-center justify-center gap-2 bg-gradient-to-r from-violet-500 to-cyan-500 rounded-full px-6 py-3 shadow-2xl shadow-violet-500/25"
                whileHover={{ scale: 1.1, boxShadow: "0 25px 50px -12px rgba(139, 92, 246, 0.5)" }}
                transition={{ type: "spring", stiffness: 400 }}
              >
                <motion.div
                  className="text-4xl font-black text-white"
                  animate={{ scale: [1, 1.1, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  {filteredBooks.length}
                </motion.div>
                <div className="text-white/90 font-bold">Books</div>
              </motion.div>

              <motion.div
                className="text-sm text-white/60 font-medium"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.6 }}
              >
                Ready to inspire you
              </motion.div>
            </motion.div>
          </div>
        </div>
      </motion.div>

      {/* Main Content */}
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.2 }}
          className="mb-20"
        >
          {/* Hero Section */}
          <motion.div
            className="relative bg-gradient-to-br from-white/10 via-white/5 to-white/10 backdrop-blur-2xl rounded-3xl p-12 border border-white/20 shadow-2xl overflow-hidden"
            whileHover={{ scale: 1.02, boxShadow: "0 50px 100px -20px rgba(255, 255, 255, 0.1)" }}
            transition={{ type: "spring", stiffness: 300 }}
          >
            {/* Background Effects */}
            <div className="absolute inset-0 bg-gradient-to-br from-violet-500/5 via-transparent to-cyan-500/5" />
            <motion.div
              className="absolute top-0 left-0 w-full h-full bg-gradient-to-r from-transparent via-white/5 to-transparent"
              animate={{ x: [-100, 100] }}
              transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
            />

            <div className="relative text-center mb-12"              >
                <motion.div
                  className="inline-flex items-center gap-3 bg-gradient-to-r from-yellow-400/20 to-orange-500/20 text-yellow-300 px-6 py-3 rounded-full text-lg font-bold mb-8 border border-yellow-400/30 backdrop-blur-sm"
                  whileHover={{ scale: 1.1, boxShadow: "0 10px 30px -10px rgba(251, 191, 36, 0.5)" }}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ type: "spring", stiffness: 400, delay: 0.5 }}
              >
                <motion.div
                  animate={{ rotate: [0, 360] }}
                  transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                >
                  <Sparkles className="w-6 h-6" />
                </motion.div>
                🎯 Find Your Perfect Book
              </motion.div>

              <motion.h2
                className="text-6xl font-black mb-6 bg-gradient-to-r from-white via-purple-200 to-cyan-200 bg-clip-text text-transparent"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.7 }}
                whileHover={{ scale: 1.02 }}
              >
                Discover Mind-Blowing Books
              </motion.h2>

              <motion.p
                className="text-xl text-white/80 font-medium max-w-2xl mx-auto"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.9 }}
              >
                Unleash your potential with life-transforming knowledge that will blow your mind! 🚀✨
              </motion.p>
            </div>

            <div className="flex flex-col gap-12 items-center justify-center w-full">
              {/* Enhanced Search */}
              <motion.div
                className="relative w-full xl:w-96"
                whileHover={{ scale: 1.05 }}
                initial={{ opacity: 0, x: -50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ type: "spring", stiffness: 300, delay: 1.1 }}
              >
                <div className="absolute inset-0 bg-gradient-to-r from-violet-500/20 to-cyan-500/20 rounded-3xl blur-xl" />
                <div className="relative bg-white/10 backdrop-blur-xl border-2 border-white/20 rounded-3xl overflow-hidden shadow-2xl">
                  <motion.div
                    className="absolute left-6 top-1/2 transform -translate-y-1/2"
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  >
                    <Search className="w-6 h-6 text-white/80" />
                  </motion.div>
                  <Input
                    placeholder="🔍 Search mind-blowing books..."
                    className="pl-16 h-16 text-lg bg-transparent border-0 text-white placeholder-white/60 focus:ring-2 focus:ring-yellow-400/50 rounded-3xl"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                  {searchTerm && (
                    <motion.button
                      className="absolute right-4 top-1/2 transform -translate-y-1/2 w-8 h-8 rounded-full bg-red-500/20 hover:bg-red-500/30 border border-red-400/30 flex items-center justify-center transition-all duration-300"
                      onClick={() => setSearchTerm('')}
                      whileHover={{ scale: 1.2, rotate: 90 }}
                      whileTap={{ scale: 0.9 }}
                    >
                      <span className="text-red-400 text-lg font-bold">×</span>
                    </motion.button>
                  )}
                </div>
              </motion.div>

              {/* Enhanced Categories */}
              <motion.div
                className="grid grid-cols-2 lg:grid-cols-4 gap-4 w-full max-w-4xl"
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.3 }}
              >
                {categories.map((category, index) => (
                  <motion.div
                    key={category.id}
                    initial={{ opacity: 0, scale: 0.8, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    transition={{ delay: 1.4 + (index * 0.1), type: "spring", stiffness: 200 }}
                    whileHover={{ scale: 1.1, y: -5 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Button
                      variant={selectedCategory === category.id ? "default" : "outline"}
                      onClick={() => setSelectedCategory(category.id)}
                      className={`relative px-6 py-6 h-auto min-h-[120px] rounded-2xl transition-all duration-500 overflow-hidden group ${
                        selectedCategory === category.id
                          ? `bg-gradient-to-r ${category.color} text-white shadow-2xl ${category.glowColor} scale-105 border-2 border-white/30`
                          : 'bg-white/5 hover:bg-white/10 border-2 border-white/20 hover:border-white/40 text-white/90 hover:text-white backdrop-blur-sm'
                      }`}
                    >
                      <div className="flex flex-col items-center gap-2">
                        <motion.span
                          className="text-3xl"
                          animate={{
                            rotate: selectedCategory === category.id ? [0, 15, -15, 0] : 0,
                            scale: selectedCategory === category.id ? [1, 1.2, 1] : 1,
                            y: selectedCategory === category.id ? [0, -2, 0] : 0
                          }}
                          transition={{ duration: 0.6 }}
                        >
                          {category.icon}
                        </motion.span>
                        <div className="text-center">
                          <div className="font-bold text-sm leading-tight">{category.name}</div>
                          <div className="text-xs opacity-80 mt-1">{category.description}</div>
                        </div>
                      </div>

                      {selectedCategory === category.id && (
                        <motion.div
                          className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
                          animate={{ x: [-100, 100] }}
                          transition={{ duration: 1.5, repeat: Infinity }}
                        />
                      )}
                    </Button>
                  </motion.div>
                ))}
              </motion.div>
            </div>
          </motion.div>
        </motion.div>

        {/* Mind-Blowing Book Cards */}
        <motion.div
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-10"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.8 }}
        >
          {filteredBooks.map((book, index) => (
            <motion.div
              key={`${book.title}-${index}`}
              initial={{ opacity: 0, y: 50, scale: 0.8 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ delay: 2 + (index * 0.15), type: "spring", stiffness: 200 }}
              whileHover={{ y: -10, scale: 1.05 }}
              className="group"
              onHoverStart={() => setHoveredBook(book.title)}
              onHoverEnd={() => setHoveredBook(null)}
            >
              <div className="relative bg-gradient-to-br from-white/10 via-white/5 to-white/10 backdrop-blur-2xl rounded-3xl shadow-2xl hover:shadow-3xl transition-all duration-700 border border-white/20 overflow-hidden p-8 group-hover:border-white/40">

                {/* Background Glow Effect */}
                <div className={`absolute inset-0 bg-gradient-to-br ${book.coverColor} opacity-0 group-hover:opacity-20 transition-opacity duration-500 rounded-3xl`} />

                {/* Animated Border */}
                <motion.div
                  className="absolute inset-0 rounded-3xl"
                  style={{
                    background: `conic-gradient(from 0deg, ${book.coverColor.split(' ')[1]}, transparent, ${book.coverColor.split(' ')[3]})`,
                  }}
                  animate={{ rotate: 360 }}
                  transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
                  initial={{ opacity: 0 }}
                  whileHover={{ opacity: 0.3 }}
                />

                {/* Floating Elements */}
                <motion.div
                  className="absolute top-4 right-4 text-4xl"
                  animate={{
                    y: [0, -5, 0],
                    rotate: [0, 5, 0]
                  }}
                  transition={{
                    duration: 3,
                    repeat: Infinity,
                    delay: index * 0.5
                  }}
                >
                  {book.icon}
                </motion.div>

                <div className="relative z-10">
                  {/* Book Cover */}
                  <motion.div
                    className={`w-20 h-24 rounded-2xl bg-gradient-to-br ${book.coverColor} flex items-center justify-center mb-6 shadow-2xl ${book.glowColor} group-hover:scale-110 transition-transform duration-500`}
                    whileHover={{ rotate: [0, -5, 5, 0] }}
                    transition={{ duration: 0.6 }}
                  >
                    <span className="text-3xl">📖</span>
                  </motion.div>

                  {/* Book Info */}
                  <div className="space-y-4">
                    <div>
                      <motion.h3
                        className="text-2xl font-black text-white mb-2 group-hover:text-yellow-300 transition-colors duration-300"
                        whileHover={{ scale: 1.05 }}
                      >
                        {book.title}
                      </motion.h3>

                      <motion.p
                        className="text-white/70 text-sm leading-relaxed mb-3"
                        initial={{ opacity: 0.8 }}
                        whileHover={{ opacity: 1 }}
                      >
                        {book.description}
                      </motion.p>

                      <motion.div
                        className="flex items-center gap-2 mb-2"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 2.2 + (index * 0.1) }}
                      >
                        <span className="text-xs text-white/60">by</span>
                        <span className="text-sm font-semibold text-white/90">{book.author}</span>
                      </motion.div>
                    </div>

                    {/* Rating */}
                    <motion.div
                      className="flex items-center gap-2 mb-4"
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ delay: 2.4 + (index * 0.1), type: "spring" }}
                    >
                      <div className="flex items-center gap-1">
                        {Array.from({ length: 5 }, (_, i) => (
                          <motion.div
                            key={i}
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ delay: 2.5 + (index * 0.1) + (i * 0.1) }}
                          >
                            <Star
                              className={`w-4 h-4 ${
                                i < Math.floor(book.rating)
                                  ? 'text-yellow-400 fill-yellow-400'
                                  : 'text-white/30'
                              }`}
                            />
                          </motion.div>
                        ))}
                      </div>
                      <span className="text-sm font-bold text-yellow-400">{book.rating}</span>
                    </motion.div>

                    {/* Category Badge */}
                    <motion.div
                      className={`inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r ${book.coverColor} rounded-full text-white text-xs font-bold shadow-lg`}
                      whileHover={{ scale: 1.1 }}
                      transition={{ type: "spring", stiffness: 400 }}
                    >
                      <span>{book.category.split(' ')[0]}</span>
                      <span className="text-xs opacity-80">&</span>
                      <span>{book.category.split(' ')[1]}</span>
                    </motion.div>
                  </div>

                  {/* Action Buttons */}
                  <motion.div
                    className="flex gap-3 mt-6"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 2.6 + (index * 0.1) }}
                  >
                    <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                      <Button
                        className={`flex-1 bg-gradient-to-r ${book.coverColor} hover:opacity-90 text-white font-bold shadow-2xl ${book.glowColor} border-2 border-white/20`}
                        onClick={() => window.location.href = `/read-sample?url=${encodeURIComponent(book.pdfUrl)}&title=${encodeURIComponent(book.title)}&category=${encodeURIComponent(book.category)}`}
                    >
                        <BookOpen className="w-5 h-5 mr-2" />
                        <span className="hidden sm:inline">Read Now</span>
                        <span className="sm:hidden">Read</span>
                      </Button>
                    </motion.div>

                    <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                      <Button
                        variant="outline"
                        asChild
                        className="bg-white/10 border-2 border-white/30 hover:bg-white/20 hover:border-white/50 text-white backdrop-blur-sm"
                      >
                        <a href={book.pdfUrl} target="_blank" rel="noopener noreferrer">
                          <FileText className="w-5 h-5 mr-2" />
                          <span className="hidden sm:inline">Download</span>
                          <span className="sm:hidden">Get</span>
                        </a>
                      </Button>
                    </motion.div>
                  </motion.div>
                </div>

                {/* Hover Effects */}
                <AnimatePresence>
                  {hoveredBook === book.title && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.8 }}
                      className="absolute inset-0 bg-gradient-to-br from-yellow-400/10 to-orange-500/10 rounded-3xl pointer-events-none"
                    />
                  )}
                </AnimatePresence>
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* Mind-Blowing Empty State */}
        {filteredBooks.length === 0 && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: 50 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ type: "spring", stiffness: 200 }}
            className="text-center py-32"
          >
            <motion.div
              className="relative mx-auto mb-12"
              animate={{ rotate: [0, 5, -5, 0] }}
              transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
            >
              <div className="w-48 h-48 bg-gradient-to-br from-violet-500/20 to-cyan-500/20 rounded-full flex items-center justify-center backdrop-blur-xl border-2 border-white/20 shadow-2xl">
                <motion.div
                  className="text-8xl"
                  animate={{ scale: [1, 1.1, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  🚀
                </motion.div>
              </div>

              {/* Floating particles around the emoji */}
              {Array.from({ length: 8 }, (_, i) => (
                <motion.div
                  key={i}
                  className="absolute w-3 h-3 bg-yellow-400 rounded-full"
                  style={{
                    top: `${20 + Math.sin(i * 45 * Math.PI / 180) * 80}px`,
                    left: `${20 + Math.cos(i * 45 * Math.PI / 180) * 80}px`,
                  }}
                  animate={{
                    scale: [0, 1, 0],
                    opacity: [0, 1, 0],
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    delay: i * 0.2,
                  }}
                />
              ))}
            </motion.div>

            <motion.h3
              className="text-5xl font-black mb-6 bg-gradient-to-r from-white via-purple-200 to-cyan-200 bg-clip-text text-transparent"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              No Mind-Blowing Books Found
            </motion.h3>

            <motion.p
              className="text-white/80 text-xl font-medium mb-12 max-w-2xl mx-auto"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              🌟 The universe is vast! Let&apos;s find the perfect knowledge to transform your reality!
            </motion.p>

            <motion.div
              className="flex flex-col sm:flex-row gap-6 justify-center items-center"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
            >
              <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.95 }}>
                <Button
                  onClick={() => setSearchTerm('')}
                  className="bg-gradient-to-r from-violet-500 to-cyan-500 hover:from-violet-600 hover:to-cyan-600 text-white font-bold px-8 py-4 shadow-2xl shadow-violet-500/25 border-2 border-white/20"
                >
                  <Search className="w-5 h-5 mr-3" />
                  Clear Cosmic Search
                </Button>
              </motion.div>

              <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.95 }}>
                <Button
                  variant="outline"
                  onClick={() => setSelectedCategory('all')}
                  className="bg-white/10 border-2 border-white/30 hover:bg-white/20 hover:border-white/50 text-white backdrop-blur-sm px-8 py-4 font-bold"
                >
                  <Filter className="w-5 h-5 mr-3" />
                  Explore All Realms
                </Button>
              </motion.div>
            </motion.div>

            {/* Decorative elements */}
            <motion.div
              className="mt-16 flex justify-center gap-4"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.8 }}
            >
              {['✨', '🚀', '🧠', '💫', '🎯', '🌟'].map((emoji, i) => (
                <motion.div
                  key={i}
                  className="text-3xl"
                  animate={{
                    y: [0, -10, 0],
                    rotate: [0, 10, -10, 0],
                  }}
                  transition={{
                    duration: 3,
                    repeat: Infinity,
                    delay: i * 0.2,
                  }}
                >
                  {emoji}
                </motion.div>
              ))}
            </motion.div>
          </motion.div>
        )}
      </div>
    </div>
  )
}
