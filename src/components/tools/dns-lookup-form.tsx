'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Loader2, Search } from 'lucide-react'
import { type ToolDefinition } from '@/lib/tools-registry'

const DNS_RECORD_TYPES = ['A', 'AAAA', 'CNAME', 'MX', 'TXT', 'NS', 'SOA', 'CAA', 'ANY'] as const

interface DnsLookupFormProps {
  tool: ToolDefinition
  loading: boolean
  setLoading: (v: boolean) => void
  onResult: (data: unknown) => void
  onError: (err: string) => void
}

export function DnsLookupForm({ tool, loading, setLoading, onResult, onError }: DnsLookupFormProps) {
  const [domain, setDomain] = useState('')
  const [recordType, setRecordType] = useState<string>('A')
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const trimmed = domain.trim()
    if (!trimmed) { setError('Domain is required'); return }
    const domainRe = /^(?:[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?\.)+[a-zA-Z]{2,}$/
    if (!domainRe.test(trimmed)) { setError('Enter a valid domain name (e.g. example.com)'); return }
    setError(null)
    setLoading(true)
    try {
      const res = await fetch(tool.apiEndpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ domain: trimmed, recordType }),
      })
      const json = await res.json()
      if (!json.success) throw new Error(json.error || 'Lookup failed')
      onResult(json.data)
    } catch (err) {
      onError(err instanceof Error ? err.message : 'Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <div className="flex flex-col gap-1.5 mb-4">
        <label className="text-sm font-medium text-foreground" htmlFor="dns-domain">Domain</label>
        <div className="flex gap-2 items-start flex-wrap">
          <div className="flex-1 min-w-[200px]">
            <Input
              id="dns-domain"
              data-testid="domain-input"
              placeholder="example.com"
              value={domain}
              onChange={(e) => { setDomain(e.target.value); setError(null) }}
              className={error ? 'border-destructive focus-visible:ring-destructive' : ''}
              disabled={loading}
              autoComplete="off"
              spellCheck={false}
            />
            {error && <p className="text-sm text-destructive mt-1" data-testid="input-error">{error}</p>}
          </div>
          <div>
            <label className="sr-only" htmlFor="record-type">Record type</label>
            <Select value={recordType} onValueChange={(v) => { if (v) setRecordType(v) }} disabled={loading}>
              <SelectTrigger id="record-type" data-testid="record-type-select" className="w-[110px] cursor-pointer">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {DNS_RECORD_TYPES.map((type) => (
                  <SelectItem key={type} value={type} className="cursor-pointer font-mono text-xs">{type}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>
      <Button type="submit" disabled={loading} data-testid="submit-btn" className="cursor-pointer">
        {loading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" strokeWidth={1.5} /> : <Search className="h-4 w-4 mr-2" strokeWidth={1.5} />}
        {loading ? 'Looking up...' : 'Lookup'}
      </Button>
    </form>
  )
}
