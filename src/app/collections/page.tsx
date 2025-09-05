'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import {
  Plus,
  FolderOpen,
  Star,
  Clock,
  CheckCircle,
  Calendar,
  Tag,
  BookOpen,
  MoreVertical,
  Edit,
  Trash2,
  Heart
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
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

const staggerContainer = {
  animate: {
    transition: {
      staggerChildren: 0.1
    }
  }
}

const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.5 }
}

export default function CollectionsPage() {
  const { getAllCollections, deleteCollection } = useCollections()
  const { books } = useBooks()
  const [collections, setCollections] = useState<CollectionItem[]>([])

  useEffect(() => {
    if (books.length > 0) {
      setCollections(getAllCollections(books))
    }
  }, [books, getAllCollections])

  const getCollectionIcon = (collection: CollectionItem) => {
    if ('type' in collection && collection.type === 'smart') {
      switch (collection.id) {
        case 'favorites':
          return <Heart className="w-6 h-6 text-red-500" />
        case 'unread':
          return <BookOpen className="w-6 h-6 text-blue-500" />
        case 'in-progress':
          return <Clock className="w-6 h-6 text-orange-500" />
        case 'finished':
          return <CheckCircle className="w-6 h-6 text-green-500" />
        case 'recently-added':
          return <Calendar className="w-6 h-6 text-purple-500" />
        default:
          if (collection.id.startsWith('tag-')) {
            return <Tag className="w-6 h-6 text-indigo-500" />
          }
          return <FolderOpen className="w-6 h-6 text-gray-500" />
      }
    }
    return <FolderOpen className="w-6 h-6 text-gray-500" />
  }

  const handleDeleteCollection = (collectionId: string) => {
    if (confirm('Are you sure you want to delete this collection?')) {
      deleteCollection(collectionId)
      setCollections(prev => prev.filter(c => c.id !== collectionId))
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold mb-2">Collections</h1>
            <p className="text-muted-foreground">
              Organize your books into smart shelves and custom collections
            </p>
          </div>
          <Button asChild>
            <Link href="/collections/new">
              <Plus className="w-4 h-4 mr-2" />
              New Collection
            </Link>
          </Button>
        </div>

        {/* Collections Grid */}
        <motion.div
          variants={staggerContainer}
          initial="initial"
          animate="animate"
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
        >
          {collections.map((collection) => (
            <CollectionCard
              key={collection.id}
              collection={collection}
              books={books}
              onDelete={handleDeleteCollection}
              getIcon={getCollectionIcon}
            />
          ))}
        </motion.div>

        {/* Empty State */}
        {collections.length === 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-center py-16"
          >
            <FolderOpen className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">No collections yet</h3>
            <p className="text-muted-foreground mb-6">
              Create your first collection to organize your books
            </p>
            <Button asChild>
              <Link href="/collections/new">
                <Plus className="w-4 h-4 mr-2" />
                Create Collection
              </Link>
            </Button>
          </motion.div>
        )}
      </div>
    </div>
  )
}

function CollectionCard({
  collection,
  books,
  onDelete,
  getIcon
}: {
  collection: CollectionItem
  books: Book[]
  onDelete: (id: string) => void
  getIcon: (collection: CollectionItem) => React.ReactNode
}) {
  const collectionBooks = books.filter(book =>
    collection.bookIds.includes(book.id)
  )

  const isSmart = 'type' in collection && collection.type === 'smart'
  const isCustom = !isSmart

  return (
    <motion.div variants={fadeInUp}>
      <Card className="group hover:shadow-lg transition-all duration-300 hover:scale-[1.02]">
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              {getIcon(collection)}
              <div className="min-w-0 flex-1">
                <CardTitle className="text-lg truncate">{collection.name}</CardTitle>
                {collection.description && (
                  <p className="text-sm text-muted-foreground truncate">
                    {collection.description}
                  </p>
                )}
              </div>
            </div>

            {isCustom && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="opacity-0 group-hover:opacity-100 transition-opacity">
                    <MoreVertical className="w-4 h-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem asChild>
                    <Link href={`/collections/${collection.id}/edit`}>
                      <Edit className="w-4 h-4 mr-2" />
                      Edit
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => onDelete(collection.id)}
                    className="text-destructive"
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>
        </CardHeader>

        <CardContent>
          <div className="flex items-center justify-between mb-3">
            <Badge variant={isSmart ? "secondary" : "default"}>
              {isSmart ? 'Smart' : 'Custom'}
            </Badge>
            <span className="text-sm text-muted-foreground">
              {collectionBooks.length} books
            </span>
          </div>

          {/* Book previews */}
          {collectionBooks.length > 0 && (
            <div className="flex -space-x-2 mb-3">
              {collectionBooks.slice(0, 5).map((book) => (
                <div
                  key={book.id}
                  className="w-8 h-10 bg-muted rounded border-2 border-background flex items-center justify-center text-xs font-medium"
                  title={book.title}
                >
                  {book.title.charAt(0)}
                </div>
              ))}
              {collectionBooks.length > 5 && (
                <div className="w-8 h-10 bg-muted rounded border-2 border-background flex items-center justify-center text-xs font-medium">
                  +{collectionBooks.length - 5}
                </div>
              )}
            </div>
          )}

          <Button
            asChild
            variant="outline"
            size="sm"
            className="w-full"
          >
            <Link href={`/collections/${collection.id}`}>
              View Collection
            </Link>
          </Button>
        </CardContent>
      </Card>
    </motion.div>
  )
}
