import { test, expect } from '@playwright/test'

const BASE = process.env.BASE_URL || 'http://localhost:3002'

test.describe('CIDR Calculator API', () => {
  test('calculates /24 network correctly', async ({ request }) => {
    const res = await request.post(`${BASE}/api/tools/cidr-calculator`, {
      data: { cidr: '192.168.1.0/24' },
    })
    const body = await res.json()
    expect(body.success).toBe(true)
    expect(body.data.networkAddress).toBe('192.168.1.0')
    expect(body.data.broadcastAddress).toBe('192.168.1.255')
    expect(body.data.netmask).toBe('255.255.255.0')
    expect(body.data.usableHosts).toBe(254)
    expect(body.data.totalHosts).toBe(256)
    expect(body.data.firstUsable).toBe('192.168.1.1')
    expect(body.data.lastUsable).toBe('192.168.1.254')
    expect(body.data.prefixLength).toBe(24)
  })

  test('calculates /8 network correctly', async ({ request }) => {
    const res = await request.post(`${BASE}/api/tools/cidr-calculator`, {
      data: { cidr: '10.0.0.0/8' },
    })
    const body = await res.json()
    expect(body.success).toBe(true)
    expect(body.data.networkAddress).toBe('10.0.0.0')
    expect(body.data.broadcastAddress).toBe('10.255.255.255')
    expect(body.data.usableHosts).toBe(16777214)
    expect(body.data.totalHosts).toBe(16777216)
  })

  test('calculates /32 (single host) correctly', async ({ request }) => {
    const res = await request.post(`${BASE}/api/tools/cidr-calculator`, {
      data: { cidr: '192.168.1.1/32' },
    })
    const body = await res.json()
    expect(body.success).toBe(true)
    expect(body.data.totalHosts).toBe(1)
  })

  test('returns 400 for invalid CIDR', async ({ request }) => {
    const res = await request.post(`${BASE}/api/tools/cidr-calculator`, {
      data: { cidr: 'not-a-cidr' },
    })
    expect(res.status()).toBe(400)
    const body = await res.json()
    expect(body.success).toBe(false)
  })

  test('returns 400 for CIDR with prefix /33', async ({ request }) => {
    const res = await request.post(`${BASE}/api/tools/cidr-calculator`, {
      data: { cidr: '192.168.1.0/33' },
    })
    expect(res.status()).toBe(400)
  })

  test('returns 400 for missing cidr', async ({ request }) => {
    const res = await request.post(`${BASE}/api/tools/cidr-calculator`, {
      data: {},
    })
    expect(res.status()).toBe(400)
  })
})

test.describe('Subnet Calculator API', () => {
  test('divides /8 into /16 subnets', async ({ request }) => {
    const res = await request.post(`${BASE}/api/tools/subnet-calculator`, {
      data: { cidr: '10.0.0.0/8', newPrefix: 16 },
    })
    const body = await res.json()
    expect(body.success).toBe(true)
    expect(body.data.subnetCount).toBe(256)
    expect(body.data.parentCidr).toBe('10.0.0.0/8')
    expect(body.data.newPrefix).toBe(16)
    expect(Array.isArray(body.data.subnets)).toBe(true)
    expect(body.data.subnets[0]).toMatchObject({
      cidr: '10.0.0.0/16',
      networkAddress: '10.0.0.0',
    })
  })

  test('divides /24 into /26 subnets (4 subnets)', async ({ request }) => {
    const res = await request.post(`${BASE}/api/tools/subnet-calculator`, {
      data: { cidr: '192.168.1.0/24', newPrefix: 26 },
    })
    const body = await res.json()
    expect(body.success).toBe(true)
    expect(body.data.subnetCount).toBe(4)
    expect(body.data.subnets).toHaveLength(4)
    expect(body.data.hostsPerSubnet).toBe(62)
  })

  test('returns 400 when new prefix is smaller than parent', async ({ request }) => {
    const res = await request.post(`${BASE}/api/tools/subnet-calculator`, {
      data: { cidr: '10.0.0.0/24', newPrefix: 16 },
    })
    expect(res.status()).toBe(400)
    const body = await res.json()
    expect(body.success).toBe(false)
    expect(body.error).toContain('larger than parent')
  })

  test('returns 400 for invalid CIDR', async ({ request }) => {
    const res = await request.post(`${BASE}/api/tools/subnet-calculator`, {
      data: { cidr: 'bad-cidr', newPrefix: 26 },
    })
    expect(res.status()).toBe(400)
  })

  test('returns 400 for missing newPrefix', async ({ request }) => {
    const res = await request.post(`${BASE}/api/tools/subnet-calculator`, {
      data: { cidr: '10.0.0.0/8' },
    })
    expect(res.status()).toBe(400)
  })
})
