import { NextRequest } from 'next/server'
import tls from 'node:tls'
import { sslCheckerSchema } from '@/lib/validators'

export const runtime = 'nodejs'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const parsed = sslCheckerSchema.safeParse(body)
    if (!parsed.success) {
      return Response.json({ success: false, error: parsed.error.issues[0].message }, { status: 400 })
    }
    const { domain } = parsed.data

    const cert = await new Promise<tls.PeerCertificate & { raw?: Buffer }>((resolve, reject) => {
      const socket = tls.connect(
        { host: domain, port: 443, servername: domain, rejectUnauthorized: false, timeout: 10000 },
        () => {
          const c = socket.getPeerCertificate(true)
          socket.end()
          resolve(c)
        }
      )
      socket.on('error', reject)
      socket.on('timeout', () => { socket.destroy(); reject(new Error('TLS connection timed out')) })
    })

    if (!cert || !cert.subject) {
      return Response.json({ success: false, error: 'No certificate found' }, { status: 400 })
    }

    const validFrom = new Date(cert.valid_from)
    const validTo = new Date(cert.valid_to)
    const now = new Date()
    const daysRemaining = Math.floor((validTo.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
    const isExpired = daysRemaining < 0
    const isExpiringSoon = daysRemaining >= 0 && daysRemaining <= 30

    const san: string[] = []
    if (cert.subjectaltname) {
      for (const entry of cert.subjectaltname.split(',')) {
        san.push(entry.trim().replace(/^DNS:/, '').replace(/^IP:/, ''))
      }
    }

    const socket2 = await new Promise<{ protocol: string; cipher: string; authorized: boolean }>((resolve, reject) => {
      let protocol = 'TLSv1.3'
      let cipher = 'Unknown'
      let authorized = false
      const s = tls.connect(
        { host: domain, port: 443, servername: domain, rejectUnauthorized: true, timeout: 10000 },
        () => {
          protocol = s.getProtocol() || 'Unknown'
          cipher = s.getCipher()?.name || 'Unknown'
          authorized = s.authorized
          s.end()
          resolve({ protocol, cipher, authorized })
        }
      )
      s.on('error', () => resolve({ protocol, cipher, authorized: false }))
      s.on('timeout', () => { s.destroy(); resolve({ protocol, cipher, authorized: false }) })
    })

    return Response.json({
      success: true,
      data: {
        domain,
        subject: {
          CN: cert.subject?.CN,
          O: cert.subject?.O,
          L: cert.subject?.L,
          C: cert.subject?.C,
        },
        issuer: {
          CN: cert.issuer?.CN,
          O: cert.issuer?.O,
        },
        validFrom: validFrom.toISOString(),
        validTo: validTo.toISOString(),
        daysRemaining,
        isValid: !isExpired,
        isExpired,
        isExpiringSoon,
        isTrusted: socket2.authorized,
        protocol: socket2.protocol,
        cipher: socket2.cipher,
        san,
        serialNumber: cert.serialNumber,
        fingerprint: cert.fingerprint256 || cert.fingerprint,
        grade: !isExpired && socket2.authorized && socket2.protocol === 'TLSv1.3' ? 'A+'
          : !isExpired && socket2.authorized ? 'A'
          : isExpiringSoon ? 'B'
          : 'F',
      },
    })
  } catch (err) {
    return Response.json(
      { success: false, error: err instanceof Error ? err.message : 'SSL check failed' },
      { status: 500 }
    )
  }
}
