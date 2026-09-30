import { notFound } from 'next/navigation'
import { getToolBySlug, TOOLS } from '@/lib/tools-registry'
import { ToolPageClient } from './tool-page-client'
import { ChevronRight, Home } from 'lucide-react'
import Link from 'next/link'
import type { Metadata } from 'next'

interface PageProps {
  params: Promise<{ slug: string }>
}

export async function generateStaticParams() {
  return TOOLS.map((tool) => ({ slug: tool.slug }))
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params
  const tool = getToolBySlug(slug)
  if (!tool) return {}
  return {
    title: tool.name,
    description: tool.description,
  }
}

export default async function ToolPage({ params }: PageProps) {
  const { slug } = await params
  const tool = getToolBySlug(slug)
  if (!tool) notFound()

  return (
    <main className="min-h-[100dvh] overflow-x-hidden">
      <div className="pt-24 pb-16 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto">
          <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-sm text-muted-foreground mb-6">
            <Link href="/" className="hover:text-foreground transition-colors flex items-center gap-1 cursor-pointer">
              <Home className="h-3.5 w-3.5" strokeWidth={1.5} />
              Home
            </Link>
            <ChevronRight className="h-3.5 w-3.5" strokeWidth={1.5} />
            <span className="text-foreground font-medium">{tool.name}</span>
          </nav>
          <ToolPageClient slug={slug} />
        </div>
      </div>
    </main>
  )
}
