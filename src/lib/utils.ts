import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Format file size in human readable format
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes'
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

// Generate UUID for local IDs
export function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substr(2)
}

// Debounce function for search
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

// Truncate text with ellipsis
export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text
  return text.slice(0, maxLength) + '...'
}

// Extract text from PDF page for search indexing
export async function extractTextFromPDF(file: File): Promise<string> {
  // This will be implemented when we set up PDF.js
  return ""
}

// Calculate reading progress percentage
export function calculateProgress(currentPage: number, totalPages: number): number {
  if (totalPages === 0) return 0
  return Math.min((currentPage / totalPages) * 100, 100)
}

// Validate file type for PDF uploads
export function isValidPDFFile(file: File): boolean {
  return file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf')
}

// Format date for display
export function formatDate(timestamp: number): string {
  return new Date(timestamp).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  })
}

// Format reading time
export function formatReadingTime(minutes: number): string {
  if (minutes < 60) {
    return `${Math.round(minutes)} min`
  }
  const hours = Math.floor(minutes / 60)
  const remainingMinutes = Math.round(minutes % 60)
  return `${hours}h ${remainingMinutes}m`
}

// Sleep utility for animations
export function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms))
}

// Check if running in browser environment
export function isBrowser(): boolean {
  return typeof window !== 'undefined'
}

// Safe localStorage operations
export function safeLocalStorage() {
  if (!isBrowser()) return null

  try {
    const test = '__storage_test__'
    localStorage.setItem(test, test)
    localStorage.removeItem(test)
    return localStorage
  } catch {
    return null
  }
}

// Check storage quota
export async function checkStorageQuota(): Promise<{ used: number; available: number; percentage: number }> {
  if (!isBrowser() || !navigator.storage?.estimate) {
    return { used: 0, available: 0, percentage: 0 }
  }

  try {
    const estimate = await navigator.storage.estimate()
    const used = estimate.usage || 0
    const quota = estimate.quota || 1
    const percentage = (used / quota) * 100

    return {
      used,
      available: quota - used,
      percentage
    }
  } catch {
    return { used: 0, available: 0, percentage: 0 }
  }
}
