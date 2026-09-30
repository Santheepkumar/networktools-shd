import { NextRequest } from 'next/server'
import net from 'node:net'
import dns from 'node:dns/promises'
import { portCheckerSchema } from '@/lib/validators'

export const runtime = 'nodejs'

const PORT_SERVICES: Record<number, string> = {
  21: 'FTP', 22: 'SSH', 23: 'Telnet', 25: 'SMTP',
  53: 'DNS', 80: 'HTTP', 110: 'POP3', 143: 'IMAP',
  443: 'HTTPS', 465: 'SMTPS', 587: 'SMTP (Submission)',
  993: 'IMAPS', 995: 'POP3S', 3306: 'MySQL',
  5432: 'PostgreSQL', 6379: 'Redis', 8080: 'HTTP Alt',
  8443: 'HTTPS Alt', 27017: 'MongoDB',
}

const DEFAULT_PORTS = [21, 22, 25, 53, 80, 110, 143, 443, 465, 587, 993, 995, 3306, 5432, 6379, 8080, 8443]

function checkPort(host: string, port: number, timeout = 3000): Promise<{ port: number; isOpen: boolean; latencyMs: number; service: string }> {
  return new Promise((resolve) => {
    const start = Date.now()
    const socket = new net.Socket()
    socket.setTimeout(timeout)
    socket.connect(port, host, () => {
      const latencyMs = Date.now() - start
      socket.destroy()
      resolve({ port, isOpen: true, latencyMs, service: PORT_SERVICES[port] || 'Unknown' })
    })
    socket.on('timeout', () => {
      socket.destroy()
      resolve({ port, isOpen: false, latencyMs: timeout, service: PORT_SERVICES[port] || 'Unknown' })
    })
    socket.on('error', () => {
      socket.destroy()
      resolve({ port, isOpen: false, latencyMs: Date.now() - start, service: PORT_SERVICES[port] || 'Unknown' })
    })
  })
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const parsed = portCheckerSchema.safeParse(body)
    if (!parsed.success) {
      return Response.json({ success: false, error: parsed.error.issues[0].message }, { status: 400 })
    }
    const { host, ports } = parsed.data
    const portsToCheck = (ports && ports.length > 0 ? ports : DEFAULT_PORTS).slice(0, 30)

    // Resolve hostname
    let ip = host
    try {
      const addresses = await dns.resolve4(host)
      if (addresses.length > 0) ip = addresses[0]
    } catch {}

    // Check ports concurrently with limit
    const { default: pLimit } = await import('p-limit')
    const limit = pLimit(10)
    const results = await Promise.all(
      portsToCheck.map((port) => limit(() => checkPort(ip, port)))
    )

    results.sort((a, b) => a.port - b.port)
    const openCount = results.filter((r) => r.isOpen).length

    return Response.json({
      success: true,
      data: {
        host, ip,
        results,
        summary: {
          total: results.length,
          open: openCount,
          closed: results.length - openCount,
        },
      },
    })
  } catch (err) {
    return Response.json(
      { success: false, error: err instanceof Error ? err.message : 'Port check failed' },
      { status: 500 }
    )
  }
}
