'use client'

import { useState, useRef } from 'react'
import { motion } from 'framer-motion'
import {
  Share2,
  Download,
  Copy,
  Palette,
  Type,
  Image as ImageIcon,
  X
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Annotation, Book } from '@/types'
import { useBooks } from '@/hooks/use-books'

interface QuoteCardProps {
  annotation: Annotation
  book: Book | null
  onClose?: () => void
}

export function QuoteCard({ annotation, book, onClose }: QuoteCardProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [selectedTheme, setSelectedTheme] = useState('classic')
  const [selectedFont, setSelectedFont] = useState('serif')
  const [showPreview, setShowPreview] = useState(true)

  const themes = {
    classic: {
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      textColor: '#ffffff',
      accentColor: '#fbbf24'
    },
    minimal: {
      background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
      textColor: '#2d3748',
      accentColor: '#4a5568'
    },
    dark: {
      background: 'linear-gradient(135deg, #2d3748 0%, #1a202c 100%)',
      textColor: '#ffffff',
      accentColor: '#fbbf24'
    },
    nature: {
      background: 'linear-gradient(135deg, #84fab0 0%, #8fd3f4 100%)',
      textColor: '#2d3748',
      accentColor: '#38a169'
    },
    sunset: {
      background: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
      textColor: '#ffffff',
      accentColor: '#fbbf24'
    }
  }

  const fonts = {
    serif: '"Times New Roman", serif',
    sans: '"Inter", sans-serif',
    mono: '"JetBrains Mono", monospace'
  }

  const generateQuoteCard = async () => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const theme = themes[selectedTheme as keyof typeof themes]
    const width = 800
    const height = 600

    canvas.width = width
    canvas.height = height

    // Background gradient
    const gradient = ctx.createLinearGradient(0, 0, width, height)
    if (selectedTheme === 'classic') {
      gradient.addColorStop(0, '#667eea')
      gradient.addColorStop(1, '#764ba2')
    } else if (selectedTheme === 'minimal') {
      gradient.addColorStop(0, '#f5f7fa')
      gradient.addColorStop(1, '#c3cfe2')
    } else if (selectedTheme === 'dark') {
      gradient.addColorStop(0, '#2d3748')
      gradient.addColorStop(1, '#1a202c')
    } else if (selectedTheme === 'nature') {
      gradient.addColorStop(0, '#84fab0')
      gradient.addColorStop(1, '#8fd3f4')
    } else if (selectedTheme === 'sunset') {
      gradient.addColorStop(0, '#fa709a')
      gradient.addColorStop(1, '#fee140')
    }

    ctx.fillStyle = gradient
    ctx.fillRect(0, 0, width, height)

    // Set font and text properties
    ctx.fillStyle = theme.textColor
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'

    // Quote marks
    ctx.font = `bold 120px ${fonts[selectedFont as keyof typeof fonts]}`
    ctx.fillText('"', width / 2 - 200, height / 2 - 80)
    ctx.fillText('"', width / 2 + 200, height / 2 - 80)

    // Main quote text
    const maxWidth = 600
    const lineHeight = 40
    let y = height / 2 - 40

    if (annotation.text) {
      ctx.font = `italic 28px ${fonts[selectedFont as keyof typeof fonts]}`
      const words = annotation.text.split(' ')
      let line = ''
      const lines: string[] = []

      for (const word of words) {
        const testLine = line + word + ' '
        const metrics = ctx.measureText(testLine)
        if (metrics.width > maxWidth && line !== '') {
          lines.push(line.trim())
          line = word + ' '
        } else {
          line = testLine
        }
      }
      lines.push(line.trim())

      lines.forEach((line, index) => {
        ctx.fillText(line, width / 2, y + (index * lineHeight))
      })

      y += lines.length * lineHeight + 40
    }

    // Book and author info
    ctx.font = `bold 24px ${fonts[selectedFont as keyof typeof fonts]}`
    if (book?.title) {
      ctx.fillText(book.title, width / 2, y)
      y += 35
    }

    if (book?.author) {
      ctx.font = `18px ${fonts[selectedFont as keyof typeof fonts]}`
      ctx.fillStyle = theme.accentColor
      ctx.fillText(`— ${book.author}`, width / 2, y)
    }

    // Attribution
    ctx.font = `12px ${fonts[selectedFont as keyof typeof fonts]}`
    ctx.fillStyle = theme.textColor + '80'
    ctx.fillText('Created with SelfHelpHub', width / 2, height - 30)
  }

  const downloadQuoteCard = () => {
    const canvas = canvasRef.current
    if (!canvas) return

    const link = document.createElement('a')
    link.download = `quote-${annotation.id}.png`
    link.href = canvas.toDataURL()
    link.click()
  }

  const copyQuoteText = async () => {
    if (annotation.text) {
      try {
        await navigator.clipboard.writeText(`"${annotation.text}"${book ? ` — ${book.author}` : ''}`)
      } catch (error) {
        console.error('Failed to copy quote:', error)
      }
    }
  }

  const shareQuote = async () => {
    if (navigator.share && annotation.text) {
      try {
        await navigator.share({
          title: 'Quote from my reading',
          text: `"${annotation.text}"${book ? ` — ${book.author}` : ''}`,
          url: window.location.href
        })
      } catch (error) {
        // User cancelled sharing or sharing not supported
      }
    }
  }

  return (
    <div className="space-y-6">
      {/* Controls */}
      <div className="flex flex-wrap gap-4">
        <div className="flex items-center gap-2">
          <Palette className="w-4 h-4" />
          <Select value={selectedTheme} onValueChange={setSelectedTheme}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="classic">Classic</SelectItem>
              <SelectItem value="minimal">Minimal</SelectItem>
              <SelectItem value="dark">Dark</SelectItem>
              <SelectItem value="nature">Nature</SelectItem>
              <SelectItem value="sunset">Sunset</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center gap-2">
          <Type className="w-4 h-4" />
          <Select value={selectedFont} onValueChange={setSelectedFont}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="serif">Serif</SelectItem>
              <SelectItem value="sans">Sans</SelectItem>
              <SelectItem value="mono">Mono</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <Button onClick={generateQuoteCard} variant="outline">
          <ImageIcon className="w-4 h-4 mr-2" />
          Generate
        </Button>
      </div>

      {/* Preview */}
      <div className="flex justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="p-6">
            <canvas
              ref={canvasRef}
              className="w-full aspect-[4/3] border rounded"
              style={{ display: showPreview ? 'block' : 'none' }}
            />
            {!showPreview && (
              <div className="w-full aspect-[4/3] border rounded bg-muted flex items-center justify-center">
                <p className="text-muted-foreground">Click Generate to preview</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Actions */}
      <div className="flex flex-wrap gap-2 justify-center">
        <Button onClick={downloadQuoteCard} disabled={!showPreview}>
          <Download className="w-4 h-4 mr-2" />
          Download PNG
        </Button>

        <Button onClick={copyQuoteText} variant="outline">
          <Copy className="w-4 h-4 mr-2" />
          Copy Text
        </Button>

        {navigator.share && (
          <Button onClick={shareQuote} variant="outline">
            <Share2 className="w-4 h-4 mr-2" />
            Share
          </Button>
        )}
      </div>

      {/* Quote Info */}
      <div className="text-center space-y-2">
        <p className="text-sm text-muted-foreground">
          From: <span className="font-medium">{book?.title || 'Unknown Book'}</span>
        </p>
        {book?.author && (
          <p className="text-sm text-muted-foreground">
            by {book.author}
          </p>
        )}
        <Badge variant="outline" className="capitalize">
          {annotation.type}
        </Badge>
      </div>
    </div>
  )
}

// Dialog wrapper component
interface ShareableQuoteDialogProps {
  annotation: Annotation
  book: Book | null
  children: React.ReactNode
}

export function ShareableQuoteDialog({ annotation, book, children }: ShareableQuoteDialogProps) {
  return (
    <Dialog>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Share2 className="w-5 h-5" />
            Share Quote
          </DialogTitle>
        </DialogHeader>
        <QuoteCard annotation={annotation} book={book} />
      </DialogContent>
    </Dialog>
  )
}
