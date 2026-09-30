import { NextRequest } from 'next/server'
import net from 'node:net'
import dns from 'node:dns/promises'
import { pingSchema } from '@/lib/validators'

export const runtime = 'nodejs'

function tcpPing(host: string, port = 443, timeout = 3000): Promise<number> {
  return new Promise((resolve, reject) => {
    const start = Date.now()
    const socket = new net.Socket()
    socket.setTimeout(timeout)
    socket.connect(port, host, () => {
      const ms = Date.now() - start
      socket.destroy()
      resolve(ms)
    })
    socket.on('timeout', () => { socket.destroy(); reject(new Error('Timeout')) })
    socket.on('error', (err) => { socket.destroy(); reject(err) })
  })
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const parsed = pingSchema.safeParse(body)
    if (!parsed.success) {
      return Response.json({ success: false, error: parsed.error.issues[0].message }, { status: 400 })
    }
    const { host } = parsed.data

    // Resolve hostname to IP
    let ip = host
    try {
      const addresses = await dns.resolve4(host)
      if (addresses.length > 0) ip = addresses[0]
    } catch { /* host might already be IP */ }

    const count = 4
    const latencies: number[] = []
    const ports = [443, 80, 22]
    let usedPort = 443

    // Try multiple ports for TCP ping
    for (const port of ports) {
      try {
        const results = await Promise.all(
          Array.from({ length: count }, () => tcpPing(ip, port, 3000))
        )
        latencies.push(...results)
        usedPort = port
        break
      } catch { continue }
    }

    if (latencies.length === 0) {
      return Response.json({
        success: true,
        data: {
          host, ip, port: usedPort,
          latencies: [], min: null, max: null, avg: null,
          packetLoss: 100, status: 'unreachable',
          note: 'All ports timed out — host may be unreachable or blocking connections',
        },
      })
    }

    const min = Math.min(...latencies)
    const max = Math.max(...latencies)
    const avg = Math.round(latencies.reduce((a, b) => a + b, 0) / latencies.length)

    return Response.json({
      success: true,
      data: {
        host, ip, port: usedPort,
        latencies, min, max, avg,
        packetLoss: 0, status: 'reachable',
        note: `TCP ping to port ${usedPort}`,
      },
    })
  } catch (err) {
    return Response.json(
      { success: false, error: err instanceof Error ? err.message : 'Ping failed' },
      { status: 500 }
    )
  }
}
