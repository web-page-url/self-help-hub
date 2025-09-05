'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import {
  Settings as SettingsIcon,
  Palette,
  Database,
  Download,
  Upload,
  Trash2,
  HardDrive,
  BookOpen,
  Moon,
  Sun,
  Monitor,
  User,
  Shield,
  HelpCircle,
  Info,
  ChevronRight,
  AlertTriangle,
  CheckCircle,
  Loader2
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Switch } from '@/components/ui/switch'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { useTheme } from 'next-themes'
import { useBooks } from '@/hooks/use-books'
import { bookStorage, annotationStorage, settingsStorage } from '@/lib/storage'
import { LibraryManifest, ExportOptions } from '@/types'
import { formatDate } from '@/lib/utils'

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

export default function SettingsPage() {
  const { theme, setTheme } = useTheme()
  const { books } = useBooks()
  const [storageInfo, setStorageInfo] = useState<{
    used: number
    available: number
    percentage: number
  } | null>(null)
  const [isExporting, setIsExporting] = useState(false)
  const [isImporting, setIsImporting] = useState(false)
  const [lastBackup, setLastBackup] = useState<string | null>(null)

  useEffect(() => {
    // Load storage information
    const loadStorageInfo = async () => {
      if ('storage' in navigator && 'estimate' in navigator.storage) {
        try {
          const estimate = await navigator.storage.estimate()
          const used = estimate.usage || 0
          const available = estimate.quota || 0
          const percentage = available > 0 ? (used / available) * 100 : 0

          setStorageInfo({
            used: Math.round(used / (1024 * 1024)), // MB
            available: Math.round(available / (1024 * 1024)), // MB
            percentage: Math.round(percentage)
          })
        } catch (error) {
          console.error('Failed to get storage info:', error)
        }
      }
    }

    loadStorageInfo()

    // Load last backup date
    const backupDate = localStorage.getItem('selfhelphub_last_backup')
    if (backupDate) {
      setLastBackup(backupDate)
    }
  }, [])

  const handleExport = async (options: ExportOptions) => {
    setIsExporting(true)
    try {
      const [books, annotations, collections, settings] = await Promise.all([
        bookStorage.getAll(),
        annotationStorage.getAll(),
        [], // TODO: Implement collections storage
        settingsStorage.getSettings()
      ])

      const manifest: LibraryManifest = {
        version: '1.0.0',
        books: books.map(book => ({
          ...book,
          fileId: undefined // Don't export file IDs
        })),
        annotations,
        collections,
        settings,
        exportedAt: Date.now()
      }

      const blob = new Blob([JSON.stringify(manifest, null, 2)], {
        type: 'application/json'
      })

      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `selfhelphub-backup-${new Date().toISOString().split('T')[0]}.json`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)

      // Save backup date
      const backupDate = new Date().toISOString()
      localStorage.setItem('selfhelphub_last_backup', backupDate)
      setLastBackup(backupDate)

    } catch (error) {
      console.error('Export failed:', error)
      alert('Export failed. Please try again.')
    } finally {
      setIsExporting(false)
    }
  }

  const handleImport = async (file: File) => {
    setIsImporting(true)
    try {
      const text = await file.text()
      const manifest: LibraryManifest = JSON.parse(text)

      // Validate manifest
      if (!manifest.books || !Array.isArray(manifest.books)) {
        throw new Error('Invalid backup file format')
      }

      // Import data
      for (const book of manifest.books) {
        await bookStorage.save(book)
      }

      if (manifest.annotations) {
        for (const annotation of manifest.annotations) {
          await annotationStorage.save(annotation)
        }
      }

      if (manifest.settings) {
        await settingsStorage.saveSettings(manifest.settings)
      }

      alert('Data imported successfully! Please refresh the page.')

    } catch (error) {
      console.error('Import failed:', error)
      alert('Import failed. Please check the file format and try again.')
    } finally {
      setIsImporting(false)
    }
  }

  const handleDeleteAllData = async () => {
    try {
      await Promise.all([
        bookStorage.clear(),
        annotationStorage.clear(),
        settingsStorage.clear()
      ])

      // Clear localStorage
      localStorage.clear()

      alert('All data has been deleted. The page will now refresh.')
      window.location.reload()

    } catch (error) {
      console.error('Failed to delete data:', error)
      alert('Failed to delete data. Please try again.')
    }
  }

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 B'
    const k = 1024
    const sizes = ['B', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Settings</h1>
          <p className="text-muted-foreground">
            Manage your preferences, data, and account settings
          </p>
        </div>

        <motion.div
          variants={staggerContainer}
          initial="initial"
          animate="animate"
          className="space-y-6"
        >

          {/* Appearance */}
          <motion.div variants={fadeInUp}>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Palette className="w-5 h-5" />
                  Appearance
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <div className="text-sm font-medium">Theme</div>
                    <div className="text-xs text-muted-foreground">
                      Choose your preferred color scheme
                    </div>
                  </div>
                  <Select value={theme} onValueChange={setTheme}>
                    <SelectTrigger className="w-32">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="light">
                        <div className="flex items-center gap-2">
                          <Sun className="w-4 h-4" />
                          Light
                        </div>
                      </SelectItem>
                      <SelectItem value="dark">
                        <div className="flex items-center gap-2">
                          <Moon className="w-4 h-4" />
                          Dark
                        </div>
                      </SelectItem>
                      <SelectItem value="system">
                        <div className="flex items-center gap-2">
                          <Monitor className="w-4 h-4" />
                          System
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Reading Preferences */}
          <motion.div variants={fadeInUp}>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BookOpen className="w-5 h-5" />
                  Reading Preferences
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-sm text-muted-foreground">
                  Reading preferences are configured in the PDF reader.
                  <Link href="/read/example" className="text-primary hover:underline ml-1">
                    Open a book to customize
                  </Link>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Data Management */}
          <motion.div variants={fadeInUp}>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Database className="w-5 h-5" />
                  Data Management
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">

                {/* Storage Usage */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <div className="text-sm font-medium">Storage Usage</div>
                    {storageInfo && (
                      <div className="text-xs text-muted-foreground">
                        {storageInfo.used} MB used
                      </div>
                    )}
                  </div>
                  {storageInfo ? (
                    <div className="space-y-2">
                      <Progress value={storageInfo.percentage} className="h-2" />
                      <div className="flex justify-between text-xs text-muted-foreground">
                        <span>{storageInfo.percentage}% of available storage</span>
                        <span>{storageInfo.available} MB available</span>
                      </div>
                    </div>
                  ) : (
                    <div className="text-sm text-muted-foreground">
                      Storage information not available
                    </div>
                  )}
                </div>

                {/* Data Stats */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold">{books.length}</div>
                    <div className="text-xs text-muted-foreground">Books</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold">
                      {books.filter(b => b.progress === 1).length}
                    </div>
                    <div className="text-xs text-muted-foreground">Finished</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold">
                      {books.filter(b => b.progress && b.progress > 0 && b.progress < 1).length}
                    </div>
                    <div className="text-xs text-muted-foreground">In Progress</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold">
                      {books.filter(b => !b.progress || b.progress === 0).length}
                    </div>
                    <div className="text-xs text-muted-foreground">Unread</div>
                  </div>
                </div>

              </CardContent>
            </Card>
          </motion.div>

          {/* Backup & Export */}
          <motion.div variants={fadeInUp}>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Download className="w-5 h-5" />
                  Backup & Export
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">

                {/* Last Backup */}
                {lastBackup && (
                  <div className="flex items-center gap-2 p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                    <CheckCircle className="w-4 h-4 text-green-600" />
                    <div className="text-sm">
                      <div className="font-medium text-green-800 dark:text-green-200">
                        Last backup: {formatDate(parseInt(lastBackup))}
                      </div>
                      <div className="text-green-600 dark:text-green-400">
                        Your data is backed up and secure
                      </div>
                    </div>
                  </div>
                )}

                {/* Export Actions */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Button
                    onClick={() => handleExport({ includeFiles: false, includeAnnotations: true, includeCollections: true })}
                    disabled={isExporting}
                    className="gap-2"
                  >
                    {isExporting ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Download className="w-4 h-4" />
                    )}
                    Export Data
                  </Button>

                  <div>
                    <input
                      type="file"
                      accept=".json"
                      onChange={(e) => {
                        const file = e.target.files?.[0]
                        if (file) handleImport(file)
                      }}
                      className="hidden"
                      id="import-file"
                    />
                    <Button
                      variant="outline"
                      onClick={() => document.getElementById('import-file')?.click()}
                      disabled={isImporting}
                      className="w-full gap-2"
                    >
                      {isImporting ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Upload className="w-4 h-4" />
                      )}
                      Import Data
                    </Button>
                  </div>
                </div>

                <div className="text-xs text-muted-foreground">
                  Export includes your books, annotations, and settings (but not PDF files themselves).
                  Import will merge data with your existing library.
                </div>

              </CardContent>
            </Card>
          </motion.div>

          {/* Danger Zone */}
          <motion.div variants={fadeInUp}>
            <Card className="border-destructive/50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-destructive">
                  <AlertTriangle className="w-5 h-5" />
                  Danger Zone
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <h4 className="text-sm font-medium mb-1">Delete All Data</h4>
                    <p className="text-xs text-muted-foreground mb-3">
                      Permanently delete all your books, annotations, and settings.
                      This action cannot be undone.
                    </p>

                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="destructive" size="sm" className="gap-2">
                          <Trash2 className="w-4 h-4" />
                          Delete Everything
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                          <AlertDialogDescription>
                            This action cannot be undone. This will permanently delete all your books,
                            annotations, collections, and settings from your device.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={handleDeleteAllData}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                          >
                            Yes, delete everything
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* About & Support */}
          <motion.div variants={fadeInUp}>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Info className="w-5 h-5" />
                  About & Support
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Link href="/about">
                    <Button variant="outline" className="w-full justify-between">
                      <div className="flex items-center gap-2">
                        <Info className="w-4 h-4" />
                        About SelfHelpHub
                      </div>
                      <ChevronRight className="w-4 h-4" />
                    </Button>
                  </Link>

                  <Link href="/legal">
                    <Button variant="outline" className="w-full justify-between">
                      <div className="flex items-center gap-2">
                        <Shield className="w-4 h-4" />
                        Legal & Privacy
                      </div>
                      <ChevronRight className="w-4 h-4" />
                    </Button>
                  </Link>
                </div>

                <div className="pt-4 border-t">
                  <div className="text-xs text-muted-foreground space-y-1">
                    <div>SelfHelpHub v1.0.0</div>
                    <div>Built with Next.js, React, and TypeScript</div>
                    <div>All data stored locally on your device</div>
                  </div>
                </div>

              </CardContent>
            </Card>
          </motion.div>

        </motion.div>
      </div>
    </div>
  )
}
