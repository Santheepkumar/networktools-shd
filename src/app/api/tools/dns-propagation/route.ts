import { NextRequest } from 'next/server'
import { dnsPropagationSchema } from '@/lib/validators'

export const runtime = 'nodejs'

const RESOLVERS = [
  { name: 'Cloudflare', ip: '1.1.1.1', url: 'https://cloudflare-dns.com/dns-query', location: 'Global' },
  { name: 'Google', ip: '8.8.8.8', url: 'https://dns.google/resolve', location: 'Global' },
  { name: 'OpenDNS', ip: '208.67.222.222', url: 'https://doh.opendns.com/dns-query', location: 'US' },
  { name: 'Quad9', ip: '9.9.9.9', url: 'https://dns.quad9.net/dns-query', location: 'Global' },
  { name: 'AdGuard', ip: '94.140.14.14', url: 'https://dns.adguard-dns.com/dns-query', location: 'Global' },
]

async function queryResolver(resolver: typeof RESOLVERS[0], domain: string, type: string) {
  const start = Date.now()
  try {
    const url = resolver.url.includes('google')
      ? `${resolver.url}?name=${encodeURIComponent(domain)}&type=${encodeURIComponent(type)}`
      : `${resolver.url}?name=${encodeURIComponent(domain)}&type=${encodeURIComponent(type)}`
    const res = await fetch(url, {
      headers: { Accept: 'application/dns-json' },
      signal: AbortSignal.timeout(5000),
    })
    const data = await res.json()
    const latencyMs = Date.now() - start
    const answers = (data.Answer || []).map((a: Record<string, unknown>) => ({
      value: String(a.data).replace(/^"|"$/g, ''),
      ttl: a.TTL,
    }))
    return { ...resolver, latencyMs, answers, status: 'ok' as const }
  } catch {
    return { ...resolver, latencyMs: Date.now() - start, answers: [], status: 'error' as const }
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const parsed = dnsPropagationSchema.safeParse(body)
    if (!parsed.success) {
      return Response.json({ success: false, error: parsed.error.issues[0].message }, { status: 400 })
    }
    const { domain, recordType } = parsed.data

    const results = await Promise.all(
      RESOLVERS.map((r) => queryResolver(r, domain, recordType))
    )

    const answersSet = new Set(results.flatMap((r) => r.answers.map((a: any) => a.value)))
    const propagated = results.filter((r) => r.status === 'ok' && r.answers.length > 0).length

    return Response.json({
      success: true,
      data: results.map((r) => ({
        name: r.name,
        ip: r.ip,
        location: r.location,
        latencyMs: r.latencyMs,
        answers: r.answers,
        status: r.status,
        propagated: r.answers.length > 0,
      })),
    })
  } catch (err) {
    return Response.json(
      { success: false, error: err instanceof Error ? err.message : 'Propagation check failed' },
      { status: 500 }
    )
  }
}
