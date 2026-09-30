import { NextRequest } from 'next/server'

export const runtime = 'nodejs'

export async function GET(request: NextRequest) {
  try {
    const forwarded = request.headers.get('x-forwarded-for')
    const realIp = request.headers.get('x-real-ip')
    const ip = forwarded ? forwarded.split(',')[0].trim() : realIp || '127.0.0.1'

    // Get geolocation
    let geo = null
    try {
      const geoRes = await fetch(`http://ip-api.com/json/${ip}?fields=status,country,countryCode,regionName,city,isp,org,as,lat,lon,timezone`, {
        signal: AbortSignal.timeout(5000),
      })
      const geoData = await geoRes.json()
      if (geoData.status === 'success') geo = geoData
    } catch {}

    // Get DNS resolver
    let dnsResolver = null
    try {
      const dnsRes = await fetch('https://cloudflare-dns.com/dns-query?name=whoami.cloudflare&type=TXT&ct=application/dns-json', {
        headers: { Accept: 'application/dns-json' },
        signal: AbortSignal.timeout(3000),
      })
      const dnsData = await dnsRes.json()
      if (dnsData.Answer?.[0]?.data) {
        dnsResolver = String(dnsData.Answer[0].data).replace(/^"|"$/g, '')
      }
    } catch {}

    // Extract interesting request headers
    const headers: Record<string, string> = {}
    const interestingHeaders = [
      'user-agent', 'accept-language', 'accept-encoding',
      'x-forwarded-for', 'x-real-ip', 'cf-ipcountry',
      'host', 'accept',
    ]
    interestingHeaders.forEach((h) => {
      const val = request.headers.get(h)
      if (val) headers[h] = val
    })

    return Response.json({
      success: true,
      data: {
        ip,
        dnsResolver,
        location: geo ? {
          city: geo.city,
          region: geo.regionName,
          country: geo.country,
          countryCode: geo.countryCode,
          lat: geo.lat,
          lon: geo.lon,
          timezone: geo.timezone,
        } : null,
        isp: geo?.isp,
        org: geo?.org,
        asn: geo?.as,
        requestHeaders: headers,
        tlsVersion: request.headers.get('x-forwarded-proto') === 'https' ? 'HTTPS' : 'HTTP',
      },
    })
  } catch (err) {
    return Response.json(
      { success: false, error: err instanceof Error ? err.message : 'Detection failed' },
      { status: 500 }
    )
  }
}
