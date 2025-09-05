'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'
import {
  Shield,
  AlertTriangle,
  FileText,
  Mail,
  ArrowLeft,
  Scale,
  Users,
  Lock,
  Eye
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

export default function LegalPage() {
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
              <Shield className="w-8 h-8 text-primary" />
              <h1 className="text-3xl font-bold">Legal & Compliance</h1>
            </div>
            <p className="text-muted-foreground text-lg">
              Our commitment to copyright compliance and user privacy
            </p>
          </div>
        </div>

        <motion.div
          variants={staggerContainer}
          initial="initial"
          animate="animate"
          className="space-y-8"
        >

          {/* Copyright Compliance */}
          <motion.div variants={fadeInUp}>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Scale className="w-5 h-5" />
                  Copyright Compliance Policy
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg border border-blue-200 dark:border-blue-800">
                  <div className="flex items-start gap-3">
                    <AlertTriangle className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
                    <div>
                      <h4 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">
                        Important Notice
                      </h4>
                      <p className="text-blue-800 dark:text-blue-200 text-sm">
                        SelfHelpHub respects copyright laws and encourages users to only upload content they own or have explicit permission to use.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <h4 className="font-semibold mb-2">Our Policy</h4>
                    <ul className="space-y-2 text-sm text-muted-foreground ml-4">
                      <li>• We do not host or distribute copyrighted materials without permission</li>
                      <li>• Users are responsible for ensuring they have rights to upload content</li>
                      <li>• All uploaded content remains private to the user</li>
                      <li>• We reserve the right to remove content upon valid copyright claims</li>
                    </ul>
                  </div>

                  <div>
                    <h4 className="font-semibold mb-2">User Responsibilities</h4>
                    <ul className="space-y-2 text-sm text-muted-foreground ml-4">
                      <li>• Only upload PDFs you own or have permission to use</li>
                      <li>• Respect intellectual property rights of others</li>
                      <li>• Report any copyright infringement you discover</li>
                      <li>• Contact us immediately if you believe your copyright has been infringed</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* DMCA Policy */}
          <motion.div variants={fadeInUp}>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="w-5 h-5" />
                  DMCA Notice & Takedown Policy
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  SelfHelpHub complies with the Digital Millennium Copyright Act (DMCA) and responds to valid copyright infringement claims.
                </p>

                <div className="bg-amber-50 dark:bg-amber-900/20 p-4 rounded-lg border border-amber-200 dark:border-amber-800">
                  <h4 className="font-semibold text-amber-900 dark:text-amber-100 mb-2">
                    How to Submit a DMCA Notice
                  </h4>
                  <p className="text-amber-800 dark:text-amber-200 text-sm mb-3">
                    If you believe your copyrighted work has been infringed, please send us a DMCA notice with the following information:
                  </p>
                  <ul className="space-y-1 text-sm text-amber-800 dark:text-amber-200 ml-4">
                    <li>• Your contact information</li>
                    <li>• Identification of the copyrighted work</li>
                    <li>• Location of the allegedly infringing material</li>
                    <li>• A statement of good faith belief</li>
                    <li>• A statement of accuracy and authority</li>
                    <li>• Your physical or electronic signature</li>
                  </ul>
                </div>

                <div className="flex items-center gap-2">
                  <Mail className="w-4 h-4" />
                  <span className="text-sm">DMCA Notices: </span>
                  <a
                    href="mailto:dmca@selfhelphub.com"
                    className="text-primary hover:underline text-sm"
                  >
                    dmca@selfhelphub.com
                  </a>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Privacy Policy */}
          <motion.div variants={fadeInUp}>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Lock className="w-5 h-5" />
                  Privacy Policy
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-semibold mb-3 flex items-center gap-2">
                      <Eye className="w-4 h-4" />
                      Data Collection
                    </h4>
                    <ul className="space-y-2 text-sm text-muted-foreground">
                      <li>• No personal information collected</li>
                      <li>• No tracking or analytics</li>
                      <li>• No data shared with third parties</li>
                      <li>• All data stored locally on device</li>
                    </ul>
                  </div>

                  <div>
                    <h4 className="font-semibold mb-3 flex items-center gap-2">
                      <Users className="w-4 h-4" />
                      Data Storage
                    </h4>
                    <ul className="space-y-2 text-sm text-muted-foreground">
                      <li>• PDFs stored in browser IndexedDB</li>
                      <li>• Annotations and notes local only</li>
                      <li>• Settings saved locally</li>
                      <li>• No cloud storage or backups</li>
                    </ul>
                  </div>
                </div>

                <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg border border-green-200 dark:border-green-800">
                  <div className="flex items-start gap-3">
                    <Lock className="w-5 h-5 text-green-600 dark:text-green-400 mt-0.5 flex-shrink-0" />
                    <div>
                      <h4 className="font-semibold text-green-900 dark:text-green-100 mb-1">
                        Privacy First
                      </h4>
                      <p className="text-green-800 dark:text-green-200 text-sm">
                        Your reading data never leaves your device. We don't collect, store, or share any personal information.
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Terms of Service */}
          <motion.div variants={fadeInUp}>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="w-5 h-5" />
                  Terms of Service
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-4">
                  <div>
                    <h4 className="font-semibold mb-2">1. Acceptance of Terms</h4>
                    <p className="text-sm text-muted-foreground">
                      By using SelfHelpHub, you agree to these terms and our copyright compliance policy.
                    </p>
                  </div>

                  <div>
                    <h4 className="font-semibold mb-2">2. User Content</h4>
                    <p className="text-sm text-muted-foreground">
                      You retain ownership of all content you upload. You are responsible for ensuring you have the right to use and share this content.
                    </p>
                  </div>

                  <div>
                    <h4 className="font-semibold mb-2">3. Service Availability</h4>
                    <p className="text-sm text-muted-foreground">
                      SelfHelpHub is provided "as is" and may be modified or discontinued at any time. Your data remains accessible through standard browser tools.
                    </p>
                  </div>

                  <div>
                    <h4 className="font-semibold mb-2">4. Limitation of Liability</h4>
                    <p className="text-sm text-muted-foreground">
                      SelfHelpHub is not liable for any damages arising from your use of the service or infringement of third-party rights.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Contact Information */}
          <motion.div variants={fadeInUp}>
            <Card>
              <CardHeader>
                <CardTitle>Contact Us</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-semibold mb-2">General Inquiries</h4>
                    <a
                      href="mailto:hello@selfhelphub.com"
                      className="text-primary hover:underline flex items-center gap-2"
                    >
                      <Mail className="w-4 h-4" />
                      hello@selfhelphub.com
                    </a>
                  </div>

                  <div>
                    <h4 className="font-semibold mb-2">Copyright Concerns</h4>
                    <a
                      href="mailto:copyright@selfhelphub.com"
                      className="text-primary hover:underline flex items-center gap-2"
                    >
                      <Mail className="w-4 h-4" />
                      copyright@selfhelphub.com
                    </a>
                  </div>
                </div>

                <div className="mt-6 p-4 bg-muted rounded-lg">
                  <p className="text-sm text-muted-foreground">
                    <strong>Response Time:</strong> We aim to respond to copyright concerns within 24-48 hours.
                    General inquiries are typically answered within 1-2 business days.
                  </p>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Footer */}
          <motion.div variants={fadeInUp}>
            <div className="text-center py-8 border-t">
              <div className="flex items-center justify-center gap-2 mb-4">
                <Badge variant="outline">Last Updated: September 2024</Badge>
              </div>
              <p className="text-sm text-muted-foreground">
                This legal information is for general guidance only and does not constitute legal advice.
                Please consult with a qualified attorney for specific legal concerns.
              </p>
            </div>
          </motion.div>

        </motion.div>
      </div>
    </div>
  )
}
