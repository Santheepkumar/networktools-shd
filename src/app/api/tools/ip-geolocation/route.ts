import { NextRequest } from 'next/server'
import { ipGeoSchema } from '@/lib/validators'

export const runtime = 'nodejs'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const parsed = ipGeoSchema.safeParse(body)
    if (!parsed.success) {
      return Response.json({ success: false, error: parsed.error.issues[0].message }, { status: 400 })
    }
    const { ip } = parsed.data

    const res = await fetch(`http://ip-api.com/json/${ip}?fields=status,message,country,countryCode,region,regionName,city,zip,lat,lon,timezone,isp,org,as,query`, {
      signal: AbortSignal.timeout(8000),
    })
    const data = await res.json()

    if (data.status === 'fail') {
      return Response.json({ success: false, error: data.message || 'IP lookup failed' }, { status: 400 })
    }

    return Response.json({
      success: true,
      data: {
        ip: data.query,
        city: data.city,
        region: data.regionName,
        regionCode: data.region,
        country: data.country,
        countryCode: data.countryCode,
        postalCode: data.zip,
        lat: data.lat,
        lon: data.lon,
        timezone: data.timezone,
        isp: data.isp,
        org: data.org,
        asn: data.as,
      },
    })
  } catch (err) {
    return Response.json(
      { success: false, error: err instanceof Error ? err.message : 'IP geolocation failed' },
      { status: 500 }
    )
  }
}
