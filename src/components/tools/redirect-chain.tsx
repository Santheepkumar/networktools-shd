'use client'

import { ArrowDown, Clock } from 'lucide-react'
import { Badge } from '@/components/ui/badge'

interface RedirectHop {
  url: string
  statusCode: number
  statusText: string
  location?: string
  responseTimeMs: number
}

function getStatusColor(code: number): string {
  if (code >= 200 && code < 300) return 'bg-[rgb(var(--success)_/_0.1)] text-[rgb(var(--success))] border-[rgb(var(--success)_/_0.3)]'
  if (code >= 300 && code < 400) return 'bg-[rgb(var(--warning)_/_0.1)] text-[rgb(var(--warning))] border-[rgb(var(--warning)_/_0.3)]'
  if (code >= 400) return 'bg-destructive/10 text-destructive border-destructive/30'
  return 'bg-muted text-muted-foreground border-border'
}

export function RedirectChain({ result }: { result: unknown }) {
  const hops = Array.isArray(result) ? (result as RedirectHop[]) : []

  if (hops.length === 0) {
    return (
      <div className="p-6 text-center">
        <p className="text-sm text-muted-foreground">No redirect chain data available</p>
      </div>
    )
  }

  return (
    <div className="p-6">
      <h3 className="text-sm font-semibold text-foreground mb-5">
        {hops.length} hop{hops.length !== 1 ? 's' : ''} in redirect chain
      </h3>
      <div className="space-y-1">
        {hops.map((hop, i) => (
          <div key={i}>
            <div className="bg-muted/40 border border-border rounded-xl p-4">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-2 flex-wrap">
                    <Badge variant="outline" className={`font-mono text-xs font-semibold ${getStatusColor(hop.statusCode)}`}>
                      {hop.statusCode}
                    </Badge>
                    <span className="text-xs text-muted-foreground">{hop.statusText}</span>
                    {i === hops.length - 1 && (
                      <Badge variant="outline" className="text-[10px] bg-[rgb(var(--success)_/_0.1)] text-[rgb(var(--success))] border-[rgb(var(--success)_/_0.3)]">
                        Final destination
                      </Badge>
                    )}
                  </div>
                  <p className="text-sm font-mono text-foreground break-all leading-relaxed">{hop.url}</p>
                </div>
                <div className="flex items-center gap-1 text-xs text-muted-foreground flex-shrink-0">
                  <Clock className="h-3 w-3" strokeWidth={1.5} />
                  <span>{hop.responseTimeMs}ms</span>
                </div>
              </div>
              {hop.location && (
                <div className="mt-2 pt-2 border-t border-border">
                  <span className="text-[10px] text-muted-foreground uppercase tracking-wider mr-2">Location</span>
                  <span className="text-xs font-mono text-primary break-all">{hop.location}</span>
                </div>
              )}
            </div>
            {i < hops.length - 1 && (
              <div className="flex justify-center py-1">
                <ArrowDown className="h-4 w-4 text-muted-foreground/40" strokeWidth={1.5} />
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
