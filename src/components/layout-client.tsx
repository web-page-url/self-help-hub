'use client'

import { ThemeToggle } from "@/components/theme-toggle"
import { CommandPalette, useCommandPalette } from "@/components/command-palette"
import { Button } from "@/components/ui/button"
import { Search, Quote } from "lucide-react"
import Link from "next/link"

interface LayoutClientProps {
  children: React.ReactNode
}

export function LayoutClient({ children }: LayoutClientProps) {
  const { open, setOpen } = useCommandPalette()

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Simple Navigation Header */}
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-14 items-center justify-between px-4">
          <div className="flex items-center space-x-4">
            <Link href="/" className="text-lg font-semibold hover:text-primary transition-colors">
              SelfHelpHub
            </Link>
            <nav className="hidden md:flex items-center space-x-4">
              <Link href="/library" className="text-sm hover:text-primary transition-colors">
                Library
              </Link>
              <Link href="/collections" className="text-sm hover:text-primary transition-colors">
                Collections
              </Link>
              <Link href="/highlights" className="text-sm hover:text-primary transition-colors">
                Highlights
              </Link>
              <Link href="/settings" className="text-sm hover:text-primary transition-colors">
                Settings
              </Link>
            </nav>
          </div>
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setOpen(true)}
              className="gap-2"
            >
              <Search className="w-4 h-4" />
              <span className="hidden sm:inline">Search</span>
              <kbd className="hidden sm:inline-flex items-center gap-0.5 rounded border bg-muted px-1.5 py-0.5 text-xs font-mono text-muted-foreground">
                <span className="text-xs">⌘</span>K
              </kbd>
            </Button>
            <ThemeToggle />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1">
        {children}
      </main>

      {/* Command Palette */}
      <CommandPalette open={open} onOpenChange={setOpen} />
    </div>
  )
}
