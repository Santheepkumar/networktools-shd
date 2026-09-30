'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Loader2, Search } from 'lucide-react'
import { type ToolDefinition } from '@/lib/tools-registry'

interface DkimCheckerFormProps {
  tool: ToolDefinition
  loading: boolean
  setLoading: (v: boolean) => void
  onResult: (data: unknown) => void
  onError: (err: string) => void
}

export function DkimCheckerForm({ tool, loading, setLoading, onResult, onError }: DkimCheckerFormProps) {
  const [domain, setDomain] = useState('')
  const [selector, setSelector] = useState('default')
  const [domainError, setDomainError] = useState<string | null>(null)
  const [selectorError, setSelectorError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const trimmedDomain = domain.trim()
    const trimmedSelector = selector.trim()
    let hasError = false

    if (!trimmedDomain) { setDomainError('Domain is required'); hasError = true }
    else {
      const domainRe = /^(?:[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?\.)+[a-zA-Z]{2,}$/
      if (!domainRe.test(trimmedDomain)) { setDomainError('Enter a valid domain name (e.g. example.com)'); hasError = true }
      else setDomainError(null)
    }

    if (!trimmedSelector) { setSelectorError('Selector is required'); hasError = true }
    else setSelectorError(null)

    if (hasError) return

    setLoading(true)
    try {
      const res = await fetch(tool.apiEndpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ domain: trimmedDomain, selector: trimmedSelector || 'default' }),
      })
      const json = await res.json()
      if (!json.success) throw new Error(json.error || 'Check failed')
      onResult(json.data)
    } catch (err) {
      onError(err instanceof Error ? err.message : 'Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium text-foreground" htmlFor="dkim-domain">Domain</label>
          <Input
            id="dkim-domain"
            data-testid="dkim-domain"
            placeholder="example.com"
            value={domain}
            onChange={(e) => { setDomain(e.target.value); setDomainError(null) }}
            className={domainError ? 'border-destructive' : ''}
            disabled={loading}
            autoComplete="off"
            spellCheck={false}
          />
          {domainError && <p className="text-sm text-destructive" data-testid="input-error">{domainError}</p>}
        </div>
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium text-foreground" htmlFor="dkim-selector">Selector</label>
          <Input
            id="dkim-selector"
            data-testid="dkim-selector"
            placeholder="default, google, selector1"
            value={selector}
            onChange={(e) => { setSelector(e.target.value); setSelectorError(null) }}
            className={selectorError ? 'border-destructive' : ''}
            disabled={loading}
            autoComplete="off"
          />
          {selectorError && <p className="text-sm text-destructive" data-testid="selector-error">{selectorError}</p>}
          <p className="text-xs text-muted-foreground">Common selectors: default, google, selector1, k1</p>
        </div>
      </div>
      <Button type="submit" disabled={loading} data-testid="submit-btn" className="cursor-pointer">
        {loading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" strokeWidth={1.5} /> : <Search className="h-4 w-4 mr-2" strokeWidth={1.5} />}
        {loading ? 'Checking...' : 'Check DKIM'}
      </Button>
    </form>
  )
}
