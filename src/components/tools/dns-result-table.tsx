'use client'

import { type ToolDefinition } from '@/lib/tools-registry'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Copy } from 'lucide-react'

interface DnsResultTableProps {
  result: unknown
  tool: ToolDefinition
  onCopy: (s: string) => void
}

const RECORD_TYPE_COLORS: Record<string, string> = {
  A: 'bg-blue-500/10 text-blue-500 border-blue-500/20',
  AAAA: 'bg-violet-500/10 text-violet-500 border-violet-500/20',
  CNAME: 'bg-amber-500/10 text-amber-500 border-amber-500/20',
  MX: 'bg-pink-500/10 text-pink-500 border-pink-500/20',
  TXT: 'bg-teal-500/10 text-teal-500 border-teal-500/20',
  NS: 'bg-indigo-500/10 text-indigo-500 border-indigo-500/20',
  SOA: 'bg-orange-500/10 text-orange-500 border-orange-500/20',
  CAA: 'bg-red-500/10 text-red-500 border-red-500/20',
  PTR: 'bg-cyan-500/10 text-cyan-500 border-cyan-500/20',
}

export function DnsResultTable({ result, tool, onCopy }: DnsResultTableProps) {
  const records = Array.isArray(result) ? result : []

  if (records.length === 0) {
    return (
      <div className="p-6 text-center">
        <p className="text-sm text-muted-foreground">No records found</p>
      </div>
    )
  }

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-foreground">
          {records.length} record{records.length !== 1 ? 's' : ''} found
        </h3>
        <Button
          variant="ghost" size="sm"
          className="cursor-pointer h-7 text-xs gap-1.5"
          onClick={() => onCopy(JSON.stringify(result, null, 2))}
        >
          <Copy className="h-3.5 w-3.5" strokeWidth={1.5} />
          Copy all
        </Button>
      </div>
      <div className="divide-y divide-border rounded-xl border border-border overflow-hidden">
        <div className="grid grid-cols-[90px_70px_1fr_60px] gap-3 px-4 py-2 bg-muted/50">
          {['Type', 'TTL', 'Value', 'Priority'].map((h) => (
            <span key={h} className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">{h}</span>
          ))}
        </div>
        {records.map((record: Record<string, unknown>, i: number) => (
          <div
            key={i}
            className="grid grid-cols-[90px_70px_1fr_60px] gap-3 px-4 py-3 hover:bg-muted/40 transition-colors items-start group"
          >
            <div>
              <Badge
                variant="outline"
                className={`text-[10px] font-mono font-semibold ${RECORD_TYPE_COLORS[String(record.type)] || ''}`}
              >
                {String(record.type)}
              </Badge>
            </div>
            <span className="text-xs font-mono text-muted-foreground pt-0.5">
              {record.ttl != null ? `${record.ttl}s` : '—'}
            </span>
            <span className="text-sm font-mono text-foreground break-all leading-relaxed">{String(record.value ?? '—')}</span>
            <div className="flex items-center gap-2 pt-0.5">
              {record.priority != null && (
                <span className="text-xs font-mono text-muted-foreground">{String(record.priority)}</span>
              )}
              <button
                onClick={() => onCopy(String(record.value))}
                aria-label="Copy value"
                className="cursor-pointer text-muted-foreground hover:text-foreground opacity-0 group-hover:opacity-100 transition-all ml-auto"
              >
                <Copy className="h-3.5 w-3.5" strokeWidth={1.5} />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
