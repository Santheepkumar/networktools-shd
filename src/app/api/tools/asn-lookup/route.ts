import { NextRequest } from 'next/server'
import { asnLookupSchema } from '@/lib/validators'

export const runtime = 'nodejs'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const parsed = asnLookupSchema.safeParse(body)
    if (!parsed.success) {
      return Response.json({ success: false, error: parsed.error.issues[0].message }, { status: 400 })
    }
    const { query } = parsed.data

    // Determine if it's an ASN or IP query
    const isAsn = /^AS\d+$/i.test(query.trim())
    const endpoint = isAsn
      ? `https://api.bgpview.io/asn/${query.replace(/^AS/i, '')}`
      : `http://ip-api.com/json/${query}?fields=status,as,org,isp,country,countryCode,city,query`

    if (isAsn) {
      const res = await fetch(endpoint, { signal: AbortSignal.timeout(8000) })
      const data = await res.json()
      if (!data.data) {
        return Response.json({ success: false, error: 'ASN not found' }, { status: 404 })
      }
      const asn = data.data
      return Response.json({
        success: true,
        data: {
          asn: `AS${asn.asn}`,
          name: asn.name,
          description: asn.description_short || asn.description_full?.[0],
          country: asn.country_code,
          website: asn.website,
          emailContacts: asn.email_contacts,
          prefixCount: asn.prefixes_count,
          prefixCountV6: asn.prefixes_count_v6,
          type: asn.type,
        },
      })
    } else {
      const res = await fetch(endpoint, { signal: AbortSignal.timeout(8000) })
      const data = await res.json()
      if (data.status === 'fail') {
        return Response.json({ success: false, error: 'IP lookup failed' }, { status: 400 })
      }
      return Response.json({
        success: true,
        data: {
          ip: data.query,
          asn: data.as?.split(' ')[0],
          asnName: data.as?.split(' ').slice(1).join(' '),
          org: data.org,
          isp: data.isp,
          country: data.country,
          countryCode: data.countryCode,
          city: data.city,
        },
      })
    }
  } catch (err) {
    return Response.json(
      { success: false, error: err instanceof Error ? err.message : 'ASN lookup failed' },
      { status: 500 }
    )
  }
}
