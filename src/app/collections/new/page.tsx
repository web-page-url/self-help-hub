'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { ArrowLeft, Plus, X, Search, Check } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { useCollections } from '@/hooks/use-collections'
import { useBooks } from '@/hooks/use-books'
import { Book } from '@/types'

export default function NewCollectionPage() {
  const router = useRouter()
  const { createCollection, addBookToCollection } = useCollections()
  const { books } = useBooks()

  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedBooks, setSelectedBooks] = useState<Book[]>([])
  const [isCreating, setIsCreating] = useState(false)

  // Filter books based on search
  const filteredBooks = books.filter(book =>
    book.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    book.author?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    book.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
  )

  const handleBookToggle = (book: Book) => {
    setSelectedBooks(prev => {
      const isSelected = prev.some(b => b.id === book.id)
      if (isSelected) {
        return prev.filter(b => b.id !== book.id)
      } else {
        return [...prev, book]
      }
    })
  }

  const handleCreateCollection = async () => {
    if (!name.trim()) return

    setIsCreating(true)
    try {
      const collection = createCollection(name.trim(), description.trim())

      // Add selected books to the collection
      selectedBooks.forEach(book => {
        addBookToCollection(collection.id, book.id)
      })

      router.push(`/collections/${collection.id}`)
    } catch (error) {
      console.error('Failed to create collection:', error)
    } finally {
      setIsCreating(false)
    }
  }

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
            <Link href="/collections">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Collections
            </Link>
          </Button>

          <div>
            <h1 className="text-3xl font-bold mb-2">Create New Collection</h1>
            <p className="text-muted-foreground">
              Organize your books into a custom collection
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Collection Details */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Card>
              <CardHeader>
                <CardTitle>Collection Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Collection Name *
                  </label>
                  <Input
                    placeholder="e.g., Productivity Books, Fiction Favorites"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">
                    Description (Optional)
                  </label>
                  <Textarea
                    placeholder="Describe what this collection is about..."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    rows={3}
                  />
                </div>

                <div className="pt-4">
                  <Button
                    onClick={handleCreateCollection}
                    disabled={!name.trim() || isCreating}
                    className="w-full"
                  >
                    {isCreating ? (
                      'Creating...'
                    ) : (
                      <>
                        <Plus className="w-4 h-4 mr-2" />
                        Create Collection
                      </>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Book Selection */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <Card>
              <CardHeader>
                <CardTitle>Add Books</CardTitle>
                <p className="text-sm text-muted-foreground">
                  {selectedBooks.length} book{selectedBooks.length !== 1 ? 's' : ''} selected
                </p>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Search */}
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                  <Input
                    placeholder="Search books..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>

                {/* Selected Books */}
                {selectedBooks.length > 0 && (
                  <div>
                    <h4 className="text-sm font-medium mb-2">Selected Books</h4>
                    <div className="flex flex-wrap gap-2 mb-4">
                      {selectedBooks.map((book) => (
                        <Badge
                          key={book.id}
                          variant="secondary"
                          className="flex items-center gap-1"
                        >
                          {book.title}
                          <button
                            onClick={() => handleBookToggle(book)}
                            className="ml-1 hover:bg-muted-foreground/20 rounded-full p-0.5"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {/* Book List */}
                <div className="max-h-96 overflow-y-auto space-y-2">
                  {filteredBooks.map((book) => {
                    const isSelected = selectedBooks.some(b => b.id === book.id)

                    return (
                      <div
                        key={book.id}
                        className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${
                          isSelected
                            ? 'bg-primary/10 border-primary'
                            : 'hover:bg-muted/50'
                        }`}
                        onClick={() => handleBookToggle(book)}
                      >
                        <div className="w-8 h-10 bg-muted rounded flex items-center justify-center flex-shrink-0">
                          {book.title.charAt(0)}
                        </div>

                        <div className="flex-1 min-w-0">
                          <h4 className="font-medium truncate text-sm">
                            {book.title}
                          </h4>
                          {book.author && (
                            <p className="text-xs text-muted-foreground truncate">
                              by {book.author}
                            </p>
                          )}
                        </div>

                        <div className="flex-shrink-0">
                          {isSelected ? (
                            <Check className="w-5 h-5 text-primary" />
                          ) : (
                            <div className="w-5 h-5 border-2 border-muted-foreground rounded" />
                          )}
                        </div>
                      </div>
                    )
                  })}

                  {filteredBooks.length === 0 && (
                    <div className="text-center py-8 text-muted-foreground">
                      <p>No books found</p>
                      <p className="text-sm">Try adjusting your search</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </div>
  )
}
