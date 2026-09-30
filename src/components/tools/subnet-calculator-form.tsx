'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Loader2, Calculator } from 'lucide-react'
import { type ToolDefinition } from '@/lib/tools-registry'

interface SubnetCalculatorFormProps {
  tool: ToolDefinition
  loading: boolean
  setLoading: (v: boolean) => void
  onResult: (data: unknown) => void
  onError: (err: string) => void
}

export function SubnetCalculatorForm({ tool, loading, setLoading, onResult, onError }: SubnetCalculatorFormProps) {
  const [cidr, setCidr] = useState('')
  const [newPrefix, setNewPrefix] = useState('26')
  const [cidrError, setCidrError] = useState<string | null>(null)
  const [prefixError, setPrefixError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const trimmedCidr = cidr.trim()
    const prefix = parseInt(newPrefix)
    let hasError = false

    const cidrRe = /^(?:(?:25[0-5]|2[0-4]\d|[01]?\d\d?)\.){3}(?:25[0-5]|2[0-4]\d|[01]?\d\d?)\/(\d{1,2})$/
    const match = trimmedCidr.match(cidrRe)
    if (!trimmedCidr) { setCidrError('CIDR block is required'); hasError = true }
    else if (!match) { setCidrError('Enter a valid CIDR block (e.g. 10.0.0.0/8)'); hasError = true }
    else { setCidrError(null) }

    if (isNaN(prefix) || prefix < 1 || prefix > 30) {
      setPrefixError('New prefix must be between 1 and 30')
      hasError = true
    } else if (match) {
      const parentPrefix = parseInt(match[1])
      if (prefix <= parentPrefix) {
        setPrefixError(`New prefix (/${prefix}) must be larger than parent prefix (/${parentPrefix})`)
        hasError = true
      } else {
        setPrefixError(null)
      }
    } else {
      setPrefixError(null)
    }

    if (hasError) return
    setLoading(true)
    try {
      const res = await fetch(tool.apiEndpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cidr: trimmedCidr, newPrefix: prefix }),
      })
      const json = await res.json()
      if (!json.success) throw new Error(json.error || 'Calculation failed')
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
          <label className="text-sm font-medium text-foreground" htmlFor="subnet-cidr">Network CIDR</label>
          <Input
            id="subnet-cidr"
            data-testid="cidr-input"
            placeholder="10.0.0.0/8"
            value={cidr}
            onChange={(e) => { setCidr(e.target.value); setCidrError(null) }}
            className={`font-mono ${cidrError ? 'border-destructive' : ''}`}
            disabled={loading}
          />
          {cidrError && <p className="text-sm text-destructive" data-testid="cidr-error">{cidrError}</p>}
        </div>
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium text-foreground" htmlFor="new-prefix">New Subnet Prefix</label>
          <Input
            id="new-prefix"
            data-testid="prefix-input"
            placeholder="26"
            value={newPrefix}
            onChange={(e) => { setNewPrefix(e.target.value); setPrefixError(null) }}
            className={`font-mono ${prefixError ? 'border-destructive' : ''}`}
            autoComplete="off"
            disabled={loading}
          />
          {prefixError && <p className="text-sm text-destructive" data-testid="prefix-error">{prefixError}</p>}
          <p className="text-xs text-muted-foreground">Must be larger than the parent network prefix</p>
        </div>
      </div>
      <Button type="submit" disabled={loading} data-testid="submit-btn" className="cursor-pointer">
        {loading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" strokeWidth={1.5} /> : <Calculator className="h-4 w-4 mr-2" strokeWidth={1.5} />}
        {loading ? 'Calculating...' : 'Calculate Subnets'}
      </Button>
    </form>
  )
}
