import { NextRequest } from 'next/server'
import { httpHeadersSchema } from '@/lib/validators'

export const runtime = 'nodejs'

const HEADER_INFO: Record<string, { description: string; securityNote?: string; grade?: (val: string) => 'good' | 'warning' | 'danger' | 'info' }> = {
  'content-security-policy': {
    description: 'Restricts which resources (scripts, images, etc.) the browser can load.',
    securityNote: 'A well-configured CSP significantly reduces XSS attack surface.',
    grade: () => 'good',
  },
  'strict-transport-security': {
    description: 'Forces the browser to use HTTPS for future visits.',
    securityNote: 'Should include max-age of at least 31536000 (1 year) and includeSubDomains.',
    grade: (val) => val.includes('max-age=3153') || val.includes('max-age=6307') ? 'good' : 'warning',
  },
  'x-frame-options': {
    description: 'Prevents the page from being embedded in iframes (clickjacking protection).',
    grade: (val) => val === 'DENY' ? 'good' : 'warning',
  },
  'x-content-type-options': {
    description: 'Prevents browsers from MIME-sniffing the content type.',
    grade: (val) => val === 'nosniff' ? 'good' : 'warning',
  },
  'referrer-policy': {
    description: 'Controls how much referrer information is included with requests.',
    grade: (val) => ['no-referrer', 'strict-origin', 'strict-origin-when-cross-origin'].includes(val) ? 'good' : 'info',
  },
  'permissions-policy': {
    description: 'Controls which browser features and APIs can be used.',
    grade: () => 'good',
  },
  'cache-control': { description: 'Directives for caching mechanisms in both requests and responses.' },
  'content-type': { description: 'Indicates the media type of the resource.' },
  'server': { description: 'Contains information about the server software.' },
  'x-powered-by': {
    description: 'Reveals the technology behind the server.',
    securityNote: 'Consider removing this header to avoid fingerprinting.',
    grade: () => 'warning',
  },
  'etag': { description: 'An identifier for a specific version of a resource.' },
  'last-modified': { description: 'The date the resource was last modified.' },
  'access-control-allow-origin': { description: 'Specifies which origins can access the resource (CORS).' },
  'set-cookie': { description: 'Sets a cookie on the client.' },
  'link': { description: 'Allows the server to hint at resources for preloading.' },
}

const MISSING_SECURITY_HEADERS = [
  'content-security-policy',
  'strict-transport-security',
  'x-frame-options',
  'x-content-type-options',
  'referrer-policy',
]

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const parsed = httpHeadersSchema.safeParse(body)
    if (!parsed.success) {
      return Response.json({ success: false, error: parsed.error.issues[0].message }, { status: 400 })
    }
    const { url } = parsed.data

    const res = await fetch(url, {
      redirect: 'follow',
      signal: AbortSignal.timeout(10000),
      headers: { 'User-Agent': 'NetworkTools/1.0' },
    })

    const headers: { name: string; value: string; description?: string; securityNote?: string; grade?: string }[] = []
    res.headers.forEach((value, name) => {
      const info = HEADER_INFO[name.toLowerCase()]
      headers.push({
        name,
        value,
        description: info?.description,
        securityNote: info?.securityNote,
        grade: info?.grade ? info.grade(value) : 'info',
      })
    })

    // Check for missing security headers
    const presentHeaderNames = new Set(headers.map((h) => h.name.toLowerCase()))
    const missingSecurityHeaders = MISSING_SECURITY_HEADERS.filter((h) => !presentHeaderNames.has(h))

    const score = MISSING_SECURITY_HEADERS.length - missingSecurityHeaders.length
    const maxScore = MISSING_SECURITY_HEADERS.length

    return Response.json({
      success: true,
      data: {
        url,
        statusCode: res.status,
        headers: headers.sort((a, b) => a.name.localeCompare(b.name)),
        securityScore: { score, maxScore, grade: score >= 4 ? 'A' : score >= 3 ? 'B' : score >= 2 ? 'C' : 'F' },
        missingSecurityHeaders,
      },
    })
  } catch (err) {
    return Response.json(
      { success: false, error: err instanceof Error ? err.message : 'Header inspection failed' },
      { status: 500 }
    )
  }
}
