'use client'

import { useState, useMemo } from 'react'
import { motion } from 'framer-motion'
import { BookOpen, FileText, Search, Filter, ArrowLeft, Sparkles, Heart, Trophy, Target } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import Link from 'next/link'

export default function ExplorePage() {
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [searchTerm, setSearchTerm] = useState<string>('')

  const categories = [
    { id: 'all', label: 'All Categories', icon: '📚', color: 'from-blue-500 to-purple-500' },
    { id: 'success', label: '🏆 Success & Achievement', icon: '🏆', color: 'from-blue-500 to-purple-500' },
    { id: 'productivity', label: '⚡ Productivity & Motivation', icon: '⚡', color: 'from-green-500 to-emerald-500' },
    { id: 'personal', label: '🧠 Personal Development', icon: '🧠', color: 'from-purple-500 to-pink-500' }
  ]

  const books = useMemo(() => [
    {
      title: "Atomic Habits",
      description: "Small changes, remarkable results - build good habits and break bad ones",
      pdfUrl: "/Atomic-Habit.pdf",
      coverColor: "from-orange-500 to-red-500",
      category: "Success & Achievement"
    },
    {
      title: "How to Become Successful",
      description: "Essential guide to achieving success in life and career",
      pdfUrl: "/How-to-Become-Successful-in-Life.pdf",
      coverColor: "from-indigo-500 to-purple-500",
      category: "Success & Achievement"
    },
    {
      title: "Eat That Frog",
      description: "Overcome procrastination and get more done in less time",
      pdfUrl: "/Eat-That-Frog.pdf",
      coverColor: "from-green-500 to-emerald-500",
      category: "Productivity & Motivation"
    },
    {
      title: "Secret",
      description: "Discover the power of hidden knowledge and personal transformation",
      pdfUrl: "/Secret.pdf",
      coverColor: "from-purple-500 to-pink-500",
      category: "Personal Development"
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
      <div className="absolute inset-0 bg-gradient-to-br from-background via-background/95 to-primary/5">
        <motion.div
          className="absolute top-20 left-10 w-72 h-72 bg-gradient-to-r from-primary/10 to-purple-500/10 rounded-full blur-3xl"
          animate={{
            x: [0, 30, 0],
            y: [0, -20, 0],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
      </div>

      <motion.div
        className="relative bg-card/30 backdrop-blur-xl border-b border-border/50 sticky top-0 z-40"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-transparent to-purple-500/5" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-between">
            <motion.div
              className="flex items-center gap-4"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
            >
              <Button variant="ghost" asChild className="hover:bg-primary/10 transition-colors duration-300">
                <Link href="/">
                  <ArrowLeft className="w-5 h-5 mr-2" />
                  Back to Home
                </Link>
              </Button>
              <div>
                <motion.h1
                  className="text-4xl font-bold bg-gradient-to-r from-primary via-primary/80 to-purple-600 bg-clip-text text-transparent"
                  whileHover={{ scale: 1.02 }}
                  transition={{ type: "spring", stiffness: 300 }}
                >
                  Explore Books
                </motion.h1>
                <motion.p
                  className="text-muted-foreground mt-2 text-lg"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.4 }}
                >
                  Discover amazing self-help books organized by category
                </motion.p>
              </div>
            </motion.div>
            <motion.div
              className="text-right"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
            >
              <motion.div
                className="text-3xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent"
                whileHover={{ scale: 1.1 }}
                transition={{ type: "spring", stiffness: 400 }}
              >
                {filteredBooks.length}
              </motion.div>
              <div className="text-sm text-muted-foreground font-medium">Books Available</div>
            </motion.div>
          </div>
        </div>
      </motion.div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <motion.div
          initial="initial"
          animate="animate"
          className="mb-16"
        >
          <motion.div
            className="relative bg-gradient-to-br from-card/40 via-card/30 to-card/20 backdrop-blur-xl rounded-3xl p-10 border border-border/30 shadow-2xl overflow-hidden"
            whileHover={{ scale: 1.01 }}
            transition={{ type: "spring", stiffness: 300 }}
          >
            <div className="relative text-center mb-10">
              <motion.div
                className="inline-flex items-center gap-2 bg-gradient-to-r from-primary/10 to-primary/5 text-primary px-4 py-2 rounded-full text-sm font-medium mb-6 border border-primary/20"
                whileHover={{ scale: 1.05 }}
                transition={{ type: "spring", stiffness: 400 }}
              >
                <Sparkles className="w-4 h-4" />
                Find Your Perfect Book
              </motion.div>
              <motion.h2
                className="text-4xl font-bold mb-4 bg-gradient-to-r from-foreground via-foreground/90 to-foreground/80 bg-clip-text text-transparent"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                Discover Amazing Books
              </motion.h2>
            </div>

            <div className="flex flex-col lg:flex-row gap-8 items-center justify-center">
              <motion.div
                className="relative w-full lg:w-96"
                whileHover={{ scale: 1.02 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <div className="absolute inset-0 bg-gradient-to-r from-primary/5 to-purple-500/5 rounded-2xl blur-sm" />
                <div className="relative bg-card/50 backdrop-blur-sm border-2 border-border/30 rounded-2xl overflow-hidden">
                  <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-muted-foreground w-5 h-5" />
                  <Input
                    placeholder="Search books, authors, or topics..."
                    className="pl-12 h-14 text-base bg-transparent border-0 focus:ring-2 focus:ring-primary/50 rounded-2xl"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                  {searchTerm && (
                    <motion.button
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 w-6 h-6 rounded-full bg-primary/10 hover:bg-primary/20 flex items-center justify-center transition-colors duration-200"
                      onClick={() => setSearchTerm('')}
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                    >
                      <span className="text-primary text-sm font-bold">×</span>
                    </motion.button>
                  )}
                </div>
              </motion.div>

              <div className="flex gap-3 flex-wrap justify-center">
                {categories.map((category, index) => (
                  <motion.div
                    key={category.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 * index }}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Button
                      variant={selectedCategory === category.id ? "default" : "outline"}
                      onClick={() => setSelectedCategory(category.id)}
                      className={`relative gap-3 px-6 py-3 h-auto rounded-2xl transition-all duration-500 overflow-hidden ${
                        selectedCategory === category.id
                          ? 'shadow-2xl scale-105 bg-gradient-to-r from-primary to-primary/90 text-primary-foreground'
                          : 'hover:shadow-xl hover:scale-105 border-2 hover:border-primary/50 hover:bg-primary/5'
                      }`}
                    >
                      <motion.span
                        className="text-xl"
                        animate={{ rotate: selectedCategory === category.id ? [0, 10, -10, 0] : 0 }}
                        transition={{ duration: 0.5 }}
                      >
                        {category.icon}
                      </motion.span>
                      <span className="hidden sm:inline font-semibold">{category.label}</span>
                    </Button>
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>
        </motion.div>

        <motion.div
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8"
        >
          {filteredBooks.map((book, index) => (
            <motion.div
              key={`${book.title}-${index}`}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1, duration: 0.5 }}
            >
              <div className="bg-card rounded-3xl shadow-xl hover:shadow-2xl transition-all duration-500 border border-border/50 overflow-hidden group p-6">
                <div className="flex items-start gap-4 mb-6">
                  <div className={`w-16 h-20 rounded-xl bg-gradient-to-br ${book.coverColor} flex items-center justify-center flex-shrink-0`}>
                    📚
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="text-xl font-bold">{book.title}</h3>
                      <span className="px-2 py-1 bg-primary/10 text-primary text-xs rounded-full font-medium">
                        {book.category}
                      </span>
                    </div>
                    <p className="text-muted-foreground text-sm leading-relaxed">
                      {book.description}
                    </p>
                  </div>
                </div>
                <div className="flex gap-3">
                  <Button
                    className="flex-1 bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary"
                    onClick={() => window.location.href = `/read-sample?url=${encodeURIComponent(book.pdfUrl)}&title=${encodeURIComponent(book.title)}&category=${encodeURIComponent(book.category)}`}
                  >
                    <BookOpen className="w-4 h-4 mr-2" />
                    Read Now
                  </Button>
                  <Button
                    variant="outline"
                    asChild
                  >
                    <a href={book.pdfUrl} target="_blank" rel="noopener noreferrer">
                      <FileText className="w-4 h-4 mr-2" />
                      <span className="hidden sm:inline">Download</span>
                    </a>
                  </Button>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>

        {filteredBooks.length === 0 && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center py-20"
          >
            <div className="w-32 h-32 bg-muted rounded-full flex items-center justify-center mx-auto mb-8">
              📚
            </div>
            <h3 className="text-3xl font-bold mb-4">No Books Found</h3>
            <p className="text-muted-foreground text-lg mb-8 max-w-md mx-auto">
              Try adjusting your search terms or category filters.
            </p>
            <div className="flex gap-4 justify-center">
              <Button onClick={() => setSearchTerm('')}>
                <Search className="w-4 h-4 mr-2" />
                Clear Search
              </Button>
              <Button variant="outline" onClick={() => setSelectedCategory('all')}>
                <Filter className="w-4 h-4 mr-2" />
                Show All Books
              </Button>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  )
}
