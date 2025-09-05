import localforage from 'localforage'
import { Book, Annotation, Settings, Collection, LibraryManifest } from '@/types'

// Initialize storage instances
const booksStore = localforage.createInstance({
  name: 'SelfHelpHub',
  storeName: 'books'
})

const annotationsStore = localforage.createInstance({
  name: 'SelfHelpHub',
  storeName: 'annotations'
})

const filesStore = localforage.createInstance({
  name: 'SelfHelpHub',
  storeName: 'files'
})

const collectionsStore = localforage.createInstance({
  name: 'SelfHelpHub',
  storeName: 'collections'
})

const settingsStore = localforage.createInstance({
  name: 'SelfHelpHub',
  storeName: 'settings'
})

// Books operations
export const bookStorage = {
  async getAll(): Promise<Book[]> {
    const books: Book[] = []
    await booksStore.iterate((value: Book) => {
      books.push(value)
    })
    return books.sort((a, b) => (b.lastOpenedAt || 0) - (a.lastOpenedAt || 0))
  },

  async getById(id: string): Promise<Book | null> {
    try {
      return await booksStore.getItem<Book>(id)
    } catch {
      return null
    }
  },

  async save(book: Book): Promise<void> {
    await booksStore.setItem(book.id, book)
  },

  async delete(id: string): Promise<void> {
    const book = await this.getById(id)
    if (book?.fileId) {
      await filesStore.removeItem(book.fileId)
    }
    await booksStore.removeItem(id)

    // Also remove related annotations
    const annotations = await annotationStorage.getByBookId(id)
    for (const annotation of annotations) {
      await annotationsStore.removeItem(annotation.id)
    }
  },

  async updateProgress(id: string, progress: number): Promise<void> {
    const book = await this.getById(id)
    if (book) {
      book.progress = progress
      book.lastOpenedAt = Date.now()
      await this.save(book)
    }
  }
}

// Annotations operations
export const annotationStorage = {
  async getAll(): Promise<Annotation[]> {
    const annotations: Annotation[] = []
    await annotationsStore.iterate((value: Annotation) => {
      annotations.push(value)
    })
    return annotations.sort((a, b) => b.createdAt - a.createdAt)
  },

  async getByBookId(bookId: string): Promise<Annotation[]> {
    const annotations: Annotation[] = []
    await annotationsStore.iterate((value: Annotation) => {
      if (value.bookId === bookId) {
        annotations.push(value)
      }
    })
    return annotations.sort((a, b) => a.page - b.page)
  },

  async save(annotation: Annotation): Promise<void> {
    await annotationsStore.setItem(annotation.id, annotation)
  },

  async delete(id: string): Promise<void> {
    await annotationsStore.removeItem(id)
  }
}

// Collections operations
export const collectionStorage = {
  async getAll(): Promise<Collection[]> {
    const collections: Collection[] = []
    await collectionsStore.iterate((value: Collection) => {
      collections.push(value)
    })
    return collections.sort((a, b) => b.updatedAt - a.updatedAt)
  },

  async getById(id: string): Promise<Collection | null> {
    try {
      return await collectionsStore.getItem<Collection>(id)
    } catch {
      return null
    }
  },

  async save(collection: Collection): Promise<void> {
    collection.updatedAt = Date.now()
    await collectionsStore.setItem(collection.id, collection)
  },

  async delete(id: string): Promise<void> {
    await collectionsStore.removeItem(id)
  }
}

// File operations for PDF storage
export const fileStorage = {
  async save(file: File): Promise<string> {
    const fileId = `file_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    await filesStore.setItem(fileId, file)
    return fileId
  },

  async get(fileId: string): Promise<File | null> {
    try {
      return await filesStore.getItem<File>(fileId)
    } catch {
      return null
    }
  },

  async delete(fileId: string): Promise<void> {
    await filesStore.removeItem(fileId)
  }
}


// Export/Import operations
export const exportStorage = {
  async exportLibrary(includeFiles: boolean = false): Promise<Blob> {
    const [books, annotations, collections] = await Promise.all([
      bookStorage.getAll(),
      annotationStorage.getAll(),
      collectionStorage.getAll()
    ])

    const manifest: LibraryManifest = {
      version: '1.0.0',
      books: books.map(book => ({ ...book, fileId: undefined })),
      annotations,
      collections,
      settings: await settingsStorage.getSettings(),
      exportedAt: Date.now()
    }

    if (includeFiles) {
      // Create ZIP with files
      const JSZip = (await import('jszip')).default
      const zip = new JSZip()

      // Add manifest
      zip.file('manifest.json', JSON.stringify(manifest, null, 2))

      // Add PDF files
      for (const book of books) {
        if (book.fileId) {
          const file = await fileStorage.get(book.fileId)
          if (file) {
            zip.file(`${book.title.replace(/[^a-z0-9]/gi, '_')}.pdf`, file)
          }
        }
      }

      return await zip.generateAsync({ type: 'blob' })
    } else {
      // Just return JSON manifest
      return new Blob([JSON.stringify(manifest, null, 2)], {
        type: 'application/json'
      })
    }
  },

  async importLibrary(file: File): Promise<void> {
    if (file.type === 'application/json') {
      const text = await file.text()
      const manifest: LibraryManifest = JSON.parse(text)

      // Import books
      for (const book of manifest.books) {
        await bookStorage.save(book)
      }

      // Import annotations
      for (const annotation of manifest.annotations) {
        await annotationStorage.save(annotation)
      }

      // Import collections
      for (const collection of manifest.collections) {
        await collectionStorage.save(collection)
      }

      // Import settings
      await settingsStorage.saveSettings(manifest.settings)

    } else if (file.type === 'application/zip') {
      // Handle ZIP import
      const JSZip = (await import('jszip')).default
      const zip = await JSZip.loadAsync(file)

      const manifestFile = zip.file('manifest.json')
      if (!manifestFile) throw new Error('Invalid ZIP file: missing manifest.json')

      const manifestText = await manifestFile.async('text')
      const manifest: LibraryManifest = JSON.parse(manifestText)

      // Import data
      for (const book of manifest.books) {
        await bookStorage.save(book)
      }

      for (const annotation of manifest.annotations) {
        await annotationStorage.save(annotation)
      }

      for (const collection of manifest.collections) {
        await collectionStorage.save(collection)
      }

      await settingsStorage.saveSettings(manifest.settings)
    }
  }
}

// Storage cleanup operations
export const cleanupStorage = {
  async clearAll(): Promise<void> {
    await Promise.all([
      booksStore.clear(),
      annotationsStore.clear(),
      filesStore.clear(),
      collectionsStore.clear(),
      settingsStore.clear()
    ])

    if (typeof window !== 'undefined') {
      localStorage.removeItem('selfhelphub_settings')
    }
  },

  async getStorageStats(): Promise<{
    books: number
    annotations: number
    files: number
    collections: number
    totalSize: number
  }> {
    const [books, annotations, files, collections] = await Promise.all([
      bookStorage.getAll(),
      annotationStorage.getAll(),
      this.getAllFiles(),
      collectionStorage.getAll()
    ])

    let totalSize = 0

    // Calculate file sizes
    for (const file of files) {
      totalSize += file.size
    }

    return {
      books: books.length,
      annotations: annotations.length,
      files: files.length,
      collections: collections.length,
      totalSize
    }
  },

  async getAllFiles(): Promise<File[]> {
    const files: File[] = []
    await filesStore.iterate((value: File) => {
      files.push(value)
    })
    return files
  }
}

// Settings operations
export const settingsStorage = {
  async getSettings(): Promise<Settings> {
    const settings = await settingsStore.getItem<Settings>('user-settings')
    return settings || {
      theme: 'system',
      onboardingComplete: false,
      reader: {
        zoom: 1.0,
        spread: 'single',
        lineHeight: 1.4,
        tts: true
      }
    }
  },

  async saveSettings(settings: Settings): Promise<void> {
    await settingsStore.setItem('user-settings', settings)
  },

  async clear(): Promise<void> {
    await settingsStore.clear()
  }
}
