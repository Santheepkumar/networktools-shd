import { NextRequest } from 'next/server'
import { whoisSchema } from '@/lib/validators'

export const runtime = 'nodejs'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const parsed = whoisSchema.safeParse(body)
    if (!parsed.success) {
      return Response.json({ success: false, error: parsed.error.issues[0].message }, { status: 400 })
    }
    const { domain } = parsed.data

    // whoiser exports named functions — use whoisDomain directly
    const { whoisDomain } = await import('whoiser')
    const result = await whoisDomain(domain, { timeout: 10000, raw: false })

    // Normalize the result - whoiser returns an object keyed by whois server
    const firstServer = Object.values(result)[0] as Record<string, unknown> | undefined
    if (!firstServer) {
      return Response.json({ success: false, error: 'No WHOIS data found' }, { status: 404 })
    }

    const getField = (obj: Record<string, unknown>, ...keys: string[]): string | undefined => {
      for (const key of keys) {
        const val = obj[key]
        if (val) return Array.isArray(val) ? String(val[0]) : String(val)
      }
      return undefined
    }

    const normalized = {
      domain: domain.toLowerCase(),
      registrar: getField(firstServer, 'Registrar', 'registrar'),
      registrarUrl: getField(firstServer, 'Registrar URL', 'registrar url'),
      createdDate: getField(firstServer, 'Created Date', 'creation date', 'Domain Registration Date'),
      updatedDate: getField(firstServer, 'Updated Date', 'updated date'),
      expiresDate: getField(firstServer, 'Registrar Registration Expiration Date', 'expiry date', 'Registry Expiry Date'),
      status: (() => {
        const s = firstServer['Domain Status'] || firstServer['status']
        if (!s) return []
        return Array.isArray(s) ? s.map(String) : [String(s)]
      })(),
      nameServers: (() => {
        const ns = firstServer['Name Server'] || firstServer['name server']
        if (!ns) return []
        return (Array.isArray(ns) ? ns : [ns]).map((n: unknown) => String(n).toLowerCase())
      })(),
      dnssec: getField(firstServer, 'DNSSEC', 'dnssec'),
      abuse: getField(firstServer, 'Registrar Abuse Contact Email'),
    }

    return Response.json({ success: true, data: normalized })
  } catch (err) {
    return Response.json(
      { success: false, error: err instanceof Error ? err.message : 'WHOIS lookup failed' },
      { status: 500 }
    )
  }
}
