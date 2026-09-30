import { NextRequest } from 'next/server'
import { httpRedirectsSchema } from '@/lib/validators'

export const runtime = 'nodejs'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const parsed = httpRedirectsSchema.safeParse(body)
    if (!parsed.success) {
      return Response.json({ success: false, error: parsed.error.issues[0].message }, { status: 400 })
    }
    const { url } = parsed.data

    const hops: { url: string; statusCode: number; statusText: string; location?: string; responseTimeMs: number }[] = []
    let currentUrl = url
    const maxRedirects = 15

    for (let i = 0; i < maxRedirects; i++) {
      const start = Date.now()
      try {
        const res = await fetch(currentUrl, {
          redirect: 'manual',
          signal: AbortSignal.timeout(8000),
          headers: { 'User-Agent': 'NetworkTools/1.0' },
        })
        const responseTimeMs = Date.now() - start
        const location = res.headers.get('location')
        hops.push({
          url: currentUrl,
          statusCode: res.status,
          statusText: res.statusText,
          location: location || undefined,
          responseTimeMs,
        })

        if (res.status >= 200 && res.status < 300) break
        if (res.status >= 300 && res.status < 400 && location) {
          // Handle relative redirects
          currentUrl = location.startsWith('http') ? location : new URL(location, currentUrl).toString()
        } else {
          break
        }
      } catch (err) {
        hops.push({
          url: currentUrl,
          statusCode: 0,
          statusText: err instanceof Error ? err.message : 'Connection failed',
          responseTimeMs: Date.now() - start,
        })
        break
      }
    }

    return Response.json({ success: true, data: hops })
  } catch (err) {
    return Response.json(
      { success: false, error: err instanceof Error ? err.message : 'Redirect trace failed' },
      { status: 500 }
    )
  }
}
