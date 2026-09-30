'use client'

import { useState } from 'react'
import { getToolBySlug, getToolsByCategory } from '@/lib/tools-registry'
import { Badge } from '@/components/ui/badge'
import Link from 'next/link'

// Existing network tool forms
import { DnsLookupForm } from '@/components/tools/dns-lookup-form'
import { DkimCheckerForm } from '@/components/tools/dkim-checker-form'
import { PortCheckerForm } from '@/components/tools/port-checker-form'
import { SubnetCalculatorForm } from '@/components/tools/subnet-calculator-form'
import { GenericToolForm } from '@/components/tools/generic-tool-form'
import { ResultDisplay } from '@/components/tools/result-display'

// New client-side tool forms — Encoding & Decoding
import { Base64Form } from '@/components/tools/base64-form'
import { UrlEncoderForm } from '@/components/tools/url-encoder-form'
import { JwtDecoderForm } from '@/components/tools/jwt-decoder-form'
import { HtmlEntitiesForm } from '@/components/tools/html-entities-form'
import { SecretGeneratorForm } from '@/components/tools/secret-generator-form'

// New client-side tool forms — Text Utilities
import { HashGeneratorForm } from '@/components/tools/hash-generator-form'
import { LoremIpsumForm } from '@/components/tools/lorem-ipsum-form'
import { TextDiffForm } from '@/components/tools/text-diff-form'
import { RegexTesterForm } from '@/components/tools/regex-tester-form'
import { WordCounterForm } from '@/components/tools/word-counter-form'

// New client-side tool forms — Color
import { ColorConverterForm } from '@/components/tools/color-converter-form'
import { ContrastCheckerForm } from '@/components/tools/contrast-checker-form'

// New client-side tool forms — Time & Date
import { UnixTimestampForm } from '@/components/tools/unix-timestamp-form'
import { CronParserForm } from '@/components/tools/cron-parser-form'
import { TimezoneConverterForm } from '@/components/tools/timezone-converter-form'

// New client-side tool forms — Formatters
import { JsonFormatterForm } from '@/components/tools/json-formatter-form'

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

  // Client-side tools render their own self-contained UI — no result panel wrapper
  const CLIENT_SIDE_SLUGS = new Set([
    'base64', 'url-encoder', 'jwt-decoder', 'html-entities', 'secret-generator',
    'hash-generator', 'lorem-ipsum', 'text-diff', 'regex-tester', 'word-counter',
    'color-converter', 'contrast-checker',
    'unix-timestamp', 'cron-parser', 'timezone-converter',
    'json-formatter',
  ])

  const isClientSide = CLIENT_SIDE_SLUGS.has(tool.slug)

  const renderForm = () => {
    const commonProps = {
      tool,
      loading,
      setLoading,
      onResult: handleResult,
      onError: handleError,
    }

    switch (tool.slug) {
      // Network tools (server-side with result display)
      case 'dns-lookup':        return <DnsLookupForm {...commonProps} />
      case 'dkim-checker':      return <DkimCheckerForm {...commonProps} />
      case 'port-checker':      return <PortCheckerForm {...commonProps} />
      case 'subnet-calculator': return <SubnetCalculatorForm {...commonProps} />

      // Encoding & Decoding (client-side, self-contained)
      case 'base64':            return <Base64Form />
      case 'url-encoder':       return <UrlEncoderForm />
      case 'jwt-decoder':       return <JwtDecoderForm />
      case 'html-entities':     return <HtmlEntitiesForm />
      case 'secret-generator':  return <SecretGeneratorForm />

      // Text Utilities
      case 'hash-generator':    return <HashGeneratorForm />
      case 'lorem-ipsum':       return <LoremIpsumForm />
      case 'text-diff':         return <TextDiffForm />
      case 'regex-tester':      return <RegexTesterForm />
      case 'word-counter':      return <WordCounterForm />

      // Color
      case 'color-converter':   return <ColorConverterForm />
      case 'contrast-checker':  return <ContrastCheckerForm />

      // Time & Date
      case 'unix-timestamp':    return <UnixTimestampForm />
      case 'cron-parser':       return <CronParserForm />
      case 'timezone-converter': return <TimezoneConverterForm />

      // Formatters
      case 'json-formatter':    return <JsonFormatterForm />

      // Default: generic server-side form
      default:                  return <GenericToolForm {...commonProps} />
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

        {/* Client-side tools render entirely within the card */}
        <div className="bg-card border border-border rounded-2xl p-6 mb-6 shadow-card">
          {renderForm()}
        </div>

        {/* Server-side tools show a separate result panel */}
        {!isClientSide && (result || error || loading) && (
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
