'use client'

import { useState, useCallback, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Upload,
  X,
  FileText,
  AlertCircle,
  CheckCircle,
  Loader2,
  BookOpen
} from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Progress } from '@/components/ui/progress'
import { bookStorage, fileStorage } from '@/lib/storage'
import { Book, UploadProgress } from '@/types'
import { generateId, isValidPDFFile } from '@/lib/utils'

interface UploadDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onUploadComplete: (book: Book) => void
}

export function UploadDialog({ open, onOpenChange, onUploadComplete }: UploadDialogProps) {
  const [isDragOver, setIsDragOver] = useState(false)
  const [selectedFiles, setSelectedFiles] = useState<File[]>([])
  const [uploadProgress, setUploadProgress] = useState<UploadProgress[]>([])
  const [currentBook, setCurrentBook] = useState<Partial<Book>>({
    title: '',
    author: '',
    tags: [],
  })
  const [isUploading, setIsUploading] = useState(false)
  const [error, setError] = useState<string>('')
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(true)
  }, [])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(false)
  }, [])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(false)

    const files = Array.from(e.dataTransfer.files).filter(isValidPDFFile)
    if (files.length > 0) {
      setSelectedFiles(files)
      setError('')
      // Auto-fill title from first file
      if (files[0]) {
        setCurrentBook(prev => ({
          ...prev,
          title: files[0].name.replace('.pdf', '')
        }))
      }
    } else {
      setError('Please select valid PDF files only.')
    }
  }, [])

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []).filter(isValidPDFFile)
    if (files.length > 0) {
      setSelectedFiles(files)
      setError('')
      // Auto-fill title from first file
      if (files[0]) {
        setCurrentBook(prev => ({
          ...prev,
          title: files[0].name.replace('.pdf', '')
        }))
      }
    } else {
      setError('Please select valid PDF files only.')
    }
  }

  const extractPDFMetadata = async (file: File): Promise<Partial<Book>> => {
    try {
      // Import PDF.js dynamically to avoid SSR issues
      const pdfjsLib = await import('pdfjs-dist')

      // Set worker source
      pdfjsLib.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjsLib.version}/build/pdf.worker.min.js`

      const arrayBuffer = await file.arrayBuffer()
      const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise

      const metadata = await pdf.getMetadata()
      const pages = pdf.numPages

      // Try to extract cover image from first page
      let coverThumb: string | undefined
      try {
        const page = await pdf.getPage(1)
        const viewport = page.getViewport({ scale: 0.3 })
        const canvas = document.createElement('canvas')
        const context = canvas.getContext('2d')

        if (context) {
          canvas.height = viewport.height
          canvas.width = viewport.width

          await page.render({
            canvasContext: context,
            viewport: viewport
          }).promise

          coverThumb = canvas.toDataURL('image/png')
        }
      } catch (coverError) {
        console.warn('Could not extract cover:', coverError)
      }

      return {
        title: metadata.info?.Title || file.name.replace('.pdf', ''),
        author: metadata.info?.Author,
        pages,
        coverThumb,
      }
    } catch (error) {
      console.warn('Could not extract PDF metadata:', error)
      return {
        title: file.name.replace('.pdf', ''),
      }
    }
  }

  const handleUpload = async () => {
    if (selectedFiles.length === 0) return

    setIsUploading(true)
    setError('')

    try {
      for (const file of selectedFiles) {
        const progress: UploadProgress = {
          file,
          progress: 0,
          status: 'uploading'
        }

        setUploadProgress(prev => [...prev, progress])

        // Extract metadata
        const metadata = await extractPDFMetadata(file)

        // Save file to IndexedDB
        const fileId = await fileStorage.save(file)

        // Create book record
        const book: Book = {
          id: generateId(),
          title: currentBook.title || metadata.title || file.name.replace('.pdf', ''),
          author: currentBook.author || metadata.author,
          tags: currentBook.tags || [],
          source: 'uploaded',
          fileId,
          coverThumb: metadata.coverThumb,
          pages: metadata.pages,
          addedAt: Date.now(),
          progress: 0,
          ...metadata,
        }

        // Save book to storage
        await bookStorage.save(book)

        // Update progress
        setUploadProgress(prev =>
          prev.map(p =>
            p.file === file
              ? { ...p, progress: 100, status: 'completed' }
              : p
          )
        )

        // Notify parent
        onUploadComplete(book)
      }

      // Reset form
      setSelectedFiles([])
      setCurrentBook({ title: '', author: '', tags: [] })
      setUploadProgress([])
      onOpenChange(false)

    } catch (error) {
      console.error('Upload failed:', error)
      setError('Upload failed. Please try again.')
      setUploadProgress(prev =>
        prev.map(p => ({ ...p, status: 'error', error: 'Upload failed' }))
      )
    } finally {
      setIsUploading(false)
    }
  }

  const removeFile = (fileToRemove: File) => {
    setSelectedFiles(prev => prev.filter(file => file !== fileToRemove))
    setUploadProgress(prev => prev.filter(p => p.file !== fileToRemove))
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Upload className="w-5 h-5" />
            Add Books to Your Library
          </DialogTitle>
          <DialogDescription>
            Upload PDF files to build your personal self-help library.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Drop Zone */}
          <div
            className={`relative border-2 border-dashed rounded-xl p-8 text-center transition-all duration-300 ${
              isDragOver
                ? 'border-primary bg-primary/5 scale-105'
                : 'border-muted-foreground/25 hover:border-muted-foreground/50'
            }`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf"
              multiple
              onChange={handleFileSelect}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            />

            <motion.div
              animate={{ scale: isDragOver ? 1.1 : 1 }}
              transition={{ duration: 0.2 }}
            >
              <Upload className={`w-12 h-12 mx-auto mb-4 ${
                isDragOver ? 'text-primary' : 'text-muted-foreground'
              }`} />
              <h3 className="text-lg font-semibold mb-2">
                {isDragOver ? 'Drop your PDFs here' : 'Drag & drop PDF files'}
              </h3>
              <p className="text-muted-foreground mb-4">
                or click to browse files from your computer
              </p>
              <Button variant="outline" type="button">
                Choose Files
              </Button>
            </motion.div>
          </div>

          {/* Error Message */}
          <AnimatePresence>
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="flex items-center gap-2 p-3 bg-destructive/10 text-destructive rounded-lg"
              >
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                {error}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Selected Files */}
          <AnimatePresence>
            {selectedFiles.length > 0 && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="space-y-3"
              >
                <h4 className="font-medium">Selected Files:</h4>
                {selectedFiles.map((file, index) => {
                  const progress = uploadProgress.find(p => p.file === file)
                  return (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 20 }}
                      className="flex items-center gap-3 p-3 bg-muted rounded-lg"
                    >
                      <FileText className="w-5 h-5 text-muted-foreground flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="font-medium truncate">{file.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {(file.size / 1024 / 1024).toFixed(1)} MB
                        </p>
                        {progress && (
                          <div className="mt-2">
                            <Progress value={progress.progress} className="h-1" />
                            <p className="text-xs text-muted-foreground mt-1">
                              {progress.status === 'completed' && <CheckCircle className="w-3 h-3 inline mr-1 text-green-500" />}
                              {progress.status === 'error' && <AlertCircle className="w-3 h-3 inline mr-1 text-red-500" />}
                              {progress.status === 'uploading' && <Loader2 className="w-3 h-3 inline mr-1 animate-spin" />}
                              {progress.status}
                            </p>
                          </div>
                        )}
                      </div>
                      {!isUploading && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeFile(file)}
                          className="flex-shrink-0"
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      )}
                    </motion.div>
                  )
                })}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Book Details Form */}
          <AnimatePresence>
            {selectedFiles.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="space-y-4"
              >
                <h4 className="font-medium">Book Details:</h4>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium mb-2 block">Title</label>
                    <Input
                      value={currentBook.title}
                      onChange={(e) => setCurrentBook(prev => ({ ...prev, title: e.target.value }))}
                      placeholder="Book title"
                    />
                  </div>

                  <div>
                    <label className="text-sm font-medium mb-2 block">Author (optional)</label>
                    <Input
                      value={currentBook.author || ''}
                      onChange={(e) => setCurrentBook(prev => ({ ...prev, author: e.target.value }))}
                      placeholder="Author name"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block">Tags (optional)</label>
                  <Input
                    value={currentBook.tags?.join(', ') || ''}
                    onChange={(e) => setCurrentBook(prev => ({
                      ...prev,
                      tags: e.target.value.split(',').map(tag => tag.trim()).filter(Boolean)
                    }))}
                    placeholder="Productivity, Mindfulness, Habits (comma separated)"
                  />
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-4">
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isUploading}
            >
              Cancel
            </Button>
            <Button
              onClick={handleUpload}
              disabled={selectedFiles.length === 0 || isUploading || !currentBook.title?.trim()}
              className="gap-2"
            >
              {isUploading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <BookOpen className="w-4 h-4" />
              )}
              {isUploading ? 'Uploading...' : 'Add to Library'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
