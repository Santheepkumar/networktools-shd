import type { Metadata } from 'next'
import './globals.css'
import { Providers } from '@/components/providers'
import { Navbar } from '@/components/layout/navbar'
import { Footer } from '@/components/layout/footer'
import { Toaster } from '@/components/ui/sonner'

export const metadata: Metadata = {
  title: {
    default: 'Network Tools by StrawHatDevs',
    template: '%s — Network Tools by StrawHatDevs',
  },
  description:
    'Free network diagnostic tools by StrawHatDevs — DNS lookup, WHOIS, SSL checker, ping, traceroute, port checker, HTTP headers, and more. Built for developers.',
  keywords: ['dns lookup', 'whois', 'ssl checker', 'ping', 'traceroute', 'port checker', 'network tools', 'strawhatdevs'],
  authors: [{ name: 'StrawHatDevs', url: 'https://strawhatdevs.com' }],
  creator: 'StrawHatDevs',
  openGraph: {
    type: 'website',
    locale: 'en_US',
    siteName: 'Network Tools by StrawHatDevs',
    title: 'Network Tools by StrawHatDevs',
    description: '22+ free network diagnostic tools for developers — DNS, WHOIS, SSL, HTTP, security audits and more.',
    images: [{ url: '/StrawHatDevs-Brand-Kit/02-PNG-Exports/primary-horizontal-dark-bg-3200.jpg', width: 3200, height: 1800, alt: 'StrawHatDevs Network Tools' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Network Tools by StrawHatDevs',
    description: '22+ free network diagnostic tools for developers.',
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
