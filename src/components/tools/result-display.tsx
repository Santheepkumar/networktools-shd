'use client'

import { type ToolDefinition } from '@/lib/tools-registry'
import { Loader2, AlertCircle, Copy, CheckCircle, XCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { toast } from 'sonner'
import { DnsResultTable } from './dns-result-table'
import { RedirectChain } from './redirect-chain'
import { SecurityScoreCard } from './security-score-card'

interface ResultDisplayProps {
  tool: ToolDefinition
  result: unknown
  error: string | null
  loading: boolean
}

export function ResultDisplay({ tool, result, error, loading }: ResultDisplayProps) {
  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    toast.success('Copied to clipboard')
  }

  if (loading) {
    return (
      <div className="p-6" data-testid="result-loading">
        <div className="flex items-center gap-3 text-muted-foreground mb-4">
          <Loader2 className="h-4 w-4 animate-spin" strokeWidth={1.5} />
          <span className="text-sm">Running {tool.name}...</span>
        </div>
        <div className="space-y-2">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-10 rounded-lg bg-muted animate-pulse" style={{ width: `${85 - i * 10}%` }} />
          ))}
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="p-6 flex items-start gap-3" data-testid="result-error">
        <AlertCircle className="h-5 w-5 text-destructive flex-shrink-0 mt-0.5" strokeWidth={1.5} />
        <div>
          <p className="font-medium text-sm text-foreground mb-0.5">Request failed</p>
          <p className="text-sm text-muted-foreground">{error}</p>
        </div>
      </div>
    )
  }

  if (!result) return null

  // Specialized renderers
  if (tool.slug === 'dns-lookup' || tool.slug === 'mx-lookup' || tool.slug === 'dns-propagation') {
    return <div data-testid="result-panel"><DnsResultTable result={result} tool={tool} onCopy={copyToClipboard} /></div>
  }
  if (tool.slug === 'http-redirects') {
    return <div data-testid="result-panel"><RedirectChain result={result} /></div>
  }
  if (tool.slug === 'domain-security') {
    return <div data-testid="result-panel"><SecurityScoreCard result={result} /></div>
  }
  if (tool.slug === 'port-checker') {
    return <div data-testid="result-panel"><PortCheckerResult result={result} onCopy={copyToClipboard} /></div>
  }
  if (tool.slug === 'http-headers') {
    return <div data-testid="result-panel"><HttpHeadersResult result={result} onCopy={copyToClipboard} /></div>
  }

  // Generic renderer for all other tools
  return (
    <div className="p-6" data-testid="result-panel">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-foreground">Results</h3>
        <Button
          variant="ghost" size="sm"
          className="cursor-pointer h-7 text-xs gap-1.5"
          onClick={() => copyToClipboard(JSON.stringify(result, null, 2))}
        >
          <Copy className="h-3.5 w-3.5" strokeWidth={1.5} />
          Copy JSON
        </Button>
      </div>
      <GenericResultRenderer result={result} onCopy={copyToClipboard} />
    </div>
  )
}

// ─── Port Checker ────────────────────────────────────────────────────────────

interface PortEntry {
  port: number
  service: string
  isOpen: boolean
  latencyMs?: number
}

interface PortCheckerData {
  host: string
  ip: string
  results: PortEntry[]
  summary: { total: number; open: number; closed: number }
}

function PortCheckerResult({ result, onCopy }: { result: unknown; onCopy: (s: string) => void }) {
  const data = result as PortCheckerData
  if (!data?.results) return null
  const { host, ip, results, summary } = data

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
        <div>
          <p className="text-sm font-semibold text-foreground">{host}</p>
          <p className="text-xs text-muted-foreground font-mono">{ip}</p>
        </div>
        <div className="flex items-center gap-4 text-sm">
          <span className="text-success font-semibold">{summary.open} open</span>
          <span className="text-muted-foreground">{summary.closed} closed</span>
          <Button variant="ghost" size="sm" className="cursor-pointer h-7 text-xs gap-1.5"
            onClick={() => onCopy(JSON.stringify(result, null, 2))}>
            <Copy className="h-3.5 w-3.5" strokeWidth={1.5} />
            Copy JSON
          </Button>
        </div>
      </div>

      {/* Results table */}
      <div className="divide-y divide-border rounded-xl border border-border overflow-hidden">
        <div className="grid grid-cols-[60px_1fr_120px_80px] gap-3 px-4 py-2 bg-muted/50">
          {['Port', 'Service', 'Status', 'Latency'].map((h) => (
            <span key={h} className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">{h}</span>
          ))}
        </div>
        {results.map((r) => (
          <div key={r.port}
            className="grid grid-cols-[60px_1fr_120px_80px] gap-3 px-4 py-3 hover:bg-muted/40 transition-colors items-center">
            <span className="font-mono text-sm text-foreground font-medium">{r.port}</span>
            <span className="text-sm text-muted-foreground">{r.service}</span>
            <div className="flex items-center gap-1.5">
              {r.isOpen ? (
                <>
                  <CheckCircle className="h-3.5 w-3.5 text-success" strokeWidth={2} />
                  <span className="text-xs font-medium text-success">Open</span>
                </>
              ) : (
                <>
                  <XCircle className="h-3.5 w-3.5 text-muted-foreground" strokeWidth={2} />
                  <span className="text-xs text-muted-foreground">Closed</span>
                </>
              )}
            </div>
            <span className="font-mono text-xs text-muted-foreground">
              {r.isOpen && r.latencyMs != null ? `${r.latencyMs}ms` : '—'}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}

// ─── HTTP Headers ─────────────────────────────────────────────────────────────

interface HeaderEntry {
  name: string
  value: string
  description?: string
  securityNote?: string
  grade?: string
}

interface HttpHeadersData {
  url: string
  statusCode: number
  headers: HeaderEntry[]
  securityScore: { score: number; maxScore: number; grade: string }
  missingSecurityHeaders: string[]
}

const GRADE_COLOR: Record<string, string> = {
  good: 'bg-success/10 text-success border-success/20',
  warning: 'bg-warning/10 text-warning border-warning/20',
  danger: 'bg-destructive/10 text-destructive border-destructive/20',
  info: 'bg-primary/10 text-primary border-primary/20',
}

function HttpHeadersResult({ result, onCopy }: { result: unknown; onCopy: (s: string) => void }) {
  const data = result as HttpHeadersData
  if (!data?.headers) return null
  const { headers, statusCode, securityScore, missingSecurityHeaders } = data

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <Badge variant="outline" className="font-mono text-xs">
            {statusCode}
          </Badge>
          <span className="text-sm text-muted-foreground">
            Security score: <span className="font-semibold text-foreground">{securityScore.score}/{securityScore.maxScore}</span>
            {' '}(Grade {securityScore.grade})
          </span>
        </div>
        <Button variant="ghost" size="sm" className="cursor-pointer h-7 text-xs gap-1.5"
          onClick={() => onCopy(JSON.stringify(result, null, 2))}>
          <Copy className="h-3.5 w-3.5" strokeWidth={1.5} />
          Copy JSON
        </Button>
      </div>

      <div className="divide-y divide-border rounded-xl border border-border overflow-hidden">
        {headers.map((h) => (
          <div key={h.name} className="px-4 py-3 hover:bg-muted/40 transition-colors group">
            <div className="flex items-start gap-3 flex-wrap">
              <div className="flex items-center gap-2 min-w-[200px]">
                <span className="font-mono text-xs font-medium text-foreground">{h.name}</span>
                {h.grade && GRADE_COLOR[h.grade] && (
                  <Badge variant="outline" className={`text-[10px] px-1.5 py-0 ${GRADE_COLOR[h.grade]}`}>
                    {h.grade}
                  </Badge>
                )}
              </div>
              <span className="font-mono text-xs text-muted-foreground flex-1 break-all">{h.value}</span>
              <button onClick={() => onCopy(h.value)} aria-label={`Copy ${h.name}`}
                className="cursor-pointer text-muted-foreground hover:text-foreground opacity-0 group-hover:opacity-100 transition-all flex-shrink-0">
                <Copy className="h-3.5 w-3.5" strokeWidth={1.5} />
              </button>
            </div>
            {h.description && (
              <p className="text-xs text-muted-foreground mt-1 ml-0">{h.description}</p>
            )}
            {h.securityNote && (
              <p className="text-xs text-warning mt-0.5">{h.securityNote}</p>
            )}
          </div>
        ))}
      </div>

      {missingSecurityHeaders.length > 0 && (
        <div className="mt-4 p-3 rounded-xl bg-destructive/8 border border-destructive/20">
          <p className="text-xs font-medium text-destructive mb-1">Missing security headers</p>
          <p className="text-xs font-mono text-muted-foreground">{missingSecurityHeaders.join(', ')}</p>
        </div>
      )}
    </div>
  )
}

// ─── Generic Renderer ─────────────────────────────────────────────────────────

/** Safely render any value — never outputs [object Object] */
function renderValue(value: unknown): React.ReactNode {
  if (value === null || value === undefined) {
    return <span className="text-muted-foreground italic">—</span>
  }
  if (typeof value === 'boolean') {
    return value
      ? <span className="text-success">Yes</span>
      : <span className="text-muted-foreground">No</span>
  }
  if (typeof value === 'number') return String(value)
  if (typeof value === 'string') return value || <span className="text-muted-foreground italic">—</span>

  // Array — render each item inline or as a stacked list
  if (Array.isArray(value)) {
    if (value.length === 0) return <span className="text-muted-foreground italic">—</span>
    // Array of primitives → comma-separated
    if (value.every((v) => typeof v !== 'object' || v === null)) {
      return value.join(', ')
    }
    // Array of objects → stacked mini-rows
    return (
      <div className="space-y-1 w-full">
        {value.map((item, i) => (
          <div key={i} className="text-xs font-mono text-foreground bg-muted/50 rounded-lg px-2 py-1.5 break-all">
            {typeof item === 'object' && item !== null
              ? Object.entries(item as Record<string, unknown>)
                  .map(([k, v]) => `${k}: ${typeof v === 'object' ? JSON.stringify(v) : String(v ?? '—')}`)
                  .join(' · ')
              : String(item)}
          </div>
        ))}
      </div>
    )
  }

  // Nested object → key: value pairs inline
  if (typeof value === 'object') {
    const entries = Object.entries(value as Record<string, unknown>).filter(([, v]) => v != null)
    if (entries.length === 0) return <span className="text-muted-foreground italic">—</span>
    return (
      <div className="space-y-0.5 w-full">
        {entries.map(([k, v]) => (
          <div key={k} className="text-xs font-mono text-foreground">
            <span className="text-muted-foreground">{k}: </span>
            {typeof v === 'object' ? JSON.stringify(v) : String(v ?? '—')}
          </div>
        ))}
      </div>
    )
  }

  return String(value)
}

function GenericResultRenderer({ result, onCopy }: { result: unknown; onCopy: (s: string) => void }) {
  if (Array.isArray(result)) {
    if (result.length === 0) {
      return <p className="text-sm text-muted-foreground">No results found.</p>
    }
    return (
      <div className="space-y-2">
        {result.map((item, i) => (
          <div key={i}
            className="flex items-start gap-4 px-4 py-3 rounded-xl border border-border hover:bg-muted/40 transition-colors group">
            {item && typeof item === 'object' ? (
              <div className="flex-1 flex flex-wrap gap-x-6 gap-y-2 min-w-0">
                {Object.entries(item as Record<string, unknown>).map(([k, v]) => (
                  <div key={k} className="flex flex-col gap-0.5 min-w-0">
                    <span className="text-[10px] text-muted-foreground uppercase tracking-wider">{k}</span>
                    <span className="text-sm font-mono text-foreground">{renderValue(v)}</span>
                  </div>
                ))}
              </div>
            ) : (
              <span className="text-sm font-mono text-foreground flex-1">{String(item)}</span>
            )}
            <button onClick={() => onCopy(JSON.stringify(item))} aria-label="Copy row"
              className="cursor-pointer ml-auto text-muted-foreground hover:text-foreground opacity-0 group-hover:opacity-100 transition-all flex-shrink-0 mt-0.5">
              <Copy className="h-3.5 w-3.5" strokeWidth={1.5} />
            </button>
          </div>
        ))}
      </div>
    )
  }

  if (result && typeof result === 'object') {
    const entries = Object.entries(result as Record<string, unknown>)
    return (
      <div className="divide-y divide-border rounded-xl border border-border overflow-hidden">
        {entries.map(([key, value]) => (
          <div key={key} className="flex items-start gap-4 px-4 py-3 hover:bg-muted/40 transition-colors group">
            <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider w-36 flex-shrink-0 pt-0.5">
              {key.replace(/([A-Z])/g, ' $1').trim()}
            </span>
            <div className="flex-1 min-w-0 text-sm font-mono text-foreground break-all">
              {renderValue(value)}
            </div>
            <button
              onClick={() => onCopy(
                typeof value === 'object' ? JSON.stringify(value, null, 2) : String(value ?? '')
              )}
              aria-label={`Copy ${key}`}
              className="cursor-pointer text-muted-foreground hover:text-foreground opacity-0 group-hover:opacity-100 transition-all flex-shrink-0 mt-0.5">
              <Copy className="h-3.5 w-3.5" strokeWidth={1.5} />
            </button>
          </div>
        ))}
      </div>
    )
  }

  return <pre className="text-xs font-mono text-foreground whitespace-pre-wrap break-all">{String(result)}</pre>
}
