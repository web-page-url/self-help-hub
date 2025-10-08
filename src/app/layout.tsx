import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import { LayoutClient } from "@/components/layout-client";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "SelfHelpHub - Your Personal Self-Help Library",
  description: "Build a personal library of self-help books. Read, annotate. Privacy-first, copyright-compliant.",
  keywords: "self-help, books, PDF reader, annotations, personal development, offline reading, productivity, motivation, mindfulness",
  authors: [{ name: "SelfHelpHub Team" }],
  creator: "SelfHelpHub",
  publisher: "SelfHelpHub",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  viewport: "width=device-width, initial-scale=1",

  // Basic meta tags
  metadataBase: new URL('https://self-help-hub.vercel.app'),
  alternates: {
    canonical: 'https://self-help-hub.vercel.app',
  },

  // Open Graph / Facebook
  openGraph: {
    type: 'website',
    url: 'https://self-help-hub.vercel.app',
    title: 'SelfHelpHub - Your Personal Self-Help Library',
    description: 'Build a personal library of self-help books. Read, annotate. Privacy-first, copyright-compliant.',
    siteName: 'SelfHelpHub',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'SelfHelpHub - Personal Self-Help Library',
      },
    ],
    locale: 'en_US',
  },

  // Twitter
  twitter: {
    card: 'summary_large_image',
    title: 'SelfHelpHub - Your Personal Self-Help Library',
    description: 'Build a personal library of self-help books. Read, annotate. Privacy-first, copyright-compliant.',
    images: ['/twitter-image.png'],
    creator: '@selfhelphub',
    site: '@selfhelphub',
  },

  // Additional meta tags
  robots: {
    index: true,
    follow: true,
    nocache: true,
    googleBot: {
      index: true,
      follow: true,
      noimageindex: false,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },

  // Icons
  icons: {
    icon: [
      { url: '/favicon.ico', sizes: 'any' },
      { url: '/icon-16x16.png', sizes: '16x16', type: 'image/png' },
      { url: '/icon-32x32.png', sizes: '32x32', type: 'image/png' },
    ],
    apple: [
      { url: '/apple-touch-icon.png', sizes: '180x180', type: 'image/png' },
    ],
    other: [
      {
        rel: 'android-chrome-192x192',
        url: '/android-chrome-192x192.png',
      },
      {
        rel: 'android-chrome-512x512',
        url: '/android-chrome-512x512.png',
      },
    ],
  },

  // Manifest
  manifest: '/manifest.json',

  // Verification (add your actual verification codes)
  verification: {
    google: 'your-google-site-verification-code',
    yandex: 'your-yandex-verification-code',
  },

  // Category
  category: 'education',

  // App metadata
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'SelfHelpHub',
  },

  // Theme color
  themeColor: '#3b82f6',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased font-sans`}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <LayoutClient>
            {children}
          </LayoutClient>
        </ThemeProvider>
      </body>
    </html>
  );
}
