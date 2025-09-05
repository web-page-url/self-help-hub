'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import {
  ChevronLeft,
  ChevronRight,
  ZoomIn,
  ZoomOut,
  RotateCw,
  Maximize,
  Minimize,
  Settings,
  Bookmark,
  Highlighter,
  MessageSquare,
  Play,
  Pause,
  SkipBack,
  SkipForward,
  X,
  MoreVertical,
  BookOpen,
  Clock,
  Volume2
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { bookStorage, annotationStorage, fileStorage } from '@/lib/storage'
import { Book, Annotation, PDFViewerState } from '@/types'
import { formatReadingTime, generateId } from '@/lib/utils'
import { searchEngine } from '@/lib/search'
import { useTextToSpeech } from '@/hooks/use-text-to-speech'
import { TTSControls } from '@/components/tts-controls'
import { useReadingGoals } from '@/hooks/use-reading-goals'
import { MilestoneCelebration } from '@/components/confetti-celebration'

export default function PDFReaderPage() {
  const params = useParams()
  const router = useRouter()
  const bookId = params.id as string

  const [book, setBook] = useState<Book | null>(null)
  const [pdfState, setPdfState] = useState<PDFViewerState>({
    currentPage: 1,
    totalPages: 0,
    zoom: 1.0,
    spread: 'single',
    isLoading: true,
    error: null
  })

  const [annotations, setAnnotations] = useState<Annotation[]>([])
  const [showControls, setShowControls] = useState(true)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [sidebarTab, setSidebarTab] = useState<'thumbnails' | 'highlights' | 'notes' | 'search' | 'tts'>('thumbnails')
  const [selectedText, setSelectedText] = useState<string>('')
  const [selectionRect, setSelectionRect] = useState<{ x: number; y: number; w: number; h: number } | null>(null)
  const [annotationMode, setAnnotationMode] = useState<'highlight' | 'note' | 'bookmark' | null>(null)
  const [noteDialogOpen, setNoteDialogOpen] = useState(false)
  const [noteText, setNoteText] = useState('')
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState<any[]>([])
  const [extractedText, setExtractedText] = useState<string>('')

  const canvasRef = useRef<HTMLCanvasElement>(null)
  const pdfRef = useRef<any>(null)
  const controlsTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  // TTS Hook
  const tts = useTextToSpeech()

  // Reading Goals Hook
  const { startReadingSession, endReadingSession, uncelebratedMilestones, markMilestoneCelebrated } = useReadingGoals()

  // Reading session state
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null)
  const [sessionStartPage, setSessionStartPage] = useState(1)
  const [celebratingMilestone, setCelebratingMilestone] = useState<any>(null)

  // Extract text from current page for TTS
  const extractPageText = async (pageNum: number): Promise<string> => {
    if (!pdfRef.current) return ''

    try {
      const page = await pdfRef.current.getPage(pageNum)
      const textContent = await page.getTextContent()
      const text = textContent.items
        .map((item: any) => item.str)
        .join(' ')
        .replace(/\s+/g, ' ')
        .trim()

      setExtractedText(text)
      return text
    } catch (error) {
      console.error('Failed to extract text:', error)
      return ''
    }
  }

  // Handle TTS speak with current page text
  const handleTTSSpeak = async (text?: string) => {
    const textToSpeak = text || selectedText || extractedText
    if (textToSpeak) {
      tts.speak(textToSpeak, (index, word) => {
        // Highlight current word (future enhancement)
        console.log('Speaking word:', word, 'at index:', index)
      })
    }
  }

  // Load book and PDF
  useEffect(() => {
    const loadBook = async () => {
      try {
        const loadedBook = await bookStorage.getById(bookId)
        if (!loadedBook) {
          router.push('/library')
          return
        }

        setBook(loadedBook)

        // Load PDF
        await loadPDF(loadedBook)

        // Load annotations
        const bookAnnotations = await annotationStorage.getByBookId(bookId)
        setAnnotations(bookAnnotations)

        // Update last opened
        loadedBook.lastOpenedAt = Date.now()
        await bookStorage.save(loadedBook)

      } catch (error) {
        console.error('Failed to load book:', error)
        const errorMessage = error instanceof Error ? error.message : 'Failed to load book'
        setPdfState(prev => ({ ...prev, error: errorMessage }))
      }
    }

    if (bookId) {
      loadBook()
    }
  }, [bookId, router])

  const loadPDF = async (book: Book) => {
    try {
      setPdfState(prev => ({ ...prev, isLoading: true, error: null }))

      // Import PDF.js
      const pdfjsLib = await import('pdfjs-dist')

      // Set worker source using local file (most reliable)
      pdfjsLib.GlobalWorkerOptions.workerSrc = '/pdf.worker.min.js'

      // Load PDF from IndexedDB
      if (!book.fileId) {
        throw new Error('No PDF file associated with this book')
      }

      const file = await fileStorage.get(book.fileId)
      if (!file) {
        throw new Error('PDF file not found in storage. The file may have been deleted or corrupted.')
      }

      const arrayBuffer = await file.arrayBuffer()
      if (!arrayBuffer || arrayBuffer.byteLength === 0) {
        throw new Error('PDF file appears to be empty or corrupted')
      }

      const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise

      pdfRef.current = pdf
      setPdfState(prev => ({
        ...prev,
        totalPages: pdf.numPages,
        isLoading: false
      }))

      // Render first page
      await renderPage(1)

    } catch (error) {
      console.error('Failed to load PDF:', error)
      const errorMessage = error instanceof Error ? error.message : 'Failed to load PDF'
      setPdfState(prev => ({
        ...prev,
        isLoading: false,
        error: errorMessage
      }))
    }
  }

  const renderPage = async (pageNum: number) => {
    if (!pdfRef.current || !canvasRef.current) return

    try {
      const page = await pdfRef.current.getPage(pageNum)
      const viewport = page.getViewport({ scale: pdfState.zoom })

      const canvas = canvasRef.current
      const context = canvas.getContext('2d')

      if (!context) return

      canvas.height = viewport.height
      canvas.width = viewport.width

      const renderContext = {
        canvasContext: context,
        viewport: viewport
      }

      await page.render(renderContext).promise

    } catch (error) {
      console.error('Failed to render page:', error)
    }
  }

  // Auto-hide controls
  const resetControlsTimeout = useCallback(() => {
    if (controlsTimeoutRef.current) {
      clearTimeout(controlsTimeoutRef.current)
    }
    setShowControls(true)
    controlsTimeoutRef.current = setTimeout(() => {
      setShowControls(false)
    }, 3000)
  }, [])

  useEffect(() => {
    resetControlsTimeout()
  }, [resetControlsTimeout])

  // Navigation functions
  const goToPage = async (pageNum: number) => {
    if (pageNum < 1 || pageNum > pdfState.totalPages) return

    // Start reading session if not already started
    if (!currentSessionId && book) {
      const sessionId = startReadingSession(book.id)
      setCurrentSessionId(sessionId)
      setSessionStartPage(pageNum)
    }

    setPdfState(prev => ({ ...prev, currentPage: pageNum }))
    await renderPage(pageNum)

    // Extract text for TTS when page changes
    await extractPageText(pageNum)

    // Update progress
    if (book) {
      const progress = pageNum / pdfState.totalPages
      await bookStorage.updateProgress(book.id, progress)
      setBook(prev => prev ? { ...prev, progress } : null)
    }
  }

  const nextPage = () => goToPage(pdfState.currentPage + 1)
  const prevPage = () => goToPage(pdfState.currentPage - 1)

  const zoomIn = async () => {
    const newZoom = Math.min(pdfState.zoom + 0.25, 3.0)
    setPdfState(prev => ({ ...prev, zoom: newZoom }))
    await renderPage(pdfState.currentPage)
  }

  const zoomOut = async () => {
    const newZoom = Math.max(pdfState.zoom - 0.25, 0.5)
    setPdfState(prev => ({ ...prev, zoom: newZoom }))
    await renderPage(pdfState.currentPage)
  }

  // Handle text selection
  const handleTextSelection = useCallback(() => {
    const selection = window.getSelection()
    if (selection && selection.toString().trim()) {
      const text = selection.toString().trim()
      setSelectedText(text)

      // Get selection rectangle (simplified)
      const range = selection.getRangeAt(0)
      const rect = range.getBoundingClientRect()
      const canvasRect = canvasRef.current?.getBoundingClientRect()

      if (canvasRect) {
        setSelectionRect({
          x: rect.left - canvasRect.left,
          y: rect.top - canvasRect.top,
          w: rect.width,
          h: rect.height
        })
      }
    } else {
      setSelectedText('')
      setSelectionRect(null)
    }
  }, [])

  // Create annotation
  const createAnnotation = async (type: 'highlight' | 'note' | 'bookmark', text?: string) => {
    if (!book) return

    const annotation: Annotation = {
      id: generateId(),
      bookId: book.id,
      page: pdfState.currentPage,
      type,
      text: type === 'note' ? text : selectedText,
      rects: selectionRect ? [selectionRect] : undefined,
      createdAt: Date.now(),
      color: type === 'highlight' ? '#fbbf24' : undefined
    }

    await annotationStorage.save(annotation)
    setAnnotations(prev => [...prev, annotation])

    // Reset selection
    setSelectedText('')
    setSelectionRect(null)
    setAnnotationMode(null)

    window.getSelection()?.removeAllRanges()
  }

  // Add bookmark
  const addBookmark = async () => {
    await createAnnotation('bookmark')
  }

  // Add highlight
  const addHighlight = async () => {
    if (selectedText) {
      await createAnnotation('highlight')
    }
  }

  // Add note
  const addNote = async (text: string) => {
    await createAnnotation('note', text)
  }

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      switch (e.key) {
        case 'ArrowLeft':
        case 'k':
          e.preventDefault()
          prevPage()
          break
        case 'ArrowRight':
        case 'j':
          e.preventDefault()
          nextPage()
          break
        case '+':
        case '=':
          e.preventDefault()
          zoomIn()
          break
        case '-':
          e.preventDefault()
          zoomOut()
          break
        case 'b':
          e.preventDefault()
          addBookmark()
          break
        case 'h':
          if (e.ctrlKey || e.metaKey) {
            e.preventDefault()
            addHighlight()
          }
          break
      }
    }

    window.addEventListener('keydown', handleKeyPress)
    return () => window.removeEventListener('keydown', handleKeyPress)
  }, [pdfState.currentPage, pdfState.totalPages, selectedText])

  // Check for new milestones
  useEffect(() => {
    if (uncelebratedMilestones.length > 0 && !celebratingMilestone) {
      const latestMilestone = uncelebratedMilestones[0]
      setCelebratingMilestone(latestMilestone)
    }
  }, [uncelebratedMilestones, celebratingMilestone])

  // Handle milestone celebration completion
  const handleMilestoneComplete = () => {
    if (celebratingMilestone) {
      markMilestoneCelebrated(celebratingMilestone.id)
      setCelebratingMilestone(null)
    }
  }

  // End reading session when component unmounts
  useEffect(() => {
    return () => {
      if (currentSessionId) {
        const pagesRead = pdfState.currentPage - sessionStartPage
        endReadingSession(currentSessionId, Math.max(0, pagesRead))
      }
    }
  }, [currentSessionId, pdfState.currentPage, sessionStartPage, endReadingSession])

  if (!book) {
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
    <div className="h-screen bg-black relative overflow-hidden">
      {/* PDF Canvas */}
      <div
        className="h-full flex items-center justify-center cursor-crosshair"
        onMouseMove={resetControlsTimeout}
        onClick={resetControlsTimeout}
        onMouseUp={handleTextSelection}
      >
        <div className="relative">
          <canvas
            ref={canvasRef}
            className="max-h-full max-w-full shadow-2xl"
            style={{ display: pdfState.isLoading ? 'none' : 'block' }}
          />

          {/* Selection highlight overlay */}
          {selectionRect && (
            <div
              className="absolute bg-yellow-200/50 border-2 border-yellow-400 pointer-events-none"
              style={{
                left: selectionRect.x,
                top: selectionRect.y,
                width: selectionRect.w,
                height: selectionRect.h
              }}
            />
          )}

          {/* Annotation toolbar */}
          {selectedText && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              className="absolute bg-white dark:bg-gray-800 rounded-lg shadow-lg border p-2 flex gap-1 z-10"
              style={{
                left: selectionRect ? selectionRect.x + selectionRect.w / 2 : '50%',
                top: selectionRect ? selectionRect.y - 50 : '50%',
                transform: 'translateX(-50%)'
              }}
            >
              <Button
                size="sm"
                variant="outline"
                onClick={addHighlight}
                className="gap-1"
              >
                <Highlighter className="w-4 h-4" />
                Highlight
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => setNoteDialogOpen(true)}
                className="gap-1"
              >
                <MessageSquare className="w-4 h-4" />
                Note
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={addBookmark}
                className="gap-1"
              >
                <Bookmark className="w-4 h-4" />
                Bookmark
              </Button>
            </motion.div>
          )}
        </div>

        {pdfState.isLoading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex flex-col items-center gap-4"
          >
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            >
              <BookOpen className="w-12 h-12 text-white/50" />
            </motion.div>
            <p className="text-white/70">Loading PDF...</p>
          </motion.div>
        )}

        {pdfState.error && (
          <div className="text-center text-white">
            <p className="text-red-400 mb-4">{pdfState.error}</p>
            <Button onClick={() => router.push('/library')}>
              Back to Library
            </Button>
          </div>
        )}
      </div>

      {/* Top Bar */}
      <AnimatePresence>
        {showControls && (
          <motion.div
            initial={{ opacity: 0, y: -100 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -100 }}
            className="absolute top-0 left-0 right-0 bg-black/80 backdrop-blur-sm border-b border-white/10"
          >
            <div className="flex items-center justify-between p-4">
              <div className="flex items-center gap-4">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => router.push('/library')}
                  className="text-white hover:bg-white/10"
                >
                  <ChevronLeft className="w-4 h-4 mr-2" />
                  Library
                </Button>

                <div className="text-white">
                  <h1 className="font-semibold truncate max-w-xs">{book.title}</h1>
                  <p className="text-sm text-white/70">
                    Page {pdfState.currentPage} of {pdfState.totalPages}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSidebarOpen(!sidebarOpen)}
                  className="text-white hover:bg-white/10"
                >
                  <Settings className="w-4 h-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setSidebarOpen(true)
                    setSidebarTab('tts')
                  }}
                  className="text-white hover:bg-white/10"
                  disabled={!tts.isSupported}
                >
                  <Volume2 className="w-4 h-4" />
                </Button>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="px-4 pb-4">
              <Progress
                value={(pdfState.currentPage / pdfState.totalPages) * 100}
                className="h-1"
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Bottom Controls */}
      <AnimatePresence>
        {showControls && (
          <motion.div
            initial={{ opacity: 0, y: 100 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 100 }}
            className="absolute bottom-0 left-0 right-0 bg-black/80 backdrop-blur-sm border-t border-white/10"
          >
            <div className="flex items-center justify-between p-4">
              {/* Navigation */}
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={prevPage}
                  disabled={pdfState.currentPage <= 1}
                  className="text-white hover:bg-white/10"
                >
                  <ChevronLeft className="w-4 h-4" />
                </Button>

                <span className="text-white text-sm px-3">
                  {pdfState.currentPage} / {pdfState.totalPages}
                </span>

                <Button
                  variant="ghost"
                  size="sm"
                  onClick={nextPage}
                  disabled={pdfState.currentPage >= pdfState.totalPages}
                  className="text-white hover:bg-white/10"
                >
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>

              {/* Zoom */}
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={zoomOut}
                  className="text-white hover:bg-white/10"
                >
                  <ZoomOut className="w-4 h-4" />
                </Button>

                <span className="text-white text-sm w-16 text-center">
                  {Math.round(pdfState.zoom * 100)}%
                </span>

                <Button
                  variant="ghost"
                  size="sm"
                  onClick={zoomIn}
                  className="text-white hover:bg-white/10"
                >
                  <ZoomIn className="w-4 h-4" />
                </Button>
              </div>

              {/* Annotations */}
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-white hover:bg-white/10"
                >
                  <Bookmark className="w-4 h-4" />
                </Button>

                <Button
                  variant="ghost"
                  size="sm"
                  className="text-white hover:bg-white/10"
                >
                  <Highlighter className="w-4 h-4" />
                </Button>

                <Button
                  variant="ghost"
                  size="sm"
                  className="text-white hover:bg-white/10"
                >
                  <MessageSquare className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div
            initial={{ opacity: 0, x: 300 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 300 }}
            className="absolute right-0 top-0 bottom-0 w-80 bg-card border-l border-border"
          >
            <div className="p-4 border-b">
              <div className="flex items-center justify-between">
                <h2 className="font-semibold">Reading Tools</h2>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSidebarOpen(false)}
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            </div>

            <div className="flex border-b">
              {[
                { id: 'thumbnails', label: 'Pages', icon: BookOpen },
                { id: 'highlights', label: 'Highlights', icon: Highlighter },
                { id: 'notes', label: 'Notes', icon: MessageSquare },
                { id: 'tts', label: 'Speak', icon: Volume2 }
              ].map(({ id, label, icon: Icon }) => (
                <Button
                  key={id}
                  variant={sidebarTab === id ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setSidebarTab(id as any)}
                  className="flex-1 rounded-none"
                >
                  <Icon className="w-4 h-4 mr-2" />
                  {label}
                </Button>
              ))}
            </div>

            <div className="p-4">
              {sidebarTab === 'thumbnails' && (
                <div className="space-y-2">
                  {Array.from({ length: pdfState.totalPages }, (_, i) => i + 1).map((pageNum) => (
                    <Button
                      key={pageNum}
                      variant={pageNum === pdfState.currentPage ? 'default' : 'ghost'}
                      size="sm"
                      onClick={() => goToPage(pageNum)}
                      className="w-full justify-start"
                    >
                      Page {pageNum}
                    </Button>
                  ))}
                </div>
              )}

              {sidebarTab === 'highlights' && (
                <div className="space-y-3">
                  {annotations.filter(a => a.type === 'highlight').length === 0 ? (
                    <div className="text-center text-muted-foreground py-8">
                      <Highlighter className="w-8 h-8 mx-auto mb-4 opacity-50" />
                      <p>No highlights yet</p>
                      <p className="text-sm">Select text to highlight</p>
                    </div>
                  ) : (
                    annotations
                      .filter(a => a.type === 'highlight')
                      .map(annotation => (
                        <div key={annotation.id} className="p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border-l-4 border-yellow-400">
                          <p className="text-sm mb-2">"{annotation.text}"</p>
                          <div className="flex items-center justify-between text-xs text-muted-foreground">
                            <span>Page {annotation.page}</span>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => goToPage(annotation.page)}
                            >
                              Go to page
                            </Button>
                          </div>
                        </div>
                      ))
                  )}
                </div>
              )}

              {sidebarTab === 'notes' && (
                <div className="space-y-3">
                  {annotations.filter(a => a.type === 'note').length === 0 ? (
                    <div className="text-center text-muted-foreground py-8">
                      <MessageSquare className="w-8 h-8 mx-auto mb-4 opacity-50" />
                      <p>No notes yet</p>
                      <p className="text-sm">Add notes to your reading</p>
                    </div>
                  ) : (
                    annotations
                      .filter(a => a.type === 'note')
                      .map(annotation => (
                        <div key={annotation.id} className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border-l-4 border-blue-400">
                          <p className="text-sm mb-2">{annotation.text}</p>
                          <div className="flex items-center justify-between text-xs text-muted-foreground">
                            <span>Page {annotation.page}</span>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => goToPage(annotation.page)}
                            >
                              Go to page
                            </Button>
                          </div>
                        </div>
                      ))
                  )}
                </div>
              )}

              {sidebarTab === 'tts' && (
                <TTSControls
                  isSupported={tts.isSupported}
                  isSpeaking={tts.isSpeaking}
                  isPaused={tts.isPaused}
                  progress={tts.progress}
                  voices={tts.voices}
                  currentVoice={tts.options.voice || null}
                  rate={tts.options.rate || 1}
                  pitch={tts.options.pitch || 1}
                  volume={tts.options.volume || 1}
                  onSpeak={handleTTSSpeak}
                  onPause={tts.pause}
                  onResume={tts.resume}
                  onStop={tts.stop}
                  onVoiceChange={tts.setVoice}
                  onRateChange={tts.setRate}
                  onPitchChange={tts.setPitch}
                  onVolumeChange={tts.setVolume}
                  selectedText={selectedText}
                />
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Note Dialog */}
      <Dialog open={noteDialogOpen} onOpenChange={setNoteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Note</DialogTitle>
            <DialogDescription>
              Add a personal note to your selected text.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {selectedText && (
              <div className="p-3 bg-muted rounded-lg">
                <p className="text-sm font-medium mb-2">Selected text:</p>
                <p className="text-sm text-muted-foreground">"{selectedText}"</p>
              </div>
            )}

            <div>
              <label className="text-sm font-medium mb-2 block">Your note:</label>
              <Input
                value={noteText}
                onChange={(e) => setNoteText(e.target.value)}
                placeholder="Enter your note..."
                autoFocus
              />
            </div>

            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                onClick={() => {
                  setNoteDialogOpen(false)
                  setNoteText('')
                }}
              >
                Cancel
              </Button>
              <Button
                onClick={async () => {
                  if (noteText.trim()) {
                    await addNote(noteText.trim())
                    setNoteDialogOpen(false)
                    setNoteText('')
                  }
                }}
                disabled={!noteText.trim()}
              >
                Add Note
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Milestone Celebration */}
      {celebratingMilestone && (
        <MilestoneCelebration
          milestone={celebratingMilestone}
          onComplete={handleMilestoneComplete}
        />
      )}
    </div>
  )
}
