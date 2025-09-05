import FlexSearch from 'flexsearch'
import { Book, Annotation, SearchResult } from '@/types'

// Initialize search indexes
const bookIndex = new FlexSearch.Document({
  document: {
    id: 'id',
    index: [
      'title',
      'author',
      'tags[]',
      'description'
    ],
    store: ['title', 'author', 'tags', 'description', 'coverThumb', 'progress']
  }
})

const annotationIndex = new FlexSearch.Document({
  document: {
    id: 'id',
    index: [
      'text'
    ],
    store: ['text', 'page', 'type', 'createdAt']
  }
})

let isInitialized = false

export class SearchEngine {
  private static instance: SearchEngine
  private books: Book[] = []
  private annotations: Annotation[] = []

  private constructor() {}

  private clearIndexes() {
    // Recreate the indexes to clear them
    Object.assign(bookIndex, new FlexSearch.Document({
      document: {
        id: 'id',
        index: [
          'title',
          'author',
          'tags[]',
          'description'
        ],
        store: ['title', 'author', 'tags', 'description', 'coverThumb', 'progress']
      }
    }))

    Object.assign(annotationIndex, new FlexSearch.Document({
      document: {
        id: 'id',
        index: [
          'text'
        ],
        store: ['text', 'page', 'type', 'createdAt']
      }
    }))
  }

  static getInstance(): SearchEngine {
    if (!SearchEngine.instance) {
      SearchEngine.instance = new SearchEngine()
    }
    return SearchEngine.instance
  }

  async initialize(books: Book[], annotations: Annotation[]) {
    if (isInitialized) return

    this.books = books
    this.annotations = annotations

    // Clear existing indexes by recreating them
    this.clearIndexes()

    // Add books to index
    for (const book of books) {
      await bookIndex.addAsync(book)
    }

    // Add annotations to index
    for (const annotation of annotations) {
      await annotationIndex.addAsync({
        ...annotation,
        bookTitle: books.find(b => b.id === annotation.bookId)?.title || ''
      })
    }

    isInitialized = true
  }

  async search(query: string, limit: number = 20): Promise<SearchResult[]> {
    if (!query.trim()) return []

    const results: SearchResult[] = []

    try {
      // Search books
      const bookResults = await bookIndex.searchAsync(query, {
        limit,
        enrich: true
      })

      for (const result of bookResults) {
        for (const item of result.result) {
          const book = item.doc as Book
          results.push({
            id: book.id,
            type: 'book',
            title: book.title,
            subtitle: book.author ? `by ${book.author}` : undefined,
            excerpt: book.description,
            score: item.score || 0
          })
        }
      }

      // Search annotations
      const annotationResults = await annotationIndex.searchAsync(query, {
        limit,
        enrich: true
      })

      for (const result of annotationResults) {
        for (const item of result.result) {
          const annotation = item.doc as Annotation
          const book = this.books.find(b => b.id === annotation.bookId)

          results.push({
            id: annotation.id,
            type: 'annotation',
            title: this.getAnnotationTitle(annotation),
            subtitle: book?.title || 'Unknown Book',
            excerpt: annotation.text,
            score: item.score || 0,
            bookId: annotation.bookId,
            page: annotation.page
          })
        }
      }

      // Sort by score and return top results
      return results
        .sort((a, b) => b.score - a.score)
        .slice(0, limit)

    } catch (error) {
      console.error('Search error:', error)
      return []
    }
  }

  private getAnnotationTitle(annotation: Annotation): string {
    switch (annotation.type) {
      case 'highlight':
        return 'Highlight'
      case 'note':
        return 'Note'
      case 'bookmark':
        return 'Bookmark'
      case 'quote':
        return 'Quote'
      default:
        return 'Annotation'
    }
  }

  async updateBook(book: Book) {
    try {
      await bookIndex.updateAsync(book)
      // Update in local books array
      const index = this.books.findIndex(b => b.id === book.id)
      if (index !== -1) {
        this.books[index] = book
      } else {
        this.books.push(book)
        await bookIndex.addAsync(book)
      }
    } catch (error) {
      console.error('Failed to update book in search index:', error)
    }
  }

  async removeBook(bookId: string) {
    try {
      await bookIndex.removeAsync(bookId)
      this.books = this.books.filter(b => b.id !== bookId)

      // Remove related annotations
      const relatedAnnotations = this.annotations.filter(a => a.bookId === bookId)
      for (const annotation of relatedAnnotations) {
        await annotationIndex.removeAsync(annotation.id)
      }
      this.annotations = this.annotations.filter(a => a.bookId !== bookId)
    } catch (error) {
      console.error('Failed to remove book from search index:', error)
    }
  }

  async updateAnnotation(annotation: Annotation) {
    try {
      await annotationIndex.updateAsync(annotation)
      // Update in local annotations array
      const index = this.annotations.findIndex(a => a.id === annotation.id)
      if (index !== -1) {
        this.annotations[index] = annotation
      } else {
        this.annotations.push(annotation)
        await annotationIndex.addAsync(annotation)
      }
    } catch (error) {
      console.error('Failed to update annotation in search index:', error)
    }
  }

  async removeAnnotation(annotationId: string) {
    try {
      await annotationIndex.removeAsync(annotationId)
      this.annotations = this.annotations.filter(a => a.id !== annotationId)
    } catch (error) {
      console.error('Failed to remove annotation from search index:', error)
    }
  }

  // Get search suggestions
  async getSuggestions(query: string, limit: number = 5): Promise<string[]> {
    if (!query.trim()) return []

    try {
      const results = await this.search(query, limit)
      const suggestions: string[] = []

      for (const result of results) {
        if (result.type === 'book') {
          suggestions.push(result.title)
          if (result.subtitle) {
            suggestions.push(result.subtitle)
          }
        } else {
          suggestions.push(result.title)
        }
      }

      return [...new Set(suggestions)].slice(0, limit)
    } catch (error) {
      console.error('Failed to get suggestions:', error)
      return []
    }
  }
}

// Export singleton instance
export const searchEngine = SearchEngine.getInstance()

// Utility functions
export function highlightText(text: string, query: string): string {
  if (!query.trim()) return text

  const regex = new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi')
  return text.replace(regex, '<mark class="bg-yellow-200 dark:bg-yellow-800">$1</mark>')
}

export function debounce<T extends (...args: any[]) => void>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout
  return (...args: Parameters<T>) => {
    clearTimeout(timeout)
    timeout = setTimeout(() => func(...args), wait)
  }
}
