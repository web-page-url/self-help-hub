'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'
import {
  Heart,
  BookOpen,
  Shield,
  Github,
  Code,
  Users,
  Target,
  ArrowLeft,
  Star,
  Zap,
  Lock,
  Eye,
  Globe
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

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

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Header */}
        <div className="mb-8">
          <Button
            variant="ghost"
            asChild
            className="mb-4"
          >
            <Link href="/">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to SelfHelpHub
            </Link>
          </Button>

          <div className="text-center">
            <div className="flex items-center justify-center gap-3 mb-4">
              <Heart className="w-8 h-8 text-primary" />
              <h1 className="text-3xl font-bold">About SelfHelpHub</h1>
            </div>
            <p className="text-muted-foreground text-lg">
              A modern, privacy-first PDF reader for personal development and growth
            </p>
          </div>
        </div>

        <motion.div
          variants={staggerContainer}
          initial="initial"
          animate="animate"
          className="space-y-8"
        >

          {/* Mission */}
          <motion.div variants={fadeInUp}>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="w-5 h-5" />
                  Our Mission
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <p className="text-muted-foreground">
                    SelfHelpHub was created to empower individuals on their personal development journey by providing
                    a beautiful, distraction-free reading experience that respects privacy and copyright laws.
                  </p>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
                    <div className="text-center p-4 bg-muted/50 rounded-lg">
                      <Lock className="w-8 h-8 text-primary mx-auto mb-2" />
                      <h4 className="font-semibold mb-1">Privacy First</h4>
                      <p className="text-sm text-muted-foreground">
                        Your data never leaves your device
                      </p>
                    </div>

                    <div className="text-center p-4 bg-muted/50 rounded-lg">
                      <Shield className="w-8 h-8 text-primary mx-auto mb-2" />
                      <h4 className="font-semibold mb-1">Copyright Compliant</h4>
                      <p className="text-sm text-muted-foreground">
                        Respect intellectual property rights
                      </p>
                    </div>

                    <div className="text-center p-4 bg-muted/50 rounded-lg">
                      <BookOpen className="w-8 h-8 text-primary mx-auto mb-2" />
                      <h4 className="font-semibold mb-1">Reader Focused</h4>
                      <p className="text-sm text-muted-foreground">
                        Designed for optimal reading experience
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Features */}
          <motion.div variants={fadeInUp}>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Zap className="w-5 h-5" />
                  Key Features
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div className="flex items-start gap-3">
                      <BookOpen className="w-5 h-5 text-primary mt-0.5" />
                      <div>
                        <h4 className="font-semibold">PDF Reading</h4>
                        <p className="text-sm text-muted-foreground">
                          Clean, distraction-free PDF reader with zoom and navigation controls
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <Star className="w-5 h-5 text-primary mt-0.5" />
                      <div>
                        <h4 className="font-semibold">Annotations</h4>
                        <p className="text-sm text-muted-foreground">
                          Highlight, bookmark, and take notes on important passages
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <Eye className="w-5 h-5 text-primary mt-0.5" />
                      <div>
                        <h4 className="font-semibold">Progress Tracking</h4>
                        <p className="text-sm text-muted-foreground">
                          Track reading progress and maintain reading streaks
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-start gap-3">
                      <Shield className="w-5 h-5 text-primary mt-0.5" />
                      <div>
                        <h4 className="font-semibold">Privacy Focused</h4>
                        <p className="text-sm text-muted-foreground">
                          All data stored locally, no tracking or cloud storage
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <Code className="w-5 h-5 text-primary mt-0.5" />
                      <div>
                        <h4 className="font-semibold">Modern Tech</h4>
                        <p className="text-sm text-muted-foreground">
                          Built with Next.js, React, and cutting-edge web technologies
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <Globe className="w-5 h-5 text-primary mt-0.5" />
                      <div>
                        <h4 className="font-semibold">Offline First</h4>
                        <p className="text-sm text-muted-foreground">
                          Works without internet connection once PDFs are loaded
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Technology Stack */}
          <motion.div variants={fadeInUp}>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Code className="w-5 h-5" />
                  Technology Stack
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center p-4 bg-muted/50 rounded-lg">
                    <div className="font-semibold text-primary mb-1">Frontend</div>
                    <div className="text-sm text-muted-foreground">Next.js 15</div>
                    <div className="text-sm text-muted-foreground">React 19</div>
                    <div className="text-sm text-muted-foreground">TypeScript</div>
                  </div>

                  <div className="text-center p-4 bg-muted/50 rounded-lg">
                    <div className="font-semibold text-primary mb-1">Styling</div>
                    <div className="text-sm text-muted-foreground">Tailwind CSS</div>
                    <div className="text-sm text-muted-foreground">Framer Motion</div>
                    <div className="text-sm text-muted-foreground">shadcn/ui</div>
                  </div>

                  <div className="text-center p-4 bg-muted/50 rounded-lg">
                    <div className="font-semibold text-primary mb-1">PDF Engine</div>
                    <div className="text-sm text-muted-foreground">PDF.js</div>
                    <div className="text-sm text-muted-foreground">Canvas API</div>
                    <div className="text-sm text-muted-foreground">Web APIs</div>
                  </div>

                  <div className="text-center p-4 bg-muted/50 rounded-lg">
                    <div className="font-semibold text-primary mb-1">Storage</div>
                    <div className="text-sm text-muted-foreground">IndexedDB</div>
                    <div className="text-sm text-muted-foreground">LocalStorage</div>
                    <div className="text-sm text-muted-foreground">LocalForage</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Privacy & Data */}
          <motion.div variants={fadeInUp}>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Lock className="w-5 h-5" />
                  Privacy & Data
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg border border-green-200 dark:border-green-800">
                  <div className="flex items-start gap-3">
                    <Shield className="w-5 h-5 text-green-600 dark:text-green-400 mt-0.5 flex-shrink-0" />
                    <div>
                      <h4 className="font-semibold text-green-900 dark:text-green-100 mb-1">
                        Your Data is Yours
                      </h4>
                      <p className="text-green-800 dark:text-green-200 text-sm">
                        SelfHelpHub doesn&apos;t collect, store, or share any personal information.
                        All your reading data stays on your device.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-semibold mb-3">What We Don&apos;t Do</h4>
                    <ul className="space-y-2 text-sm text-muted-foreground">
                      <li>• No user accounts or sign-ups</li>
                      <li>• No tracking or analytics</li>
                      <li>• No cloud storage or backups</li>
                      <li>• No data collection or sharing</li>
                      <li>• No advertising or monetization</li>
                    </ul>
                  </div>

                  <div>
                    <h4 className="font-semibold mb-3">What We Do</h4>
                    <ul className="space-y-2 text-sm text-muted-foreground">
                      <li>• Store PDFs in your browser</li>
                      <li>• Save annotations locally</li>
                      <li>• Track reading progress</li>
                      <li>• Maintain reading streaks</li>
                      <li>• Export your data anytime</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Project Status */}
          <motion.div variants={fadeInUp}>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="w-5 h-5" />
                  Project Status
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-semibold">Development Stage</h4>
                      <p className="text-sm text-muted-foreground">
                        SelfHelpHub is an open-source project focused on personal development
                      </p>
                    </div>
                    <Badge variant="secondary">Beta</Badge>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
                    <div className="text-center p-4 bg-muted/50 rounded-lg">
                      <div className="text-2xl font-bold text-primary mb-1">100%</div>
                      <div className="text-sm text-muted-foreground">Open Source</div>
                    </div>

                    <div className="text-center p-4 bg-muted/50 rounded-lg">
                      <div className="text-2xl font-bold text-primary mb-1">0</div>
                      <div className="text-sm text-muted-foreground">Third-party APIs</div>
                    </div>

                    <div className="text-center p-4 bg-muted/50 rounded-lg">
                      <div className="text-2xl font-bold text-primary mb-1">∞</div>
                      <div className="text-sm text-muted-foreground">Privacy First</div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Get Involved */}
          <motion.div variants={fadeInUp}>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Github className="w-5 h-5" />
                  Get Involved
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center space-y-4">
                  <p className="text-muted-foreground">
                    SelfHelpHub is an open-source project. Contributions, feedback, and feature requests are welcome!
                  </p>

                  <div className="flex flex-col sm:flex-row gap-3 justify-center">
                    <Button asChild variant="outline">
                      <a
                        href="https://github.com/selfhelphub"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="gap-2"
                      >
                        <Github className="w-4 h-4" />
                        View on GitHub
                      </a>
                    </Button>

                    <Button asChild variant="outline">
                      <Link href="/legal" className="gap-2">
                        <Shield className="w-4 h-4" />
                        Legal & Privacy
                      </Link>
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Footer */}
          <motion.div variants={fadeInUp}>
            <div className="text-center py-8 border-t">
              <div className="flex items-center justify-center gap-2 mb-4">
                <Badge variant="outline">Version 1.0.0</Badge>
                <Badge variant="secondary">Open Source</Badge>
              </div>
              <p className="text-sm text-muted-foreground">
                Built with ❤️ for readers who value privacy and personal growth
              </p>
            </div>
          </motion.div>

        </motion.div>
      </div>
    </div>
  )
}
