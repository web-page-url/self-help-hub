'use client'

import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Search, Book as BookIcon, FileText, Bookmark, X, ArrowRight } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { searchEngine, SearchResult, debounce } from '@/lib/search'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { bookStorage, annotationStorage } from '@/lib/storage'
import { Book, Annotation } from '@/types'

interface CommandPaletteProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function CommandPalette({ open, onOpenChange }: CommandPaletteProps) {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<SearchResult[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [selectedIndex, setSelectedIndex] = useState(0)
  const router = useRouter()

  // Initialize search engine
  useEffect(() => {
    const initializeSearch = async () => {
      try {
        const [books, annotations] = await Promise.all([
          bookStorage.getAll(),
          annotationStorage.getAll()
        ])
        await searchEngine.initialize(books, annotations)
      } catch (error) {
        console.error('Failed to initialize search:', error)
      }
    }

    if (open) {
      initializeSearch()
    }
  }, [open])

  // Debounced search
  const debouncedSearch = useCallback(
    debounce(async (searchQuery: string) => {
      if (!searchQuery.trim()) {
        setResults([])
        setIsLoading(false)
        return
      }

      setIsLoading(true)
      try {
        const searchResults = await searchEngine.search(searchQuery, 8)
        setResults(searchResults)
        setSelectedIndex(0)
      } catch (error) {
        console.error('Search failed:', error)
        setResults([])
      } finally {
        setIsLoading(false)
      }
    }, 300),
    []
  )

  useEffect(() => {
    debouncedSearch(query)
  }, [query, debouncedSearch])

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!open) return

      switch (e.key) {
        case 'Escape':
          onOpenChange(false)
          break
        case 'ArrowDown':
          e.preventDefault()
          setSelectedIndex(prev => Math.min(prev + 1, results.length - 1))
          break
        case 'ArrowUp':
          e.preventDefault()
          setSelectedIndex(prev => Math.max(prev - 1, 0))
          break
        case 'Enter':
          e.preventDefault()
          if (results[selectedIndex]) {
            handleResultClick(results[selectedIndex])
          }
          break
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [open, results, selectedIndex, onOpenChange])

  const handleResultClick = (result: SearchResult) => {
    onOpenChange(false)

    if (result.type === 'book') {
      router.push(`/read/${result.id}`)
    } else if (result.type === 'annotation') {
      router.push(`/read/${result.bookId}?page=${result.page}`)
    }
  }

  const getResultIcon = (type: string) => {
    switch (type) {
      case 'book':
        return <BookIcon className="w-4 h-4" />
      case 'annotation':
        return <FileText className="w-4 h-4" />
      default:
        return <Search className="w-4 h-4" />
    }
  }

  const getResultTypeColor = (type: string) => {
    switch (type) {
      case 'book':
        return 'text-blue-600 dark:text-blue-400'
      case 'annotation':
        return 'text-green-600 dark:text-green-400'
      default:
        return 'text-gray-600 dark:text-gray-400'
    }
  }

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
            onClick={() => onOpenChange(false)}
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="fixed top-[20%] left-1/2 transform -translate-x-1/2 w-full max-w-2xl mx-4 z-50"
          >
            <div className="bg-background border rounded-xl shadow-2xl overflow-hidden">
              {/* Search Input */}
              <div className="p-4 border-b">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Search books, annotations, highlights..."
                    className="pl-10 pr-10"
                    autoFocus
                  />
                  {query && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setQuery('')}
                      className="absolute right-1 top-1/2 transform -translate-y-1/2 h-8 w-8 p-0"
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  )}
                </div>
              </div>

              {/* Results */}
              <div className="max-h-96 overflow-y-auto">
                {isLoading ? (
                  <div className="p-8 text-center">
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                    >
                      <Search className="w-6 h-6 text-muted-foreground mx-auto mb-2" />
                    </motion.div>
                    <p className="text-muted-foreground">Searching...</p>
                  </div>
                ) : results.length === 0 && query ? (
                  <div className="p-8 text-center">
                    <Search className="w-6 h-6 text-muted-foreground mx-auto mb-2" />
                    <p className="text-muted-foreground">No results found for &ldquo;{query}&rdquo;</p>
                  </div>
                ) : (
                  <AnimatePresence>
                    {results.map((result, index) => (
                      <motion.div
                        key={`${result.type}-${result.id}`}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ delay: index * 0.05 }}
                        className={`p-4 border-b last:border-b-0 cursor-pointer hover:bg-muted/50 transition-colors ${
                          index === selectedIndex ? 'bg-muted' : ''
                        }`}
                        onClick={() => handleResultClick(result)}
                      >
                        <div className="flex items-center gap-3">
                          <div className={`p-2 rounded-lg ${getResultTypeColor(result.type)} bg-muted`}>
                            {getResultIcon(result.type)}
                          </div>

                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <h3 className="font-medium truncate">{result.title}</h3>
                              {result.page && (
                                <span className="text-xs text-muted-foreground bg-muted px-2 py-1 rounded">
                                  Page {result.page}
                                </span>
                              )}
                            </div>

                            {result.subtitle && (
                              <p className="text-sm text-muted-foreground truncate">
                                {result.subtitle}
                              </p>
                            )}

                            {result.excerpt && (
                              <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                                {result.excerpt}
                              </p>
                            )}
                          </div>

                          <ArrowRight className="w-4 h-4 text-muted-foreground" />
                        </div>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                )}
              </div>

              {/* Footer */}
              <div className="p-3 border-t bg-muted/20">
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <div className="flex items-center gap-4">
                    <span>↑↓ Navigate</span>
                    <span>↵ Select</span>
                    <span>⎋ Close</span>
                  </div>
                  {results.length > 0 && (
                    <span>{results.length} results</span>
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}

// Hook for managing command palette state
export function useCommandPalette() {
  const [open, setOpen] = useState(false)

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault()
        setOpen(true)
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [])

  return { open, setOpen }
}
