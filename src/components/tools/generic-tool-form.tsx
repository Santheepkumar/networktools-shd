'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Loader2, Search } from 'lucide-react'
import { type ToolDefinition } from '@/lib/tools-registry'

interface GenericToolFormProps {
  tool: ToolDefinition
  loading: boolean
  setLoading: (v: boolean) => void
  onResult: (data: unknown) => void
  onError: (err: string) => void
}

// Per-field inline validators (client-side, before API call)
function validateInput(slug: string, inputType: string, value: string): string | null {
  if (!value.trim()) {
    const label = inputType === 'url' ? 'URL' : inputType === 'ip' ? 'IP address' : inputType === 'cidr' ? 'CIDR block' : 'domain'
    return `Please enter a ${label}`
  }

  // ASN lookup — check first (before generic IP check)
  if (slug === 'asn-lookup') {
    const ipv4 = /^(?:(?:25[0-5]|2[0-4]\d|[01]?\d\d?)\.){3}(?:25[0-5]|2[0-4]\d|[01]?\d\d?)$/
    const asn = /^AS\d+$/i
    if (!ipv4.test(value.trim()) && !asn.test(value.trim())) {
      return 'Enter an IP address or ASN number (e.g. 8.8.8.8 or AS15169)'
    }
    return null
  }

  if (inputType === 'ip') {
    const ipv4 = /^(?:(?:25[0-5]|2[0-4]\d|[01]?\d\d?)\.){3}(?:25[0-5]|2[0-4]\d|[01]?\d\d?)$/
    const ipv6 = /^(?:[0-9a-fA-F]{1,4}:){1,7}[0-9a-fA-F]{1,4}$|^::[\w:]*$/
    if (!ipv4.test(value.trim()) && !ipv6.test(value.trim())) {
      return 'Enter a valid IP address (e.g. 8.8.8.8)'
    }
  }

  if (inputType === 'url') {
    try {
      const url = new URL(value.trim())
      if (url.protocol !== 'http:' && url.protocol !== 'https:') {
        return 'URL must start with http:// or https://'
      }
    } catch {
      return 'Enter a valid URL (e.g. https://example.com)'
    }
  }

  if (inputType === 'cidr') {
    const cidr = /^(?:(?:25[0-5]|2[0-4]\d|[01]?\d\d?)\.){3}(?:25[0-5]|2[0-4]\d|[01]?\d\d?)\/(\d{1,2})$/
    const match = value.trim().match(cidr)
    if (!match) return 'Enter a valid CIDR block (e.g. 192.168.1.0/24)'
    const prefix = parseInt(match[1])
    if (prefix < 0 || prefix > 32) return 'Prefix length must be between 0 and 32'
  }

  if (inputType === 'domain') {
    const ipv4 = /^(?:(?:25[0-5]|2[0-4]\d|[01]?\d\d?)\.){3}(?:25[0-5]|2[0-4]\d|[01]?\d\d?)$/
    const domainRe = /^(?:[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?\.)+[a-zA-Z]{2,}$/
    // ping, traceroute, port-checker accept both domains AND IPs
    const isHostTool = ['ping', 'traceroute', 'port-checker'].includes(slug)
    if (isHostTool) {
      if (!domainRe.test(value.trim()) && !ipv4.test(value.trim())) {
        return 'Enter a valid hostname or IP address (e.g. example.com or 8.8.8.8)'
      }
    } else {
      if (!domainRe.test(value.trim())) {
        return 'Enter a valid domain name (e.g. example.com)'
      }
    }
  }

  return null
}

export function GenericToolForm({ tool, loading, setLoading, onResult, onError }: GenericToolFormProps) {
  const [value, setValue] = useState('')
  const [validationError, setValidationError] = useState<string | null>(null)

  // Special case: my-infrastructure needs no input
  if (tool.slug === 'my-infrastructure') {
    const handleRun = async () => {
      setLoading(true)
      try {
        const res = await fetch(tool.apiEndpoint)
        const json = await res.json()
        if (!json.success) throw new Error(json.error || 'Request failed')
        onResult(json.data)
      } catch (err) {
        onError(err instanceof Error ? err.message : 'Something went wrong')
      } finally {
        setLoading(false)
      }
    }

    return (
      <div>
        <p className="text-sm text-muted-foreground mb-4">
          Detect your public IP address, DNS resolver, geolocation, ISP, and request headers automatically.
        </p>
        <Button
          onClick={handleRun}
          disabled={loading}
          data-testid="submit-btn"
          className="cursor-pointer"
        >
          {loading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" strokeWidth={1.5} /> : null}
          {loading ? 'Detecting...' : 'Detect My Infrastructure'}
        </Button>
      </div>
    )
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const trimmed = value.trim()
    const err = validateInput(tool.slug, tool.inputType, trimmed)
    if (err) { setValidationError(err); return }
    setValidationError(null)
    setLoading(true)

    const payloadKey = tool.inputType === 'url' ? 'url'
      : tool.inputType === 'ip' ? 'ip'
      : tool.inputType === 'cidr' ? 'cidr'
      : tool.slug === 'asn-lookup' ? 'query'
      : 'domain'

    try {
      const res = await fetch(tool.apiEndpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ [payloadKey]: trimmed }),
      })
      const json = await res.json()
      if (!json.success) throw new Error(json.error || 'Request failed')
      onResult(json.data)
    } catch (err) {
      onError(err instanceof Error ? err.message : 'Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  const fieldLabel = tool.inputType === 'url' ? 'URL'
    : tool.inputType === 'ip' ? 'IP Address'
    : tool.inputType === 'cidr' ? 'CIDR Block'
    : tool.slug === 'asn-lookup' ? 'IP Address or ASN'
    : 'Domain'
  const isMonoField = tool.inputType === 'ip' || tool.inputType === 'cidr' || tool.slug === 'asn-lookup'

  return (
    <form onSubmit={handleSubmit}>
      <div className="flex flex-col gap-1.5 mb-4">
        <label className="text-sm font-medium text-foreground" htmlFor="tool-input">
          {fieldLabel}
        </label>
        <Input
          id="tool-input"
          data-testid="tool-input"
          type="text"
          placeholder={tool.inputPlaceholder}
          value={value}
          onChange={(e) => { setValue(e.target.value); setValidationError(null) }}
          className={`max-w-lg ${isMonoField ? 'font-mono' : ''} ${validationError ? 'border-destructive focus-visible:ring-destructive' : ''}`}
          disabled={loading}
          autoComplete="off"
          spellCheck={false}
        />
        {validationError && (
          <p className="text-sm text-destructive" data-testid="input-error">{validationError}</p>
        )}
      </div>

      <Button type="submit" disabled={loading} data-testid="submit-btn" className="cursor-pointer">
        {loading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" strokeWidth={1.5} /> : <Search className="h-4 w-4 mr-2" strokeWidth={1.5} />}
        {loading ? 'Running...' : 'Run'}
      </Button>
    </form>
  )
}
