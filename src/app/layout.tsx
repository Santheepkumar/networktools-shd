import type { Metadata } from 'next'
import './globals.css'
import { Providers } from '@/components/providers'
import { Navbar } from '@/components/layout/navbar'
import { Footer } from '@/components/layout/footer'
import { Toaster } from '@/components/ui/sonner'

export const metadata: Metadata = {
  title: {
    default: 'DevTools by StrawHatDevs',
    template: '%s — DevTools by StrawHatDevs',
  },
  description:
    'Free developer tools by StrawHatDevs — DNS lookup, WHOIS, SSL checker, Base64, JWT decoder, JSON formatter, color converter, secret generator, and more.',
  keywords: ['developer tools', 'devtools', 'dns lookup', 'whois', 'ssl checker', 'base64', 'jwt decoder', 'json formatter', 'color converter', 'secret generator', 'strawhatdevs'],
  authors: [{ name: 'StrawHatDevs', url: 'https://strawhatdevs.com' }],
  creator: 'StrawHatDevs',
  openGraph: {
    type: 'website',
    locale: 'en_US',
    siteName: 'DevTools by StrawHatDevs',
    title: 'DevTools by StrawHatDevs',
    description: '37+ free developer tools — DNS, networking, encoding, color, JSON, time utilities and more.',
    images: [{ url: '/StrawHatDevs-Brand-Kit/02-PNG-Exports/primary-horizontal-dark-bg-3200.jpg', width: 3200, height: 1800, alt: 'DevTools by StrawHatDevs' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'DevTools by StrawHatDevs',
    description: '37+ free developer tools for every workflow.',
    creator: '@strawhatdevs',
  },
  icons: {
    icon: [
      { url: '/icon-192.png', sizes: '192x192', type: 'image/png' },
      { url: '/icon-512.png', sizes: '512x512', type: 'image/png' },
      { url: '/logo-icon.svg', type: 'image/svg+xml' },
    ],
    apple: '/icon-192.png',
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="antialiased flex flex-col min-h-[100dvh]">
        <Providers>
          <Navbar />
          <div className="flex-1">{children}</div>
          <Footer />
          <Toaster position="bottom-right" />
        </Providers>
      </body>
    </html>
  )
}
