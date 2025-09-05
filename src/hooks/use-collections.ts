'use client'

import { useState, useEffect, useCallback } from 'react'
import { generateId } from '@/lib/utils'
import { Book, Collection } from '@/types'

export interface SmartCollection extends Omit<Collection, 'bookIds'> {
  type: 'smart'
  filter: (book: Book) => boolean
  bookIds: string[] // Computed dynamically
}

export type CollectionItem = Collection | SmartCollection

export function useCollections() {
  const [collections, setCollections] = useState<Collection[]>([])
  const [isLoaded, setIsLoaded] = useState(false)

  // Load collections from localStorage
  useEffect(() => {
    const loadCollections = () => {
      try {
        const stored = localStorage.getItem('selfhelphub_collections')
        if (stored) {
          setCollections(JSON.parse(stored))
        }
      } catch (error) {
        console.error('Failed to load collections:', error)
      } finally {
        setIsLoaded(true)
      }
    }

    loadCollections()
  }, [])

  // Save collections to localStorage
  const saveCollections = useCallback((newCollections: Collection[]) => {
    localStorage.setItem('selfhelphub_collections', JSON.stringify(newCollections))
    setCollections(newCollections)
  }, [])

  // Create a new collection
  const createCollection = useCallback((name: string, description?: string) => {
    const newCollection: Collection = {
      id: generateId(),
      name,
      description,
      bookIds: [],
      createdAt: Date.now(),
      updatedAt: Date.now()
    }

    saveCollections([...collections, newCollection])
    return newCollection
  }, [collections, saveCollections])

  // Update collection
  const updateCollection = useCallback((id: string, updates: Partial<Omit<Collection, 'id' | 'createdAt'>>) => {
    const updatedCollections = collections.map(collection =>
      collection.id === id
        ? { ...collection, ...updates, updatedAt: Date.now() }
        : collection
    )
    saveCollections(updatedCollections)
  }, [collections, saveCollections])

  // Delete collection
  const deleteCollection = useCallback((id: string) => {
    const updatedCollections = collections.filter(collection => collection.id !== id)
    saveCollections(updatedCollections)
  }, [collections, saveCollections])

  // Add book to collection
  const addBookToCollection = useCallback((collectionId: string, bookId: string) => {
    const updatedCollections = collections.map(collection =>
      collection.id === collectionId && !collection.bookIds.includes(bookId)
        ? { ...collection, bookIds: [...collection.bookIds, bookId], updatedAt: Date.now() }
        : collection
    )
    saveCollections(updatedCollections)
  }, [collections, saveCollections])

  // Remove book from collection
  const removeBookFromCollection = useCallback((collectionId: string, bookId: string) => {
    const updatedCollections = collections.map(collection =>
      collection.id === collectionId
        ? { ...collection, bookIds: collection.bookIds.filter(id => id !== bookId), updatedAt: Date.now() }
        : collection
    )
    saveCollections(updatedCollections)
  }, [collections, saveCollections])

  // Get smart collections
  const getSmartCollections = useCallback((books: Book[]): SmartCollection[] => {
    const smartCollections: SmartCollection[] = [
      {
        id: 'favorites',
        name: 'Favorites',
        description: 'Books you\'ve marked as favorites',
        type: 'smart',
        filter: (book: Book) => false, // TODO: Add favorite system
        bookIds: [], // Will be computed
        createdAt: 0,
        updatedAt: 0
      },
      {
        id: 'unread',
        name: 'Unread',
        description: 'Books you haven\'t started reading yet',
        type: 'smart',
        filter: (book: Book) => !book.progress || book.progress === 0,
        bookIds: books.filter(book => !book.progress || book.progress === 0).map(book => book.id),
        createdAt: 0,
        updatedAt: 0
      },
      {
        id: 'in-progress',
        name: 'In Progress',
        description: 'Books you\'re currently reading',
        type: 'smart',
        filter: (book: Book) => book.progress && book.progress > 0 && book.progress < 1,
        bookIds: books.filter(book => book.progress && book.progress > 0 && book.progress < 1).map(book => book.id),
        createdAt: 0,
        updatedAt: 0
      },
      {
        id: 'finished',
        name: 'Finished',
        description: 'Books you\'ve completed reading',
        type: 'smart',
        filter: (book: Book) => book.progress === 1,
        bookIds: books.filter(book => book.progress === 1).map(book => book.id),
        createdAt: 0,
        updatedAt: 0
      },
      {
        id: 'recently-added',
        name: 'Recently Added',
        description: 'Books added in the last 30 days',
        type: 'smart',
        filter: (book: Book) => {
          const thirtyDaysAgo = Date.now() - (30 * 24 * 60 * 60 * 1000)
          return book.addedAt > thirtyDaysAgo
        },
        bookIds: books.filter(book => {
          const thirtyDaysAgo = Date.now() - (30 * 24 * 60 * 60 * 1000)
          return book.addedAt > thirtyDaysAgo
        }).map(book => book.id),
        createdAt: 0,
        updatedAt: 0
      }
    ]

    return smartCollections
  }, [])

  // Get collections by tag
  const getTagCollections = useCallback((books: Book[]): SmartCollection[] => {
    const tagCounts = new Map<string, string[]>()

    books.forEach(book => {
      book.tags.forEach(tag => {
        if (!tagCounts.has(tag)) {
          tagCounts.set(tag, [])
        }
        tagCounts.get(tag)!.push(book.id)
      })
    })

    return Array.from(tagCounts.entries())
      .filter(([tag, bookIds]) => bookIds.length > 0)
      .map(([tag, bookIds]) => ({
        id: `tag-${tag}`,
        name: tag,
        description: `${bookIds.length} books tagged with "${tag}"`,
        type: 'smart' as const,
        filter: (book: Book) => book.tags.includes(tag),
        bookIds,
        createdAt: 0,
        updatedAt: 0
      }))
  }, [])

  // Get all collections (smart + custom)
  const getAllCollections = useCallback((books: Book[]): CollectionItem[] => {
    const smartCollections = getSmartCollections(books)
    const tagCollections = getTagCollections(books)

    return [...smartCollections, ...tagCollections, ...collections]
  }, [collections, getSmartCollections, getTagCollections])

  // Get collection by ID
  const getCollectionById = useCallback((id: string, books?: Book[]): CollectionItem | null => {
    // Check custom collections
    const customCollection = collections.find(collection => collection.id === id)
    if (customCollection) return customCollection

    // Check smart collections if books are provided
    if (books) {
      const allCollections = getAllCollections(books)
      return allCollections.find(collection => collection.id === id) || null
    }

    return null
  }, [collections, getAllCollections])

  return {
    // Data
    collections,
    isLoaded,

    // Actions
    createCollection,
    updateCollection,
    deleteCollection,
    addBookToCollection,
    removeBookFromCollection,

    // Getters
    getSmartCollections,
    getTagCollections,
    getAllCollections,
    getCollectionById,

    // Computed
    totalCollections: collections.length,
    collectionsWithBooks: collections.filter(c => c.bookIds.length > 0)
  }
}
