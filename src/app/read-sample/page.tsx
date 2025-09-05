'use client'

import { useState, useEffect, useRef } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { BookOpen, ChevronLeft, ChevronRight, ZoomIn, ZoomOut } from 'lucide-react'
import { Button } from '@/components/ui/button'

export default function SampleReaderPage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const pdfRef = useRef<any>(null)

  const pdfUrl = searchParams.get('url')
  const title = searchParams.get('title') || 'Sample Book'
  const category = searchParams.get('category') || 'General'

  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(0)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string>('')
  const [scale, setScale] = useState(1.0)

  useEffect(() => {
    if (!pdfUrl) {
      setError('No PDF URL provided')
      setIsLoading(false)
      return
    }

    loadSamplePDF()
  }, [pdfUrl])

  const loadSamplePDF = async () => {
    try {
      setIsLoading(true)
      setError('')

      // Import PDF.js
      const pdfjsLib = await import('pdfjs-dist')

      // Set worker source using local file (most reliable)
      pdfjsLib.GlobalWorkerOptions.workerSrc = '/pdf.worker.min.js'

      // Fetch the PDF from the public folder
      const response = await fetch(pdfUrl!)
      if (!response.ok) {
        throw new Error(`Failed to load PDF file: ${response.status} ${response.statusText}`)
      }

      const arrayBuffer = await response.arrayBuffer()
      const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise

      pdfRef.current = pdf
      setTotalPages(pdf.numPages)

      // Render first page
      await renderPage(1)
      setIsLoading(false)

    } catch (err) {
      console.error('Failed to load sample PDF:', err)
      const errorMessage = err instanceof Error ? err.message : 'Failed to load PDF'
      setError(errorMessage)
      setIsLoading(false)
    }
  }

  const renderPage = async (pageNum: number) => {
    if (!pdfRef.current || !canvasRef.current) return

    try {
      const page = await pdfRef.current.getPage(pageNum)
      const viewport = page.getViewport({ scale })

      const canvas = canvasRef.current
      const context = canvas.getContext('2d')!

      canvas.height = viewport.height
      canvas.width = viewport.width

      const renderContext = {
        canvasContext: context,
        viewport: viewport
      }

      await page.render(renderContext).promise
    } catch (err) {
      console.error('Failed to render page:', err)
      setError('Failed to render PDF page')
    }
  }

  const nextPage = () => {
    if (currentPage < totalPages) {
      const newPage = currentPage + 1
      setCurrentPage(newPage)
      renderPage(newPage)
    }
  }

  const prevPage = () => {
    if (currentPage > 1) {
      const newPage = currentPage - 1
      setCurrentPage(newPage)
      renderPage(newPage)
    }
  }

  const zoomIn = () => {
    const newScale = Math.min(scale + 0.25, 3.0)
    setScale(newScale)
    renderPage(currentPage)
  }

  const zoomOut = () => {
    const newScale = Math.max(scale - 0.25, 0.5)
    setScale(newScale)
    renderPage(currentPage)
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <BookOpen className="w-8 h-8 text-red-600 dark:text-red-400" />
          </div>
          <h2 className="text-xl font-semibold mb-2 text-red-600 dark:text-red-400">
            Failed to Load PDF
          </h2>
          <p className="text-muted-foreground mb-4">{error}</p>
          <div className="space-x-2">
            <Button onClick={() => window.location.reload()}>
              Try Again
            </Button>
            <Button variant="outline" onClick={() => router.push('/')}>
              Back to Home
            </Button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-card border-b p-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" onClick={() => router.push('/')}>
            <ChevronLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
          <div>
            <h1 className="text-lg font-semibold">{title}</h1>
            <p className="text-sm text-muted-foreground">{category}</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={zoomOut}>
            <ZoomOut className="w-4 h-4" />
          </Button>
          <span className="text-sm text-muted-foreground">{Math.round(scale * 100)}%</span>
          <Button variant="outline" size="sm" onClick={zoomIn}>
            <ZoomIn className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* PDF Viewer */}
      <div className="flex-1 flex flex-col items-center justify-center p-4">
        {isLoading ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center"
          >
            <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading PDF...</p>
          </motion.div>
        ) : (
          <>
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-4 mb-4 max-w-4xl">
              <canvas
                ref={canvasRef}
                className="max-w-full h-auto border rounded"
              />
            </div>

            {/* Controls */}
            <div className="flex items-center gap-4">
              <Button
                variant="outline"
                onClick={prevPage}
                disabled={currentPage <= 1}
              >
                <ChevronLeft className="w-4 h-4 mr-2" />
                Previous
              </Button>

              <span className="text-sm text-muted-foreground">
                Page {currentPage} of {totalPages}
              </span>

              <Button
                variant="outline"
                onClick={nextPage}
                disabled={currentPage >= totalPages}
              >
                Next
                <ChevronRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
