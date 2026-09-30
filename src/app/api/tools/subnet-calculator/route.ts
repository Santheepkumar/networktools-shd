import { NextRequest } from 'next/server'
import { subnetCalculatorSchema } from '@/lib/validators'

export const runtime = 'nodejs'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const parsed = subnetCalculatorSchema.safeParse(body)
    if (!parsed.success) {
      return Response.json({ success: false, error: parsed.error.issues[0].message }, { status: 400 })
    }
    const { cidr, newPrefix } = parsed.data
    const { Address4 } = await import('ip-address')

    const parentAddr = new Address4(cidr)
    const parentPrefix = parseInt(cidr.split('/')[1])

    if (newPrefix <= parentPrefix) {
      return Response.json(
        { success: false, error: `New prefix (/${newPrefix}) must be larger than parent prefix (/${parentPrefix})` },
        { status: 400 }
      )
    }

    const subnetCount = Math.pow(2, newPrefix - parentPrefix)
    const hostsPerSubnet = Math.pow(2, 32 - newPrefix)

    // Limit output to first 256 subnets
    const displayCount = Math.min(subnetCount, 256)
    const subnets = []

    // Get base network as 32-bit integer
    const baseIp = parentAddr.startAddress().address.split('.').map(Number)
    let baseInt = (baseIp[0] << 24 | baseIp[1] << 16 | baseIp[2] << 8 | baseIp[3]) >>> 0

    for (let i = 0; i < displayCount; i++) {
      const netInt = (baseInt + i * hostsPerSubnet) >>> 0
      const broadInt = (netInt + hostsPerSubnet - 1) >>> 0

      const intToIp = (n: number) => [
        (n >>> 24) & 0xff, (n >>> 16) & 0xff, (n >>> 8) & 0xff, n & 0xff
      ].join('.')

      const networkAddress = intToIp(netInt)
      const broadcastAddress = intToIp(broadInt)
      const firstUsable = newPrefix < 31 ? intToIp(netInt + 1) : networkAddress
      const lastUsable = newPrefix < 31 ? intToIp(broadInt - 1) : broadcastAddress

      subnets.push({
        index: i + 1,
        cidr: `${networkAddress}/${newPrefix}`,
        networkAddress,
        broadcastAddress,
        firstUsable,
        lastUsable,
        usableHosts: newPrefix < 31 ? hostsPerSubnet - 2 : hostsPerSubnet,
      })
    }

    return Response.json({
      success: true,
      data: {
        parentCidr: cidr,
        newPrefix,
        subnetCount,
        hostsPerSubnet: newPrefix < 31 ? hostsPerSubnet - 2 : hostsPerSubnet,
        displayedSubnets: displayCount,
        truncated: subnetCount > 256,
        subnets,
      },
    })
  } catch (err) {
    return Response.json(
      { success: false, error: err instanceof Error ? err.message : 'Subnet calculation failed' },
      { status: 500 }
    )
  }
}
