import { NextRequest } from 'next/server'
import { dkimCheckerSchema } from '@/lib/validators'

export const runtime = 'nodejs'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const parsed = dkimCheckerSchema.safeParse(body)
    if (!parsed.success) {
      return Response.json({ success: false, error: parsed.error.issues[0].message }, { status: 400 })
    }
    const { domain, selector } = parsed.data
    const dkimHost = `${selector}._domainkey.${domain}`

    const res = await fetch(
      `https://cloudflare-dns.com/dns-query?name=${encodeURIComponent(dkimHost)}&type=TXT`,
      { headers: { Accept: 'application/dns-json' } }
    )
    const dohData = await res.json()

    const txtRecords: string[] = []
    if (dohData.Answer) {
      for (const ans of dohData.Answer) {
        txtRecords.push(String(ans.data).replace(/^"|"$/g, ''))
      }
    }

    const dkimRecord = txtRecords.find((r) => r.includes('v=DKIM1') || r.includes('p='))

    if (!dkimRecord) {
      return Response.json({
        success: true,
        data: {
          domain, selector, dkimHost,
          found: false, record: null,
          publicKey: null, keyType: null, hashAlgorithm: null,
          warnings: [`No DKIM record found at ${dkimHost}`],
        },
      })
    }

    const tags: Record<string, string> = {}
    for (const part of dkimRecord.split(';')) {
      const [k, ...v] = part.trim().split('=')
      if (k && v.length) tags[k.trim()] = v.join('=').trim()
    }

    const warnings: string[] = []
    if (!tags.p) warnings.push('Public key (p=) not found in record')
    if (tags.p === '') warnings.push('Public key is revoked (empty p= tag)')

    return Response.json({
      success: true,
      data: {
        domain, selector, dkimHost,
        found: true, record: dkimRecord,
        version: tags.v || 'DKIM1',
        keyType: tags.k || 'rsa',
        hashAlgorithm: tags.h || 'sha256',
        publicKey: tags.p ? `${tags.p.substring(0, 40)}...` : null,
        serviceType: tags.s || '*',
        warnings,
      },
    })
  } catch (err) {
    return Response.json(
      { success: false, error: err instanceof Error ? err.message : 'DKIM check failed' },
      { status: 500 }
    )
  }
}
