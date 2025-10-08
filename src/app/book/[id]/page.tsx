'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import Link from 'next/link'
import {
  ArrowLeft,
  BookOpen,
  Calendar,
  Tag,
  Clock,
  Eye,
  Download,
  Share2,
  Edit,
  Trash2,
  Star,
  FileText,
  User,
  Hash,
  TrendingUp
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import { useBooks } from '@/hooks/use-books'
import { useCollections } from '@/hooks/use-collections'
import { Book } from '@/types'
import { formatDate, formatReadingTime } from '@/lib/utils'

const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.5 }
}

export default function BookDetailsPage() {
  const params = useParams()
  const router = useRouter()
  const bookId = params.id as string

  const { books, deleteBook } = useBooks()
  const { collections, addBookToCollection, removeBookFromCollection } = useCollections()

  const [book, setBook] = useState<Book | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (books.length > 0) {
      const foundBook = books.find(b => b.id === bookId)
      setBook(foundBook || null)
      setIsLoading(false)
    }
  }, [books, bookId])

  const handleDelete = async () => {
    if (book) {
      await deleteBook(book.id)
      router.push('/library')
    }
  }

  const getProgressColor = (progress: number) => {
    if (progress === 1) return 'text-green-600'
    if (progress > 0.5) return 'text-blue-600'
    if (progress > 0) return 'text-orange-600'
    return 'text-gray-600'
  }

  const getProgressStatus = (progress: number) => {
    if (progress === 1) return 'Completed'
    if (progress > 0) return 'In Progress'
    return 'Not Started'
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

  if (!book) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <BookOpen className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
          <h2 className="text-xl font-semibold mb-2">Book not found</h2>
          <p className="text-muted-foreground mb-6">
            The book you&apos;re looking for doesn&apos;t exist or has been removed.
          </p>
          <Button asChild>
            <Link href="/library">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Library
            </Link>
          </Button>
        </div>
      </div>
    )
  }

  const progress = book.progress || 0
  const readingTime = Math.round((progress * (book.pages || 0) * 2)) // Estimate 2 minutes per page

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Header */}
        <div className="mb-8">
          <Button
            variant="ghost"
            asChild
            className="mb-4"
          >
            <Link href="/library">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Library
            </Link>
          </Button>
        </div>

        <motion.div
          initial="initial"
          animate="animate"
          className="space-y-8"
        >

          {/* Book Header */}
          <motion.div variants={fadeInUp}>
            <div className="flex flex-col md:flex-row gap-8">
              {/* Cover */}
              <div className="flex-shrink-0">
                <div className="w-48 h-64 bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-lg flex items-center justify-center border">
                  {book.coverThumb ? (
                    <img
                      src={book.coverThumb}
                      alt={book.title}
                      className="w-full h-full object-cover rounded-lg"
                    />
                  ) : (
                    <BookOpen className="w-16 h-16 text-muted-foreground" />
                  )}
                </div>
              </div>

              {/* Info */}
              <div className="flex-1 space-y-4">
                <div>
                  <h1 className="text-3xl font-bold mb-2">{book.title}</h1>
                  {book.author && (
                    <div className="flex items-center gap-2 text-lg text-muted-foreground mb-4">
                      <User className="w-4 h-4" />
                      {book.author}
                    </div>
                  )}
                </div>

                {/* Progress */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Reading Progress</span>
                    <Badge variant="outline" className={getProgressColor(progress)}>
                      {getProgressStatus(progress)}
                    </Badge>
                  </div>
                  <Progress value={progress * 100} className="h-3" />
                  <div className="flex justify-between text-sm text-muted-foreground">
                    <span>{Math.round(progress * 100)}% complete</span>
                    {readingTime > 0 && (
                      <span>{readingTime} min read</span>
                    )}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex flex-wrap gap-2 pt-4">
                  <Button asChild>
                    <Link href={`/read/${book.id}`}>
                      <BookOpen className="w-4 h-4 mr-2" />
                      {progress > 0 ? 'Continue Reading' : 'Start Reading'}
                    </Link>
                  </Button>

                  <Button variant="outline">
                    <Download className="w-4 h-4 mr-2" />
                    Export
                  </Button>

                  <Button variant="outline">
                    <Share2 className="w-4 h-4 mr-2" />
                    Share
                  </Button>

                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="destructive" size="sm">
                        <Trash2 className="w-4 h-4 mr-2" />
                        Delete
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Delete Book</AlertDialogTitle>
                        <AlertDialogDescription>
                          Are you sure you want to delete &ldquo;{book.title}&rdquo;? This action cannot be undone
                          and will remove the book and all its annotations from your library.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={handleDelete}
                          className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        >
                          Delete Book
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Details Grid */}
          <motion.div variants={fadeInUp}>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">

              {/* Metadata */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="w-4 h-4" />
                    Details
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {book.year && (
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Year</span>
                      <span className="text-sm font-medium">{book.year}</span>
                    </div>
                  )}

                  {book.pages && (
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Pages</span>
                      <span className="text-sm font-medium">{book.pages}</span>
                    </div>
                  )}

                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Added</span>
                    <span className="text-sm font-medium">{formatDate(book.addedAt)}</span>
                  </div>

                  {book.lastOpenedAt && (
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Last Read</span>
                      <span className="text-sm font-medium">{formatDate(book.lastOpenedAt)}</span>
                    </div>
                  )}

                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Source</span>
                    <Badge variant="outline" className="text-xs capitalize">
                      {book.source?.replace('-', ' ') || 'uploaded'}
                    </Badge>
                  </div>
                </CardContent>
              </Card>

              {/* Tags */}
              {book.tags.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Tag className="w-4 h-4" />
                      Tags
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap gap-2">
                      {book.tags.map((tag) => (
                        <Badge key={tag} variant="secondary">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Statistics */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="w-4 h-4" />
                    Statistics
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Progress</span>
                    <span className="text-sm font-medium">{Math.round(progress * 100)}%</span>
                  </div>

                  {readingTime > 0 && (
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Time Read</span>
                      <span className="text-sm font-medium">{readingTime} min</span>
                    </div>
                  )}

                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Status</span>
                    <Badge variant="outline" className={`text-xs ${getProgressColor(progress)}`}>
                      {getProgressStatus(progress)}
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            </div>
          </motion.div>

          {/* Description */}
          {book.description && (
            <motion.div variants={fadeInUp}>
              <Card>
                <CardHeader>
                  <CardTitle>Description</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground leading-relaxed">
                    {book.description}
                  </p>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {/* Collections */}
          {collections.length > 0 && (
            <motion.div variants={fadeInUp}>
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Hash className="w-4 h-4" />
                    Collections
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {collections.map((collection) => {
                      const isInCollection = collection.bookIds.includes(book.id)
                      return (
                        <div key={collection.id} className="flex items-center justify-between">
                          <span className="text-sm">{collection.name}</span>
                          <Button
                            variant={isInCollection ? "default" : "outline"}
                            size="sm"
                            onClick={() => {
                              if (isInCollection) {
                                removeBookFromCollection(collection.id, book.id)
                              } else {
                                addBookToCollection(collection.id, book.id)
                              }
                            }}
                          >
                            {isInCollection ? 'Remove' : 'Add'}
                          </Button>
                        </div>
                      )
                    })}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}

        </motion.div>
      </div>
    </div>
  )
}
