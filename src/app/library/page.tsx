'use client'

import { useState, useEffect, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Search,
  Filter,
  Plus,
  Grid3X3,
  List,
  BookOpen,
  Upload,
  MoreHorizontal,
  Star,
  Clock,
  Calendar,
  Tag
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { bookStorage, annotationStorage } from '@/lib/storage'
import { Book, SortOption, ViewMode } from '@/types'
import { formatDate, formatReadingTime } from '@/lib/utils'
import { UploadDialog } from '@/components/library/UploadDialog'
import { searchEngine } from '@/lib/search'

const BookCard = ({ book, onClick }: { book: Book; onClick: () => void }) => {
  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      whileHover={{ y: -8, scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      className="group cursor-pointer"
      onClick={onClick}
    >
      <div className="bg-card rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 border overflow-hidden">
        {/* Cover */}
        <div className="aspect-[3/4] bg-gradient-to-br from-blue-500/20 to-purple-500/20 relative overflow-hidden">
          {book.coverThumb ? (
            <img
              src={book.coverThumb}
              alt={book.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <BookOpen className="w-12 h-12 text-muted-foreground/50" />
            </div>
          )}

          {/* Progress overlay */}
          {book.progress && book.progress > 0 && (
            <div className="absolute bottom-0 left-0 right-0 h-1 bg-black/20">
              <motion.div
                className="h-full bg-gradient-to-r from-blue-500 to-purple-500"
                initial={{ width: 0 }}
                animate={{ width: `${book.progress * 100}%` }}
                transition={{ duration: 0.5, delay: 0.2 }}
              />
            </div>
          )}

          {/* Quick actions */}
          <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
            <Button size="sm" variant="secondary" className="h-8 w-8 p-0">
              <MoreHorizontal className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Content */}
        <div className="p-4">
          <h3 className="font-semibold text-sm line-clamp-2 mb-1 group-hover:text-primary transition-colors">
            {book.title}
          </h3>

          {book.author && (
            <p className="text-xs text-muted-foreground mb-2 line-clamp-1">
              by {book.author}
            </p>
          )}

          {/* Tags */}
          {book.tags.length > 0 && (
            <div className="flex flex-wrap gap-1 mb-3">
              {book.tags.slice(0, 2).map((tag) => (
                <span
                  key={tag}
                  className="inline-flex items-center gap-1 px-2 py-1 bg-secondary text-secondary-foreground text-xs rounded-full"
                >
                  <Tag className="w-3 h-3" />
                  {tag}
                </span>
              ))}
              {book.tags.length > 2 && (
                <span className="text-xs text-muted-foreground">
                  +{book.tags.length - 2} more
                </span>
              )}
            </div>
          )}

          {/* Metadata */}
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <div className="flex items-center gap-3">
              {book.lastOpenedAt && (
                <div className="flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  {formatDate(book.lastOpenedAt)}
                </div>
              )}
              {book.progress && book.progress > 0 && (
                <div className="flex items-center gap-1">
                  <BookOpen className="w-3 h-3" />
                  {Math.round(book.progress * 100)}%
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  )
}

const BookListItem = ({ book, onClick }: { book: Book; onClick: () => void }) => {
  return (
    <motion.div
      layout
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }}
      whileHover={{ scale: 1.01 }}
      className="group cursor-pointer"
      onClick={onClick}
    >
      <div className="bg-card rounded-xl p-4 shadow-sm hover:shadow-md transition-all duration-300 border">
        <div className="flex gap-4">
          {/* Cover */}
          <div className="w-16 h-20 bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-lg flex items-center justify-center flex-shrink-0">
            {book.coverThumb ? (
              <img
                src={book.coverThumb}
                alt={book.title}
                className="w-full h-full object-cover rounded-lg"
              />
            ) : (
              <BookOpen className="w-6 h-6 text-muted-foreground/50" />
            )}
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-sm line-clamp-1 mb-1 group-hover:text-primary transition-colors">
              {book.title}
            </h3>

            {book.author && (
              <p className="text-xs text-muted-foreground mb-2 line-clamp-1">
                by {book.author}
              </p>
            )}

            <div className="flex items-center gap-4 text-xs text-muted-foreground">
              {book.lastOpenedAt && (
                <span>{formatDate(book.lastOpenedAt)}</span>
              )}
              {book.progress && book.progress > 0 && (
                <span>{Math.round(book.progress * 100)}% complete</span>
              )}
              {book.pages && (
                <span>{book.pages} pages</span>
              )}
            </div>
          </div>

          {/* Progress */}
          {book.progress && book.progress > 0 && (
            <div className="flex items-center gap-2">
              <div className="w-20 h-2 bg-muted rounded-full overflow-hidden">
                <motion.div
                  className="h-full bg-gradient-to-r from-blue-500 to-purple-500 rounded-full"
                  initial={{ width: 0 }}
                  animate={{ width: `${book.progress * 100}%` }}
                  transition={{ duration: 0.5 }}
                />
              </div>
              <span className="text-xs text-muted-foreground w-8">
                {Math.round(book.progress * 100)}%
              </span>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  )
}

export default function LibraryPage() {
  const router = useRouter()
  const [books, setBooks] = useState<Book[]>([])
  const [filteredBooks, setFilteredBooks] = useState<Book[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [sortBy, setSortBy] = useState<SortOption>('added-desc')
  const [viewMode, setViewMode] = useState<ViewMode>('grid')
  const [isLoading, setIsLoading] = useState(true)
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false)

  // Load books on mount
  useEffect(() => {
    const loadBooks = async () => {
      try {
        const [loadedBooks, loadedAnnotations] = await Promise.all([
          bookStorage.getAll(),
          annotationStorage.getAll()
        ])

        setBooks(loadedBooks)
        setFilteredBooks(loadedBooks)

        // Initialize search engine
        await searchEngine.initialize(loadedBooks, loadedAnnotations)
      } catch (error) {
        console.error('Failed to load books:', error)
      } finally {
        setIsLoading(false)
      }
    }

    loadBooks()
  }, [])

  // Filter and sort books
  const processedBooks = useMemo(() => {
    let result = [...books]

    // Search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase()
      result = result.filter(book =>
        book.title.toLowerCase().includes(query) ||
        book.author?.toLowerCase().includes(query) ||
        book.tags.some(tag => tag.toLowerCase().includes(query))
      )
    }

    // Sort
    result.sort((a, b) => {
      switch (sortBy) {
        case 'added-desc':
          return b.addedAt - a.addedAt
        case 'added-asc':
          return a.addedAt - b.addedAt
        case 'title-asc':
          return a.title.localeCompare(b.title)
        case 'title-desc':
          return b.title.localeCompare(a.title)
        case 'author-asc':
          return (a.author || '').localeCompare(b.author || '')
        case 'author-desc':
          return (b.author || '').localeCompare(a.author || '')
        case 'progress-desc':
          return (b.progress || 0) - (a.progress || 0)
        default:
          return 0
      }
    })

    return result
  }, [books, searchQuery, sortBy])

  useEffect(() => {
    setFilteredBooks(processedBooks)
  }, [processedBooks])

  const handleBookClick = (book: Book) => {
    router.push(`/read/${book.id}`)
  }

  const handleUploadComplete = (book: Book) => {
    setBooks(prev => [book, ...prev])
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
      {/* Header */}
      <header className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold">My Library</h1>
              <p className="text-muted-foreground text-sm">
                {books.length} books • {filteredBooks.length} shown
              </p>
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                asChild
              >
                <Link href="/collections">
                  <Tag className="w-4 h-4 mr-2" />
                  Collections
                </Link>
              </Button>

              <Button
                variant="outline"
                asChild
              >
                <Link href="/">
                  <BookOpen className="w-4 h-4 mr-2" />
                  Sample Books
                </Link>
              </Button>

              <Button
                className="gap-2"
                onClick={() => setUploadDialogOpen(true)}
              >
                <Upload className="w-4 h-4" />
                Add Book
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Toolbar */}
      <div className="border-b bg-muted/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
            {/* Search */}
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search books, authors, tags..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* Filters & View */}
            <div className="flex items-center gap-2">
              <Select value={sortBy} onValueChange={(value: SortOption) => setSortBy(value)}>
                <SelectTrigger className="w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="added-desc">Recently Added</SelectItem>
                  <SelectItem value="title-asc">Title A-Z</SelectItem>
                  <SelectItem value="title-desc">Title Z-A</SelectItem>
                  <SelectItem value="author-asc">Author A-Z</SelectItem>
                  <SelectItem value="progress-desc">Most Read</SelectItem>
                </SelectContent>
              </Select>

              <div className="flex rounded-lg border">
                <Button
                  variant={viewMode === 'grid' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setViewMode('grid')}
                  className="rounded-r-none"
                >
                  <Grid3X3 className="w-4 h-4" />
                </Button>
                <Button
                  variant={viewMode === 'list' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setViewMode('list')}
                  className="rounded-l-none"
                >
                  <List className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {filteredBooks.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-16"
          >
            <div className="w-24 h-24 bg-muted rounded-full flex items-center justify-center mx-auto mb-6">
              <BookOpen className="w-10 h-10 text-muted-foreground" />
            </div>
            <h2 className="text-2xl font-semibold mb-2">
              {books.length === 0 ? 'Your library is empty' : 'No books found'}
            </h2>
            <p className="text-muted-foreground mb-6 max-w-md mx-auto">
              {books.length === 0
                ? 'Start building your self-help library by adding your first book.'
                : 'Try adjusting your search or filters to find what you\'re looking for.'
              }
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Button
                className="gap-2"
                onClick={() => setUploadDialogOpen(true)}
              >
                <Plus className="w-4 h-4" />
                Add Your First Book
              </Button>
              <Button variant="outline" asChild>
                <Link href="/">
                  <BookOpen className="w-4 h-4 mr-2" />
                  Try Sample Books
                </Link>
              </Button>
            </div>
          </motion.div>
        ) : (
          <AnimatePresence mode="popLayout">
            {viewMode === 'grid' ? (
              <motion.div
                key="grid"
                layout
                className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6"
              >
                {filteredBooks.map((book) => (
                  <BookCard
                    key={book.id}
                    book={book}
                    onClick={() => handleBookClick(book)}
                  />
                ))}
              </motion.div>
            ) : (
              <motion.div
                key="list"
                layout
                className="space-y-4"
              >
                {filteredBooks.map((book) => (
                  <BookListItem
                    key={book.id}
                    book={book}
                    onClick={() => handleBookClick(book)}
                  />
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        )}
      </main>

      {/* Upload Dialog */}
      <UploadDialog
        open={uploadDialogOpen}
        onOpenChange={setUploadDialogOpen}
        onUploadComplete={handleUploadComplete}
      />
    </div>
  )
}
