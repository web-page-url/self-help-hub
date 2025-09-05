'use client'

import { useState, useEffect, useCallback } from 'react'
import { Book, bookStorage } from '@/lib/storage'

export function useBooks() {
  const [books, setBooks] = useState<Book[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Load books on mount
  useEffect(() => {
    const loadBooks = async () => {
      try {
        setIsLoading(true)
        const loadedBooks = await bookStorage.getAll()
        setBooks(loadedBooks)
      } catch (err) {
        setError('Failed to load books')
        console.error('Failed to load books:', err)
      } finally {
        setIsLoading(false)
      }
    }

    loadBooks()
  }, [])

  // Add a new book
  const addBook = useCallback(async (book: Book) => {
    try {
      await bookStorage.save(book)
      setBooks(prev => [book, ...prev])
      return book
    } catch (err) {
      setError('Failed to add book')
      console.error('Failed to add book:', err)
      throw err
    }
  }, [])

  // Update a book
  const updateBook = useCallback(async (id: string, updates: Partial<Book>) => {
    try {
      const existingBook = await bookStorage.getById(id)
      if (!existingBook) throw new Error('Book not found')

      const updatedBook = { ...existingBook, ...updates }
      await bookStorage.save(updatedBook)

      setBooks(prev => prev.map(book =>
        book.id === id ? updatedBook : book
      ))

      return updatedBook
    } catch (err) {
      setError('Failed to update book')
      console.error('Failed to update book:', err)
      throw err
    }
  }, [])

  // Delete a book
  const deleteBook = useCallback(async (id: string) => {
    try {
      await bookStorage.delete(id)
      setBooks(prev => prev.filter(book => book.id !== id))
    } catch (err) {
      setError('Failed to delete book')
      console.error('Failed to delete book:', err)
      throw err
    }
  }, [])

  // Get book by ID
  const getBookById = useCallback((id: string) => {
    return books.find(book => book.id === id) || null
  }, [books])

  // Search books
  const searchBooks = useCallback((query: string) => {
    if (!query.trim()) return books

    const lowercaseQuery = query.toLowerCase()
    return books.filter(book =>
      book.title.toLowerCase().includes(lowercaseQuery) ||
      book.author?.toLowerCase().includes(lowercaseQuery) ||
      book.tags.some(tag => tag.toLowerCase().includes(lowercaseQuery)) ||
      book.description?.toLowerCase().includes(lowercaseQuery)
    )
  }, [books])

  // Filter books by criteria
  const filterBooks = useCallback((filters: {
    tags?: string[]
    source?: Book['source']
    progress?: 'unread' | 'started' | 'finished'
    year?: string
  }) => {
    return books.filter(book => {
      // Tag filter
      if (filters.tags && filters.tags.length > 0) {
        const hasMatchingTag = filters.tags.some(tag =>
          book.tags.includes(tag)
        )
        if (!hasMatchingTag) return false
      }

      // Source filter
      if (filters.source && book.source !== filters.source) {
        return false
      }

      // Progress filter
      if (filters.progress) {
        const progress = book.progress || 0
        switch (filters.progress) {
          case 'unread':
            if (progress > 0) return false
            break
          case 'started':
            if (progress === 0 || progress === 1) return false
            break
          case 'finished':
            if (progress !== 1) return false
            break
        }
      }

      // Year filter
      if (filters.year && book.year !== filters.year) {
        return false
      }

      return true
    })
  }, [books])

  // Sort books
  const sortBooks = useCallback((sortBy: string) => {
    const sorted = [...books]

    switch (sortBy) {
      case 'added-desc':
        return sorted.sort((a, b) => b.addedAt - a.addedAt)
      case 'added-asc':
        return sorted.sort((a, b) => a.addedAt - b.addedAt)
      case 'title-asc':
        return sorted.sort((a, b) => a.title.localeCompare(b.title))
      case 'title-desc':
        return sorted.sort((a, b) => b.title.localeCompare(a.title))
      case 'author-asc':
        return sorted.sort((a, b) => (a.author || '').localeCompare(b.author || ''))
      case 'author-desc':
        return sorted.sort((a, b) => (b.author || '').localeCompare(a.author || ''))
      case 'progress-desc':
        return sorted.sort((a, b) => (b.progress || 0) - (a.progress || 0))
      default:
        return sorted
    }
  }, [books])

  // Get statistics
  const getStats = useCallback(() => {
    const totalBooks = books.length
    const finishedBooks = books.filter(book => book.progress === 1).length
    const inProgressBooks = books.filter(book => book.progress && book.progress > 0 && book.progress < 1).length
    const unreadBooks = books.filter(book => !book.progress || book.progress === 0).length

    const totalPages = books.reduce((sum, book) => sum + (book.pages || 0), 0)
    const readPages = books.reduce((sum, book) => sum + ((book.pages || 0) * (book.progress || 0)), 0)

    return {
      totalBooks,
      finishedBooks,
      inProgressBooks,
      unreadBooks,
      totalPages,
      readPages,
      completionRate: totalBooks > 0 ? (finishedBooks / totalBooks) * 100 : 0
    }
  }, [books])

  return {
    // Data
    books,
    isLoading,
    error,

    // Actions
    addBook,
    updateBook,
    deleteBook,

    // Getters
    getBookById,
    searchBooks,
    filterBooks,
    sortBooks,
    getStats,

    // Computed
    totalBooks: books.length,
    finishedBooks: books.filter(book => book.progress === 1).length,
    inProgressBooks: books.filter(book => book.progress && book.progress > 0 && book.progress < 1).length,
    unreadBooks: books.filter(book => !book.progress || book.progress === 0).length
  }
}
