'use client'

import { useState, useEffect, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'
import {
  Quote,
  Bookmark,
  FileText,
  Search,
  Filter,
  Download,
  Share2,
  Copy,
  Eye,
  Calendar,
  BookOpen,
  ArrowRight,
  Grid3X3,
  List,
  Tag,
  MoreVertical,
  Trash2,
  Edit
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator
} from '@/components/ui/dropdown-menu'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useBooks } from '@/hooks/use-books'
import { annotationStorage } from '@/lib/storage'
import { Annotation, Book } from '@/types'
import { formatDate } from '@/lib/utils'
import { ShareableQuoteDialog } from '@/components/quote-card'

const staggerContainer = {
  animate: {
    transition: {
      staggerChildren: 0.05
    }
  }
}

const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.3 }
}

type AnnotationType = 'all' | 'highlight' | 'note' | 'bookmark' | 'quote'
type ViewMode = 'grid' | 'list'
type SortBy = 'newest' | 'oldest' | 'book'

export default function HighlightsPage() {
  const { books } = useBooks()
  const [annotations, setAnnotations] = useState<Annotation[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [filterType, setFilterType] = useState<AnnotationType>('all')
  const [viewMode, setViewMode] = useState<ViewMode>('grid')
  const [sortBy, setSortBy] = useState<SortBy>('newest')
  const [isLoading, setIsLoading] = useState(true)

  // Load annotations
  useEffect(() => {
    const loadAnnotations = async () => {
      try {
        setIsLoading(true)
        const loadedAnnotations = await annotationStorage.getAll()
        setAnnotations(loadedAnnotations)
      } catch (error) {
        console.error('Failed to load annotations:', error)
      } finally {
        setIsLoading(false)
      }
    }

    loadAnnotations()
  }, [])

  // Filter and sort annotations
  const filteredAnnotations = useMemo(() => {
    let filtered = annotations

    // Filter by type
    if (filterType !== 'all') {
      filtered = filtered.filter(annotation => annotation.type === filterType)
    }

    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(annotation =>
        annotation.text?.toLowerCase().includes(query) ||
        annotation.type.toLowerCase().includes(query)
      )
    }

    // Sort
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'newest':
          return b.createdAt - a.createdAt
        case 'oldest':
          return a.createdAt - b.createdAt
        case 'book':
          const bookA = books.find(book => book.id === a.bookId)?.title || ''
          const bookB = books.find(book => book.id === b.bookId)?.title || ''
          return bookA.localeCompare(bookB)
        default:
          return 0
      }
    })

    return filtered
  }, [annotations, filterType, searchQuery, sortBy, books])

  // Group annotations by book
  const annotationsByBook = useMemo(() => {
    const grouped: Record<string, { book: Book | null; annotations: Annotation[] }> = {}

    filteredAnnotations.forEach(annotation => {
      const book = books.find(b => b.id === annotation.bookId) || null
      const bookId = annotation.bookId

      if (!grouped[bookId]) {
        grouped[bookId] = { book, annotations: [] }
      }
      grouped[bookId].annotations.push(annotation)
    })

    return Object.values(grouped)
  }, [filteredAnnotations, books])

  const handleCopyQuote = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text)
      // Could add a toast notification here
    } catch (error) {
      console.error('Failed to copy text:', error)
    }
  }

  const handleExport = () => {
    const exportData = filteredAnnotations.map(annotation => {
      const book = books.find(b => b.id === annotation.bookId)
      return {
        book: book?.title || 'Unknown Book',
        author: book?.author || '',
        type: annotation.type,
        text: annotation.text || '',
        page: annotation.page,
        createdAt: new Date(annotation.createdAt).toISOString()
      }
    })

    const blob = new Blob([JSON.stringify(exportData, null, 2)], {
      type: 'application/json'
    })

    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `highlights-export-${new Date().toISOString().split('T')[0]}.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const getAnnotationIcon = (type: string) => {
    switch (type) {
      case 'highlight':
        return <Quote className="w-4 h-4" />
      case 'note':
        return <FileText className="w-4 h-4" />
      case 'bookmark':
        return <Bookmark className="w-4 h-4" />
      case 'quote':
        return <Quote className="w-4 h-4" />
      default:
        return <FileText className="w-4 h-4" />
    }
  }

  const getAnnotationColor = (type: string) => {
    switch (type) {
      case 'highlight':
        return 'text-yellow-600 dark:text-yellow-400'
      case 'note':
        return 'text-blue-600 dark:text-blue-400'
      case 'bookmark':
        return 'text-red-600 dark:text-red-400'
      case 'quote':
        return 'text-green-600 dark:text-green-400'
      default:
        return 'text-gray-600 dark:text-gray-400'
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
        >
          <BookOpen className="w-8 h-8 text-muted-foreground" />
        </motion.div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Highlights & Quotes</h1>
          <p className="text-muted-foreground">
            Your personal collection of highlights, notes, and quotes from your reading journey
          </p>
        </div>

        {/* Toolbar */}
        <div className="mb-8 space-y-4">
          {/* Search and Filters */}
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input
                placeholder="Search highlights, notes, and quotes..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>

            <Select value={filterType} onValueChange={(value: AnnotationType) => setFilterType(value)}>
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="highlight">Highlights</SelectItem>
                <SelectItem value="note">Notes</SelectItem>
                <SelectItem value="bookmark">Bookmarks</SelectItem>
                <SelectItem value="quote">Quotes</SelectItem>
              </SelectContent>
            </Select>

            <Select value={sortBy} onValueChange={(value: SortBy) => setSortBy(value)}>
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="newest">Newest First</SelectItem>
                <SelectItem value="oldest">Oldest First</SelectItem>
                <SelectItem value="book">By Book</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Button
                variant={viewMode === 'grid' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewMode('grid')}
              >
                <Grid3X3 className="w-4 h-4 mr-2" />
                Grid
              </Button>
              <Button
                variant={viewMode === 'list' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewMode('list')}
              >
                <List className="w-4 h-4 mr-2" />
                List
              </Button>
            </div>

            <Button onClick={handleExport} disabled={filteredAnnotations.length === 0}>
              <Download className="w-4 h-4 mr-2" />
              Export
            </Button>
          </div>
        </div>

        {/* Content */}
        {filteredAnnotations.length === 0 ? (
          <div className="text-center py-16">
            <Quote className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">No highlights yet</h3>
            <p className="text-muted-foreground mb-6">
              Start reading and highlighting text to see your collection grow
            </p>
            <Button asChild>
              <Link href="/library">
                <BookOpen className="w-4 h-4 mr-2" />
                Browse Books
              </Link>
            </Button>
          </div>
        ) : (
          <motion.div
            variants={staggerContainer}
            initial="initial"
            animate="animate"
            className={viewMode === 'grid' ? 'space-y-8' : 'space-y-4'}
          >
            {annotationsByBook.map(({ book, annotations: bookAnnotations }) => (
              <BookHighlightsSection
                key={book?.id || 'unknown'}
                book={book}
                annotations={bookAnnotations}
                viewMode={viewMode}
                onCopyQuote={handleCopyQuote}
                getAnnotationIcon={getAnnotationIcon}
                getAnnotationColor={getAnnotationColor}
              />
            ))}
          </motion.div>
        )}
      </div>
    </div>
  )
}

function BookHighlightsSection({
  book,
  annotations,
  viewMode,
  onCopyQuote,
  getAnnotationIcon,
  getAnnotationColor
}: {
  book: Book | null
  annotations: Annotation[]
  viewMode: ViewMode
  onCopyQuote: (text: string) => void
  getAnnotationIcon: (type: string) => React.ReactNode
  getAnnotationColor: (type: string) => string
}) {
  if (viewMode === 'list') {
    return (
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-14 bg-muted rounded flex items-center justify-center">
                {book?.title.charAt(0) || '?'}
              </div>
              <div>
                <CardTitle className="text-lg">{book?.title || 'Unknown Book'}</CardTitle>
                {book?.author && (
                  <p className="text-sm text-muted-foreground">by {book.author}</p>
                )}
              </div>
            </div>
            <Badge variant="secondary">{annotations.length} items</Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
                      {annotations.map((annotation) => (
              <AnnotationListItem
                key={annotation.id}
                annotation={annotation}
                book={book}
                onCopyQuote={onCopyQuote}
                getAnnotationIcon={getAnnotationIcon}
                getAnnotationColor={getAnnotationColor}
              />
            ))}
        </CardContent>
      </Card>
    )
  }

  return (
    <div>
      <div className="flex items-center gap-3 mb-4">
        <div className="w-12 h-16 bg-muted rounded flex items-center justify-center">
          {book?.title.charAt(0) || '?'}
        </div>
        <div>
          <h3 className="text-xl font-semibold">{book?.title || 'Unknown Book'}</h3>
          {book?.author && (
            <p className="text-muted-foreground">by {book.author}</p>
          )}
        </div>
        <Badge variant="secondary">{annotations.length} items</Badge>
      </div>

      <motion.div
        variants={staggerContainer}
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
      >
        {annotations.map((annotation) => (
          <AnnotationCard
            key={annotation.id}
            annotation={annotation}
            book={book}
            onCopyQuote={onCopyQuote}
            getAnnotationIcon={getAnnotationIcon}
            getAnnotationColor={getAnnotationColor}
          />
        ))}
      </motion.div>
    </div>
  )
}

function AnnotationCard({
  annotation,
  book,
  onCopyQuote,
  getAnnotationIcon,
  getAnnotationColor
}: {
  annotation: Annotation
  book: Book | null
  onCopyQuote: (text: string) => void
  getAnnotationIcon: (type: string) => React.ReactNode
  getAnnotationColor: (type: string) => string
}) {
  const [isHovered, setIsHovered] = useState(false)

  return (
    <motion.div variants={fadeInUp}>
      <Card
        className="group hover:shadow-lg transition-all duration-300 cursor-pointer"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <CardContent className="p-4">
          <div className="flex items-start justify-between mb-3">
            <div className="flex items-center gap-2">
              <div className={getAnnotationColor(annotation.type)}>
                {getAnnotationIcon(annotation.type)}
              </div>
              <Badge variant="outline" className="text-xs capitalize">
                {annotation.type}
              </Badge>
            </div>

            <AnimatePresence>
              {isHovered && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  className="flex items-center gap-1"
                >
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onCopyQuote(annotation.text || '')}
                    className="h-8 w-8 p-0"
                  >
                    <Copy className="w-3 h-3" />
                  </Button>
                  <ShareableQuoteDialog annotation={annotation} book={book}>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 w-8 p-0"
                    >
                      <Share2 className="w-3 h-3" />
                    </Button>
                  </ShareableQuoteDialog>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {annotation.text && (
            <blockquote className="text-sm leading-relaxed mb-3 italic">
              "{annotation.text}"
            </blockquote>
          )}

          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <div className="flex items-center gap-1">
              <Calendar className="w-3 h-3" />
              Page {annotation.page}
            </div>
            <span>{formatDate(annotation.createdAt)}</span>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}

function AnnotationListItem({
  annotation,
  book,
  onCopyQuote,
  getAnnotationIcon,
  getAnnotationColor
}: {
  annotation: Annotation
  book: Book | null
  onCopyQuote: (text: string) => void
  getAnnotationIcon: (type: string) => React.ReactNode
  getAnnotationColor: (type: string) => string
}) {
  return (
    <motion.div variants={fadeInUp}>
      <div className="border rounded-lg p-4 hover:bg-muted/50 transition-colors">
        <div className="flex items-start justify-between mb-2">
          <div className="flex items-center gap-2">
            <div className={getAnnotationColor(annotation.type)}>
              {getAnnotationIcon(annotation.type)}
            </div>
            <Badge variant="outline" className="text-xs capitalize">
              {annotation.type}
            </Badge>
            <span className="text-xs text-muted-foreground">
              Page {annotation.page}
            </span>
          </div>

          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onCopyQuote(annotation.text || '')}
              className="h-8 w-8 p-0"
            >
              <Copy className="w-3 h-3" />
            </Button>
            <ShareableQuoteDialog annotation={annotation} book={book}>
              <Button
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0"
              >
                <Share2 className="w-3 h-3" />
              </Button>
            </ShareableQuoteDialog>
          </div>
        </div>

        {annotation.text && (
          <p className="text-sm leading-relaxed mb-2">
            {annotation.text}
          </p>
        )}

        <div className="text-xs text-muted-foreground">
          {formatDate(annotation.createdAt)}
        </div>
      </div>
    </motion.div>
  )
}
