'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import Link from 'next/link'
import {
  ArrowLeft,
  BookOpen,
  Clock,
  Calendar,
  Tag,
  Heart,
  CheckCircle,
  MoreVertical,
  Edit,
  Trash2,
  Grid,
  List
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu'
import { useCollections, CollectionItem } from '@/hooks/use-collections'
import { useBooks } from '@/hooks/use-books'
import { Book } from '@/types'
import { formatReadingTime } from '@/lib/utils'

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

export default function CollectionViewPage() {
  const params = useParams()
  const router = useRouter()
  const collectionId = params.id as string

  const { getCollectionById, removeBookFromCollection } = useCollections()
  const { books, updateBook } = useBooks()

  const [collection, setCollection] = useState<CollectionItem | null>(null)
  const [collectionBooks, setCollectionBooks] = useState<Book[]>([])
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')

  useEffect(() => {
    if (books.length > 0) {
      const foundCollection = getCollectionById(collectionId, books)
      if (foundCollection) {
        setCollection(foundCollection)
        const booksInCollection = books.filter(book =>
          foundCollection.bookIds.includes(book.id)
        )
        setCollectionBooks(booksInCollection)
      }
    }
  }, [collectionId, books, getCollectionById])

  const getCollectionIcon = (collection: CollectionItem) => {
    if ('type' in collection && collection.type === 'smart') {
      switch (collection.id) {
        case 'favorites':
          return <Heart className="w-8 h-8 text-red-500" />
        case 'unread':
          return <BookOpen className="w-8 h-8 text-blue-500" />
        case 'in-progress':
          return <Clock className="w-8 h-8 text-orange-500" />
        case 'finished':
          return <CheckCircle className="w-8 h-8 text-green-500" />
        case 'recently-added':
          return <Calendar className="w-8 h-8 text-purple-500" />
        default:
          if (collection.id.startsWith('tag-')) {
            return <Tag className="w-8 h-8 text-indigo-500" />
          }
          return <BookOpen className="w-8 h-8 text-gray-500" />
      }
    }
    return <BookOpen className="w-8 h-8 text-gray-500" />
  }

  const handleRemoveBook = async (bookId: string) => {
    if (collection && 'type' in collection && collection.type === 'smart') {
      // For smart collections, we can't remove books directly
      return
    }

    if (confirm('Remove this book from the collection?')) {
      removeBookFromCollection(collectionId, bookId)
      setCollectionBooks(prev => prev.filter(book => book.id !== bookId))
    }
  }

  if (!collection) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold mb-2">Collection not found</h2>
          <Button asChild>
            <Link href="/collections">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Collections
            </Link>
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <Button
            variant="ghost"
            asChild
            className="mb-4"
          >
            <Link href="/collections">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Collections
            </Link>
          </Button>

          <div className="flex items-start justify-between">
            <div className="flex items-center gap-4">
              {getCollectionIcon(collection)}
              <div>
                <h1 className="text-3xl font-bold">{collection.name}</h1>
                {collection.description && (
                  <p className="text-muted-foreground mt-1">
                    {collection.description}
                  </p>
                )}
                <div className="flex items-center gap-4 mt-2">
                  <Badge variant={'type' in collection && collection.type === 'smart' ? "secondary" : "default"}>
                    {'type' in collection && collection.type === 'smart' ? 'Smart Collection' : 'Custom Collection'}
                  </Badge>
                  <span className="text-sm text-muted-foreground">
                    {collectionBooks.length} books
                  </span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {/* View Mode Toggle */}
              <div className="flex border rounded-lg">
                <Button
                  variant={viewMode === 'grid' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setViewMode('grid')}
                  className="rounded-r-none"
                >
                  <Grid className="w-4 h-4" />
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

              {/* Collection Actions */}
              {'type' in collection && collection.type !== 'smart' && (
                <Button asChild>
                  <Link href={`/collections/${collection.id}/edit`}>
                    <Edit className="w-4 h-4 mr-2" />
                    Edit
                  </Link>
                </Button>
              )}
            </div>
          </div>
        </div>

        {/* Books */}
        {collectionBooks.length === 0 ? (
          <div className="text-center py-16">
            <BookOpen className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">No books in this collection</h3>
            <p className="text-muted-foreground">
              {'type' in collection && collection.type === 'smart'
                ? 'Books will appear here automatically based on the collection criteria.'
                : 'Add some books to get started.'
              }
            </p>
          </div>
        ) : (
          <motion.div
            variants={staggerContainer}
            initial="initial"
            animate="animate"
            className={
              viewMode === 'grid'
                ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6'
                : 'space-y-4'
            }
          >
            {collectionBooks.map((book) => (
              <BookCard
                key={book.id}
                book={book}
                viewMode={viewMode}
                isSmartCollection={'type' in collection && collection.type === 'smart'}
                onRemove={handleRemoveBook}
              />
            ))}
          </motion.div>
        )}
      </div>
    </div>
  )
}

function BookCard({
  book,
  viewMode,
  isSmartCollection,
  onRemove
}: {
  book: Book
  viewMode: 'grid' | 'list'
  isSmartCollection: boolean
  onRemove: (bookId: string) => void
}) {
  const progress = book.progress || 0

  if (viewMode === 'list') {
    return (
      <motion.div variants={fadeInUp}>
        <Card className="hover:shadow-md transition-shadow">
          <CardContent className="p-4">
            <div className="flex items-center gap-4">
              {/* Cover */}
              <div className="w-12 h-16 bg-muted rounded flex items-center justify-center flex-shrink-0">
                {book.coverThumb ? (
                  <img
                    src={book.coverThumb}
                    alt={book.title}
                    className="w-full h-full object-cover rounded"
                  />
                ) : (
                  <span className="text-xs font-medium">
                    {book.title.charAt(0)}
                  </span>
                )}
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <h3 className="font-medium truncate">{book.title}</h3>
                {book.author && (
                  <p className="text-sm text-muted-foreground truncate">
                    by {book.author}
                  </p>
                )}
                <div className="flex items-center gap-2 mt-1">
                  <div className="flex-1 bg-muted rounded-full h-1">
                    <div
                      className="bg-primary h-1 rounded-full transition-all"
                      style={{ width: `${progress * 100}%` }}
                    />
                  </div>
                  <span className="text-xs text-muted-foreground">
                    {Math.round(progress * 100)}%
                  </span>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2">
                <Button asChild variant="outline" size="sm">
                  <Link href={`/read/${book.id}`}>
                    {progress > 0 ? 'Continue' : 'Read'}
                  </Link>
                </Button>

                {!isSmartCollection && (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm">
                        <MoreVertical className="w-4 h-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem asChild>
                        <Link href={`/book/${book.id}`}>
                          View Details
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => onRemove(book.id)}
                        className="text-destructive"
                      >
                        Remove from Collection
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    )
  }

  return (
    <motion.div variants={fadeInUp}>
      <Card className="group hover:shadow-lg transition-all duration-300 hover:scale-[1.02]">
        <CardContent className="p-4">
          <div className="aspect-[3/4] bg-muted rounded-lg mb-3 flex items-center justify-center relative overflow-hidden">
            {book.coverThumb ? (
              <img
                src={book.coverThumb}
                alt={book.title}
                className="w-full h-full object-cover"
              />
            ) : (
              <span className="text-2xl font-bold text-muted-foreground">
                {book.title.charAt(0)}
              </span>
            )}

            {!isSmartCollection && (
              <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="secondary" size="sm" className="w-8 h-8 p-0">
                      <MoreVertical className="w-4 h-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem asChild>
                      <Link href={`/book/${book.id}`}>
                        View Details
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => onRemove(book.id)}
                      className="text-destructive"
                    >
                      Remove from Collection
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            )}
          </div>

          <div className="space-y-2">
            <h3 className="font-medium line-clamp-2 text-sm">{book.title}</h3>
            {book.author && (
              <p className="text-xs text-muted-foreground line-clamp-1">
                by {book.author}
              </p>
            )}

            {book.tags.length > 0 && (
              <div className="flex flex-wrap gap-1">
                {book.tags.slice(0, 2).map((tag) => (
                  <Badge key={tag} variant="outline" className="text-xs">
                    {tag}
                  </Badge>
                ))}
                {book.tags.length > 2 && (
                  <Badge variant="outline" className="text-xs">
                    +{book.tags.length - 2}
                  </Badge>
                )}
              </div>
            )}

            <div className="space-y-2">
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>Progress</span>
                <span>{Math.round(progress * 100)}%</span>
              </div>
              <div className="w-full bg-muted rounded-full h-1">
                <div
                  className="bg-primary h-1 rounded-full transition-all"
                  style={{ width: `${progress * 100}%` }}
                />
              </div>
            </div>

            <Button asChild size="sm" className="w-full">
              <Link href={`/read/${book.id}`}>
                {progress > 0 ? 'Continue Reading' : 'Start Reading'}
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}
