import { NextRequest } from 'next/server'
import dns from 'node:dns/promises'
import { dnsLookupSchema } from '@/lib/validators'

export const runtime = 'nodejs'

const DOH_URL = 'https://cloudflare-dns.com/dns-query'

async function lookupViaDoh(name: string, type: string) {
  const url = `${DOH_URL}?name=${encodeURIComponent(name)}&type=${encodeURIComponent(type)}`
  const res = await fetch(url, { headers: { Accept: 'application/dns-json' } })
  if (!res.ok) throw new Error('DoH query failed')
  const data = await res.json()
  return data
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const parsed = dnsLookupSchema.safeParse(body)
    if (!parsed.success) {
      return Response.json({ success: false, error: parsed.error.issues[0].message }, { status: 400 })
    }
    const { domain, recordType } = parsed.data
    const records: { type: string; value: string; ttl?: number; priority?: number }[] = []

    if (recordType === 'ANY') {
      // Query multiple types
      const types = ['A', 'AAAA', 'CNAME', 'MX', 'TXT', 'NS', 'SOA']
      await Promise.allSettled(
        types.map(async (t) => {
          try {
            const dohData = await lookupViaDoh(domain, t)
            if (dohData.Answer) {
              for (const ans of dohData.Answer) {
                records.push({
                  type: t,
                  value: String(ans.data).replace(/"(.*)"/, '$1'),
                  ttl: ans.TTL,
                })
              }
            }
          } catch {}
        })
      )
    } else if (recordType === 'MX') {
      const dohData = await lookupViaDoh(domain, 'MX')
      if (dohData.Answer) {
        for (const ans of dohData.Answer) {
          const parts = String(ans.data).split(' ')
          records.push({
            type: 'MX',
            value: parts.slice(1).join(' '),
            ttl: ans.TTL,
            priority: parseInt(parts[0]) || undefined,
          })
        }
      }
    } else if (recordType === 'TXT') {
      const dohData = await lookupViaDoh(domain, 'TXT')
      if (dohData.Answer) {
        for (const ans of dohData.Answer) {
          records.push({
            type: 'TXT',
            value: String(ans.data).replace(/^"|"$/g, ''),
            ttl: ans.TTL,
          })
        }
      }
    } else if (recordType === 'A') {
      const dohData = await lookupViaDoh(domain, 'A')
      if (dohData.Answer) {
        for (const ans of dohData.Answer) {
          records.push({ type: 'A', value: String(ans.data), ttl: ans.TTL })
        }
      }
    } else if (recordType === 'AAAA') {
      const dohData = await lookupViaDoh(domain, 'AAAA')
      if (dohData.Answer) {
        for (const ans of dohData.Answer) {
          records.push({ type: 'AAAA', value: String(ans.data), ttl: ans.TTL })
        }
      }
    } else if (recordType === 'NS') {
      const dohData = await lookupViaDoh(domain, 'NS')
      if (dohData.Answer) {
        for (const ans of dohData.Answer) {
          records.push({ type: 'NS', value: String(ans.data).replace(/\.$/, ''), ttl: ans.TTL })
        }
      }
    } else if (recordType === 'CNAME') {
      const dohData = await lookupViaDoh(domain, 'CNAME')
      if (dohData.Answer) {
        for (const ans of dohData.Answer) {
          records.push({ type: 'CNAME', value: String(ans.data).replace(/\.$/, ''), ttl: ans.TTL })
        }
      }
    } else if (recordType === 'SOA') {
      const dohData = await lookupViaDoh(domain, 'SOA')
      if (dohData.Answer) {
        for (const ans of dohData.Answer) {
          records.push({ type: 'SOA', value: String(ans.data), ttl: ans.TTL })
        }
      }
    } else if (recordType === 'CAA') {
      const dohData = await lookupViaDoh(domain, 'CAA')
      if (dohData.Answer) {
        for (const ans of dohData.Answer) {
          records.push({ type: 'CAA', value: String(ans.data), ttl: ans.TTL })
        }
      }
    }

    return Response.json({ success: true, data: records })
  } catch (err) {
    return Response.json(
      { success: false, error: err instanceof Error ? err.message : 'DNS lookup failed' },
      { status: 500 }
    )
  }
}
