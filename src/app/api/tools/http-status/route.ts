import { NextRequest } from 'next/server'
import { httpStatusSchema } from '@/lib/validators'

export const runtime = 'nodejs'

const HTTP_STATUS_DESCRIPTIONS: Record<number, string> = {
  200: 'OK', 201: 'Created', 204: 'No Content', 301: 'Moved Permanently',
  302: 'Found', 304: 'Not Modified', 400: 'Bad Request', 401: 'Unauthorized',
  403: 'Forbidden', 404: 'Not Found', 405: 'Method Not Allowed',
  429: 'Too Many Requests', 500: 'Internal Server Error',
  502: 'Bad Gateway', 503: 'Service Unavailable', 504: 'Gateway Timeout',
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const parsed = httpStatusSchema.safeParse(body)
    if (!parsed.success) {
      return Response.json({ success: false, error: parsed.error.issues[0].message }, { status: 400 })
    }
    const { url } = parsed.data
    const start = Date.now()

    const res = await fetch(url, {
      method: 'HEAD',
      redirect: 'manual',
      signal: AbortSignal.timeout(10000),
      headers: { 'User-Agent': 'NetworkTools/1.0 (https://network-tools.dev)' },
    })

    const responseTimeMs = Date.now() - start
    const statusCode = res.status
    const statusText = res.statusText || HTTP_STATUS_DESCRIPTIONS[statusCode] || 'Unknown'
    const contentType = res.headers.get('content-type')
    const server = res.headers.get('server')
    const location = res.headers.get('location')

    const statusCategory = Math.floor(statusCode / 100)
    const categoryLabel = { 1: 'Informational', 2: 'Success', 3: 'Redirect', 4: 'Client Error', 5: 'Server Error' }[statusCategory] || 'Unknown'

    return Response.json({
      success: true,
      data: {
        url,
        statusCode,
        statusText,
        statusCategory,
        categoryLabel,
        responseTimeMs,
        contentType,
        server,
        location,
        isSuccess: statusCode >= 200 && statusCode < 300,
        isRedirect: statusCode >= 300 && statusCode < 400,
        isError: statusCode >= 400,
      },
    })
  } catch (err) {
    return Response.json(
      { success: false, error: err instanceof Error ? err.message : 'HTTP check failed' },
      { status: 500 }
    )
  }
}
