import { NextRequest } from 'next/server'
import { spfCheckerSchema } from '@/lib/validators'

export const runtime = 'nodejs'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const parsed = spfCheckerSchema.safeParse(body)
    if (!parsed.success) {
      return Response.json({ success: false, error: parsed.error.issues[0].message }, { status: 400 })
    }
    const { domain } = parsed.data

    const res = await fetch(
      `https://cloudflare-dns.com/dns-query?name=${encodeURIComponent(domain)}&type=TXT`,
      { headers: { Accept: 'application/dns-json' } }
    )
    const dohData = await res.json()

    const txtRecords: string[] = []
    if (dohData.Answer) {
      for (const ans of dohData.Answer) {
        const val = String(ans.data).replace(/^"|"$/g, '')
        txtRecords.push(val)
      }
    }

    const spfRecord = txtRecords.find((r) => r.startsWith('v=spf1'))

    if (!spfRecord) {
      return Response.json({
        success: true,
        data: {
          domain,
          hasSpf: false,
          record: null,
          valid: false,
          mechanisms: [],
          qualifiers: [],
          all: null,
          warnings: ['No SPF record found for this domain'],
        },
      })
    }

    // Parse SPF record
    const parts = spfRecord.split(/\s+/)
    const mechanisms: string[] = []
    const warnings: string[] = []
    let all: string | null = null

    for (const part of parts.slice(1)) {
      if (part.startsWith('all') || part.endsWith('all')) {
        all = part
        if (part === '+all') warnings.push('⚠️ +all allows any sender — this is a security risk')
        if (part === '?all') warnings.push('?all is neutral — SPF provides no protection')
      } else {
        mechanisms.push(part)
      }
    }

    if (mechanisms.length > 10) {
      warnings.push('SPF record has more than 10 DNS lookups — may exceed the limit')
    }

    return Response.json({
      success: true,
      data: {
        domain,
        hasSpf: true,
        record: spfRecord,
        valid: true,
        mechanisms,
        all,
        warnings,
        lookupCount: mechanisms.filter((m) => m.startsWith('include:') || m.startsWith('a') || m.startsWith('mx')).length,
      },
    })
  } catch (err) {
    return Response.json(
      { success: false, error: err instanceof Error ? err.message : 'SPF check failed' },
      { status: 500 }
    )
  }
}
