'use client'

import { motion } from 'framer-motion'
import { BookOpen, FileText, Bookmark, Search, Shield, Zap, Star, ChevronDown, Filter } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import Link from 'next/link'

const fadeInUp = {
  initial: { opacity: 0, y: 60 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.6 }
}

const staggerContainer = {
  animate: {
    transition: {
      staggerChildren: 0.1
    }
  }
}

function SampleBookCard({ title, description, pdfUrl, coverColor, category }: {
  title: string
  description: string
  pdfUrl: string
  coverColor: string
  category: string
}) {
  const handleReadNow = () => {
    const url = `/read-sample?url=${encodeURIComponent(pdfUrl)}&title=${encodeURIComponent(title)}&category=${encodeURIComponent(category)}`
    window.location.href = url
  }

  return (
    <motion.div
      variants={fadeInUp}
      whileHover={{ y: -8, scale: 1.02 }}
      className="bg-card rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 border overflow-hidden group"
    >
      <div className="p-6">
        <div className="flex items-start gap-4 mb-4">
          <div className={`w-16 h-20 rounded-lg bg-gradient-to-br ${coverColor} flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform duration-300`}>
            <BookOpen className="w-8 h-8 text-white" />
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <h3 className="text-xl font-semibold group-hover:text-primary transition-colors">{title}</h3>
              <span className="px-2 py-1 bg-primary/10 text-primary text-xs rounded-full font-medium">
                {category}
              </span>
            </div>
            <p className="text-muted-foreground text-sm leading-relaxed">
              {description}
            </p>
          </div>
        </div>

        <div className="flex gap-3">
          <Button
            className="flex-1 group-hover:shadow-lg transition-shadow"
            onClick={handleReadNow}
          >
            <BookOpen className="w-4 h-4 mr-2" />
            Read Now
          </Button>
          <Button variant="outline" asChild>
            <a href={pdfUrl} target="_blank" rel="noopener noreferrer">
              <FileText className="w-4 h-4 mr-2" />
              Download
            </a>
          </Button>
        </div>
      </div>
    </motion.div>
  )
}

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 via-purple-500/10 to-pink-500/10" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-16">
          <motion.div
            className="text-center"
            initial="initial"
            animate="animate"
            variants={staggerContainer}
          >
            <motion.div variants={fadeInUp} className="mb-8">
              <motion.div
                className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-full text-sm font-medium mb-6"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Star className="w-4 h-4" />
                Free Self-Help Library
              </motion.div>
              <motion.h1
                variants={fadeInUp}
                className="text-4xl md:text-6xl font-bold mb-6"
              >
                Transform Your Life with
                <span className="bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent block">
                  Self-Help Books
                </span>
              </motion.h1>
              <motion.p
                variants={fadeInUp}
                className="text-xl text-muted-foreground max-w-3xl mx-auto mb-8"
              >
                Discover curated self-help books that inspire growth, build habits, and unlock your potential. All content is free, private, and accessible anytime.
              </motion.p>
              <motion.div
                variants={fadeInUp}
                className="flex flex-col sm:flex-row gap-4 justify-center"
              >
                <Button asChild size="lg" className="px-8 py-3 text-lg">
                  <Link href="/explore">
                    <BookOpen className="w-5 h-5 mr-2" />
                    Explore Books
                  </Link>
                </Button>
                <Button variant="outline" size="lg" className="px-8 py-3 text-lg">
                  <Zap className="w-5 h-5 mr-2" />
                  Start Reading
                </Button>
              </motion.div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-muted/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            className="text-center mb-16"
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
            variants={staggerContainer}
          >
            <motion.h2
              variants={fadeInUp}
              className="text-3xl md:text-4xl font-bold mb-4"
            >
              Why Choose SelfHelpHub?
            </motion.h2>
            <motion.p
              variants={fadeInUp}
              className="text-xl text-muted-foreground max-w-2xl mx-auto"
            >
              A modern, privacy-first platform designed for your personal growth journey.
            </motion.p>
          </motion.div>

          <motion.div
            className="grid md:grid-cols-2 lg:grid-cols-4 gap-8"
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
            variants={staggerContainer}
          >
            {[
              {
                icon: BookOpen,
                title: "Curated Collection",
                description: "Hand-picked books that deliver real value and lasting change.",
                color: "from-blue-500 to-purple-500"
              },
              {
                icon: Shield,
                title: "100% Free & Private",
                description: "No subscriptions, no data collection. Your reading is yours alone.",
                color: "from-green-500 to-emerald-500"
              },
              {
                icon: Search,
                title: "Smart Search & Filter",
                description: "Find exactly what you need with powerful search and filtering.",
                color: "from-purple-500 to-pink-500"
              },
              {
                icon: Zap,
                title: "Offline Reading",
                description: "Download and read anywhere, even without internet connection.",
                color: "from-orange-500 to-red-500"
              }
            ].map((feature, index) => (
              <motion.div
                key={feature.title}
                variants={fadeInUp}
                whileHover={{ y: -8, scale: 1.02 }}
                className="bg-card rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 border"
              >
                <div className={`inline-flex p-3 rounded-xl bg-gradient-to-r ${feature.color} text-white mb-4`}>
                  <feature.icon className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                <p className="text-muted-foreground">{feature.description}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Featured Books Section */}
      <section className="py-20 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            className="text-center mb-16"
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
            variants={staggerContainer}
          >
            <motion.h2
              variants={fadeInUp}
              className="text-3xl md:text-4xl font-bold mb-4"
            >
              Featured Books
            </motion.h2>
            <motion.p
              variants={fadeInUp}
              className="text-xl text-muted-foreground max-w-2xl mx-auto mb-8"
            >
              Start your journey with these carefully selected books. Explore our complete collection for more.
            </motion.p>
          </motion.div>

          <motion.div
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto mb-12"
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
            variants={staggerContainer}
          >
            <SampleBookCard
              title="Atomic Habits"
              description="Small changes, remarkable results - build good habits and break bad ones"
              pdfUrl="/Atomic-Habit.pdf"
              coverColor="from-orange-500 to-red-500"
              category="Success & Achievement"
            />
            <SampleBookCard
              title="Eat That Frog"
              description="Overcome procrastination and get more done in less time"
              pdfUrl="/Eat-That-Frog.pdf"
              coverColor="from-green-500 to-emerald-500"
              category="Productivity & Motivation"
            />
            <SampleBookCard
              title="Secret"
              description="Discover the power of hidden knowledge and personal transformation"
              pdfUrl="/Secret.pdf"
              coverColor="from-purple-500 to-pink-500"
              category="Personal Development"
            />
          </motion.div>

          {/* Explore All Books CTA */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.3 }}
            className="text-center"
          >
            <div className="bg-gradient-to-r from-primary/10 via-primary/5 to-primary/10 rounded-3xl p-8 border border-primary/20">
              <h3 className="text-2xl font-bold mb-4">Explore Our Complete Collection</h3>
              <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                Discover 7+ amazing self-help books across 6 categories with powerful search and filtering.
              </p>
              <Button asChild size="lg" className="px-8 py-3 text-lg">
                <Link href="/explore">
                  <BookOpen className="w-5 h-5 mr-2" />
                  Explore All Books
                </Link>
              </Button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            className="text-center"
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
            variants={staggerContainer}
          >
            <motion.div variants={fadeInUp} className="mb-8">
              <motion.div
                className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-full text-sm font-medium mb-6"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Star className="w-4 h-4" />
                Join 1000+ Readers
              </motion.div>
              <motion.h2
                variants={fadeInUp}
                className="text-3xl md:text-4xl font-bold mb-4"
              >
                Start Your Journey Today
              </motion.h2>
              <motion.p
                variants={fadeInUp}
                className="text-xl text-muted-foreground max-w-2xl mx-auto"
              >
                Transform your life with our curated collection of self-help books. All content is free and accessible anytime.
              </motion.p>
            </motion.div>

            <motion.div
              variants={fadeInUp}
              className="grid md:grid-cols-2 lg:grid-cols-4 gap-8"
            >
              <motion.div
                variants={fadeInUp}
                whileHover={{ scale: 1.05 }}
                className="bg-card rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 border"
              >
                <div className="text-4xl font-bold text-primary mb-2">7+</div>
                <div className="text-sm text-muted-foreground">Books Available</div>
              </motion.div>
              <motion.div
                variants={fadeInUp}
                whileHover={{ scale: 1.05 }}
                className="bg-card rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 border"
              >
                <div className="text-4xl font-bold text-primary mb-2">6</div>
                <div className="text-sm text-muted-foreground">Categories</div>
              </motion.div>
              <motion.div
                variants={fadeInUp}
                whileHover={{ scale: 1.05 }}
                className="bg-card rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 border"
              >
                <div className="text-4xl font-bold text-primary mb-2">100%</div>
                <div className="text-sm text-muted-foreground">Free</div>
              </motion.div>
              <motion.div
                variants={fadeInUp}
                whileHover={{ scale: 1.05 }}
                className="bg-card rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 border"
              >
                <div className="text-4xl font-bold text-primary mb-2">24/7</div>
                <div className="text-sm text-muted-foreground">Available</div>
              </motion.div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t bg-muted/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center">
            <h3 className="text-lg font-semibold mb-4">SelfHelpHub</h3>
            <p className="text-muted-foreground mb-6 max-w-md mx-auto">
              Empowering personal growth through accessible self-help literature. Free, private, and always available.
            </p>
            <div className="flex justify-center gap-6 text-sm text-muted-foreground">
              <Link href="/about" className="hover:text-primary transition-colors">About</Link>
              <Link href="/legal" className="hover:text-primary transition-colors">Legal</Link>
              <Link href="/explore" className="hover:text-primary transition-colors">Explore</Link>
            </div>
          </div>
        </div>
      </footer>

      {/* Compliance Banner */}
      <motion.div
        initial={{ opacity: 0, y: 100 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1, duration: 0.5 }}
        className="fixed bottom-4 left-4 right-4 md:left-auto md:right-4 md:max-w-md"
      >
        <div className="bg-card border rounded-xl p-4 shadow-lg">
          <div className="flex items-start gap-3">
            <Shield className="w-5 h-5 text-orange-500 mt-0.5 flex-shrink-0" />
            <div className="flex-1">
              <p className="text-sm font-medium mb-1">Copyright Compliance</p>
              <p className="text-xs text-muted-foreground">
                SelfHelpHub respects copyright. Only upload books you own or have permission to use.
              </p>
              <Link href="/legal" className="text-xs text-primary hover:underline mt-2 inline-block">
                Learn more →
              </Link>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  )
}