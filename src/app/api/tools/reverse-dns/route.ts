import { NextRequest } from 'next/server'
import dns from 'node:dns/promises'
import { reverseDnsSchema } from '@/lib/validators'

export const runtime = 'nodejs'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const parsed = reverseDnsSchema.safeParse(body)
    if (!parsed.success) {
      return Response.json({ success: false, error: parsed.error.issues[0].message }, { status: 400 })
    }
    const { ip } = parsed.data
    const hostnames = await dns.reverse(ip)
    return Response.json({
      success: true,
      data: {
        ip,
        hostnames,
        primary: hostnames[0] || null,
        count: hostnames.length,
      },
    })
  } catch (err: any) {
    if (err.code === 'ENOTFOUND' || err.code === 'ENODATA') {
      return Response.json({ success: true, data: { ip: '', hostnames: [], primary: null, count: 0 } })
    }
    return Response.json(
      { success: false, error: err instanceof Error ? err.message : 'Reverse DNS failed' },
      { status: 500 }
    )
  }
}
