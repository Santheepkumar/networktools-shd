import { NextRequest } from 'next/server'
import { cidrCalculatorSchema } from '@/lib/validators'

export const runtime = 'nodejs'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const parsed = cidrCalculatorSchema.safeParse(body)
    if (!parsed.success) {
      return Response.json({ success: false, error: parsed.error.issues[0].message }, { status: 400 })
    }
    const { cidr } = parsed.data
    const { Address4 } = await import('ip-address')

    const addr = new Address4(cidr)
    const prefix = addr.subnetMask
    const prefixLength = parseInt(cidr.split('/')[1])

    const networkAddr = addr.startAddress().address
    const broadcastAddr = addr.endAddress().address

    // Calculate netmask from prefix length
    const maskBits = (~0 << (32 - prefixLength)) >>> 0
    const netmask = [
      (maskBits >>> 24) & 0xff,
      (maskBits >>> 16) & 0xff,
      (maskBits >>> 8) & 0xff,
      maskBits & 0xff,
    ].join('.')

    // Wildcard mask is inverse of netmask
    const wildcardMask = [
      255 - ((maskBits >>> 24) & 0xff),
      255 - ((maskBits >>> 16) & 0xff),
      255 - ((maskBits >>> 8) & 0xff),
      255 - (maskBits & 0xff),
    ].join('.')

    const totalHosts = Math.pow(2, 32 - prefixLength)
    const usableHosts = totalHosts > 2 ? totalHosts - 2 : totalHosts

    // First and last usable
    const netParts = networkAddr.split('.').map(Number)
    const broadParts = broadcastAddr.split('.').map(Number)
    const firstUsable = prefixLength < 31 ? [...netParts.slice(0, 3), netParts[3] + 1].join('.') : networkAddr
    const lastUsable = prefixLength < 31 ? [...broadParts.slice(0, 3), broadParts[3] - 1].join('.') : broadcastAddr

    return Response.json({
      success: true,
      data: {
        cidr,
        ipVersion: 4,
        networkAddress: networkAddr,
        broadcastAddress: broadcastAddr,
        netmask,
        wildcardMask,
        firstUsable,
        lastUsable,
        totalHosts,
        usableHosts,
        prefixLength,
        binaryNetmask: maskBits.toString(2).padStart(32, '0').match(/.{8}/g)!.join('.'),
      },
    })
  } catch (err) {
    return Response.json(
      { success: false, error: err instanceof Error ? err.message : 'CIDR calculation failed' },
      { status: 500 }
    )
  }
}
