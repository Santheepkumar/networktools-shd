import { NextRequest } from 'next/server'
import { dmarcCheckerSchema } from '@/lib/validators'

export const runtime = 'nodejs'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const parsed = dmarcCheckerSchema.safeParse(body)
    if (!parsed.success) {
      return Response.json({ success: false, error: parsed.error.issues[0].message }, { status: 400 })
    }
    const { domain } = parsed.data
    const dmarcHost = `_dmarc.${domain}`

    const res = await fetch(
      `https://cloudflare-dns.com/dns-query?name=${encodeURIComponent(dmarcHost)}&type=TXT`,
      { headers: { Accept: 'application/dns-json' } }
    )
    const dohData = await res.json()

    const txtRecords: string[] = []
    if (dohData.Answer) {
      for (const ans of dohData.Answer) {
        txtRecords.push(String(ans.data).replace(/^"|"$/g, ''))
      }
    }

    const dmarcRecord = txtRecords.find((r) => r.startsWith('v=DMARC1'))

    if (!dmarcRecord) {
      return Response.json({
        success: true,
        data: {
          domain, dmarcHost,
          hasDmarc: false, record: null,
          policy: null, subdomainPolicy: null,
          percentage: null, reportEmail: null, forensicEmail: null,
          alignment: { spf: null, dkim: null },
          warnings: ['No DMARC record found. Your domain is not protected against email spoofing.'],
        },
      })
    }

    const tags: Record<string, string> = {}
    for (const part of dmarcRecord.split(';')) {
      const [k, ...v] = part.trim().split('=')
      if (k && v.length) tags[k.trim()] = v.join('=').trim()
    }

    const warnings: string[] = []
    const policy = tags.p || 'none'
    if (policy === 'none') warnings.push('Policy is "none" — emails failing DMARC are not rejected')
    const pct = parseInt(tags.pct || '100')
    if (pct < 100) warnings.push(`Only ${pct}% of emails are subject to DMARC policy`)

    return Response.json({
      success: true,
      data: {
        domain, dmarcHost,
        hasDmarc: true, record: dmarcRecord,
        policy,
        subdomainPolicy: tags.sp || policy,
        percentage: pct,
        reportEmail: tags.rua ? tags.rua.replace('mailto:', '') : null,
        forensicEmail: tags.ruf ? tags.ruf.replace('mailto:', '') : null,
        alignment: {
          spf: tags.aspf || 'r',
          dkim: tags.adkim || 'r',
        },
        failureOptions: tags.fo || '0',
        warnings,
      },
    })
  } catch (err) {
    return Response.json(
      { success: false, error: err instanceof Error ? err.message : 'DMARC check failed' },
      { status: 500 }
    )
  }
}
