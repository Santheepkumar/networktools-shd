'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Loader2, Search } from 'lucide-react'
import { type ToolDefinition } from '@/lib/tools-registry'

const COMMON_PORT_PRESETS: { label: string; ports: number[] }[] = [
  { label: 'Web', ports: [80, 443, 8080, 8443] },
  { label: 'Email', ports: [25, 465, 587, 993, 995, 110, 143] },
  { label: 'SSH/FTP', ports: [22, 21] },
  { label: 'Database', ports: [3306, 5432, 6379, 27017] },
  { label: 'DNS', ports: [53] },
]

interface PortCheckerFormProps {
  tool: ToolDefinition
  loading: boolean
  setLoading: (v: boolean) => void
  onResult: (data: unknown) => void
  onError: (err: string) => void
}

export function PortCheckerForm({ tool, loading, setLoading, onResult, onError }: PortCheckerFormProps) {
  const [host, setHost] = useState('')
  const [customPort, setCustomPort] = useState('')
  const [selectedPorts, setSelectedPorts] = useState<Set<number>>(new Set([80, 443, 22, 25]))
  const [hostError, setHostError] = useState<string | null>(null)

  const togglePort = (port: number) => {
    setSelectedPorts((prev) => {
      const next = new Set(prev)
      if (next.has(port)) next.delete(port)
      else next.add(port)
      return next
    })
  }

  const addCustomPort = () => {
    const port = parseInt(customPort.trim())
    if (!isNaN(port) && port >= 1 && port <= 65535) {
      setSelectedPorts((prev) => new Set(prev).add(port))
      setCustomPort('')
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const trimmedHost = host.trim()
    if (!trimmedHost) { setHostError('Host is required'); return }
    const domainRe = /^(?:[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?\.)+[a-zA-Z]{2,}$/
    const ipRe = /^(?:(?:25[0-5]|2[0-4]\d|[01]?\d\d?)\.){3}(?:25[0-5]|2[0-4]\d|[01]?\d\d?)$/
    if (!domainRe.test(trimmedHost) && !ipRe.test(trimmedHost)) {
      setHostError('Enter a valid hostname or IP address')
      return
    }
    if (selectedPorts.size === 0) { onError('Select at least one port'); return }
    setHostError(null)
    setLoading(true)
    try {
      const res = await fetch(tool.apiEndpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ host: trimmedHost, ports: Array.from(selectedPorts).sort((a, b) => a - b) }),
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
      <div className="flex flex-col gap-1.5 mb-5">
        <label className="text-sm font-medium text-foreground" htmlFor="port-host">Host</label>
        <Input
          id="port-host"
          data-testid="host-input"
          placeholder="example.com or 8.8.8.8"
          value={host}
          onChange={(e) => { setHost(e.target.value); setHostError(null) }}
          className={`max-w-lg font-mono ${hostError ? 'border-destructive' : ''}`}
          disabled={loading}
          autoComplete="off"
          spellCheck={false}
        />
        {hostError && <p className="text-sm text-destructive" data-testid="input-error">{hostError}</p>}
      </div>

      <div className="flex flex-col gap-3 mb-5">
        <label className="text-sm font-medium text-foreground">Ports to check</label>
        {COMMON_PORT_PRESETS.map((preset) => (
          <div key={preset.label} className="flex items-center gap-2 flex-wrap">
            <span className="text-xs text-muted-foreground w-14 flex-shrink-0">{preset.label}</span>
            {preset.ports.map((port) => (
              <button
                key={port}
                type="button"
                onClick={() => togglePort(port)}
                data-testid={`port-toggle-${port}`}
                className={`
                  font-mono text-xs px-2.5 py-1 rounded-lg border transition-colors cursor-pointer
                  ${selectedPorts.has(port)
                    ? 'bg-primary text-primary-foreground border-primary'
                    : 'bg-muted text-muted-foreground border-border hover:border-primary/50'
                  }
                `}
              >
                {port}
              </button>
            ))}
          </div>
        ))}

        <div className="flex items-center gap-2 mt-1">
          <Input
            placeholder="Custom port (1-65535)"
            value={customPort}
            onChange={(e) => setCustomPort(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addCustomPort() } }}
            data-testid="custom-port-input"
            className="font-mono max-w-[180px] text-sm"
            disabled={loading}
          />
          <Button type="button" variant="outline" size="sm" onClick={addCustomPort} data-testid="add-port-btn" className="cursor-pointer">
            Add
          </Button>
        </div>
      </div>

      <Button type="submit" disabled={loading || selectedPorts.size === 0} data-testid="submit-btn" className="cursor-pointer">
        {loading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" strokeWidth={1.5} /> : <Search className="h-4 w-4 mr-2" strokeWidth={1.5} />}
        {loading ? `Checking ${selectedPorts.size} ports...` : `Check ${selectedPorts.size} Port${selectedPorts.size !== 1 ? 's' : ''}`}
      </Button>
    </form>
  )
}
