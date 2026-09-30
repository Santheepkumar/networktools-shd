import { NextRequest } from 'next/server'
import { mxLookupSchema } from '@/lib/validators'

export const runtime = 'nodejs'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const parsed = mxLookupSchema.safeParse(body)
    if (!parsed.success) {
      return Response.json({ success: false, error: parsed.error.issues[0].message }, { status: 400 })
    }
    const { domain } = parsed.data

    const res = await fetch(
      `https://cloudflare-dns.com/dns-query?name=${encodeURIComponent(domain)}&type=MX`,
      { headers: { Accept: 'application/dns-json' } }
    )
    const dohData = await res.json()

    const records: { type: string; value: string; priority: number; ttl: number }[] = []
    if (dohData.Answer) {
      for (const ans of dohData.Answer) {
        const parts = String(ans.data).split(' ')
        records.push({
          type: 'MX',
          priority: parseInt(parts[0]) || 0,
          value: parts.slice(1).join(' ').replace(/\.$/, ''),
          ttl: ans.TTL,
        })
      }
      records.sort((a, b) => a.priority - b.priority)
    }

    return Response.json({ success: true, data: records })
  } catch (err) {
    return Response.json(
      { success: false, error: err instanceof Error ? err.message : 'MX lookup failed' },
      { status: 500 }
    )
  }
}
