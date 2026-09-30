'use client'

import { useState } from 'react'
import { getToolBySlug, getToolsByCategory } from '@/lib/tools-registry'
import { Badge } from '@/components/ui/badge'
import Link from 'next/link'
import { DnsLookupForm } from '@/components/tools/dns-lookup-form'
import { DkimCheckerForm } from '@/components/tools/dkim-checker-form'
import { PortCheckerForm } from '@/components/tools/port-checker-form'
import { SubnetCalculatorForm } from '@/components/tools/subnet-calculator-form'
import { GenericToolForm } from '@/components/tools/generic-tool-form'
import { ResultDisplay } from '@/components/tools/result-display'

interface ToolPageClientProps {
  slug: string
}

export function ToolPageClient({ slug }: ToolPageClientProps) {
  const [result, setResult] = useState<unknown>(null)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const tool = getToolBySlug(slug)
  if (!tool) return null

  const relatedTools = getToolsByCategory(tool.category).filter((t) => t.slug !== slug).slice(0, 4)
  const Icon = tool.icon

  const handleResult = (data: unknown) => {
    setResult(data)
    setError(null)
  }

  const handleError = (err: string) => {
    setError(err)
    setResult(null)
  }

  const renderForm = () => {
    const commonProps = {
      tool,
      loading,
      setLoading,
      onResult: handleResult,
      onError: handleError,
    }

    switch (tool.slug) {
      case 'dns-lookup': return <DnsLookupForm {...commonProps} />
      case 'dkim-checker': return <DkimCheckerForm {...commonProps} />
      case 'port-checker': return <PortCheckerForm {...commonProps} />
      case 'subnet-calculator': return <SubnetCalculatorForm {...commonProps} />
      default: return <GenericToolForm {...commonProps} />
    }
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[1fr_280px] gap-8">
      <div className="min-w-0">
        <div className="flex items-start gap-4 mb-8">
          <div className={`mt-0.5 ${tool.accentColor}`}>
            <Icon className="h-8 w-8" strokeWidth={1.5} />
          </div>
          <div>
            <div className="flex items-center gap-2 mb-1">
              <h1 className="text-2xl font-bold tracking-tight text-foreground">{tool.name}</h1>
              {tool.badge && (
                <Badge className="bg-primary/10 text-primary border-primary/20 text-xs">{tool.badge}</Badge>
              )}
            </div>
            <p className="text-muted-foreground leading-relaxed">{tool.description}</p>
          </div>
        </div>

        <div className="bg-card border border-border rounded-2xl p-6 mb-6 shadow-card">
          {renderForm()}
        </div>

        {(result || error || loading) && (
          <div className="bg-card border border-border rounded-2xl shadow-card overflow-hidden">
            <ResultDisplay tool={tool} result={result} error={error} loading={loading} />
          </div>
        )}
      </div>

      {relatedTools.length > 0 && (
        <aside>
          <div className="bg-card border border-border rounded-2xl p-5 shadow-card sticky top-24">
            <h3 className="text-sm font-semibold text-foreground mb-3 tracking-tight">Related Tools</h3>
            <div className="space-y-1">
              {relatedTools.map((related) => {
                const RelIcon = related.icon
                return (
                  <Link
                    key={related.slug}
                    href={`/tools/${related.slug}`}
                    className="flex items-center gap-2.5 px-2 py-2 rounded-xl text-sm text-muted-foreground hover:text-foreground hover:bg-muted transition-colors cursor-pointer"
                  >
                    <RelIcon className={`h-4 w-4 flex-shrink-0 ${related.accentColor}`} strokeWidth={1.5} />
                    {related.name}
                  </Link>
                )
              })}
            </div>
          </div>
        </aside>
      )}
    </div>
  )
}
