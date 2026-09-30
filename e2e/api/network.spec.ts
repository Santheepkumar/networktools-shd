import { test, expect } from '@playwright/test'

const BASE = process.env.BASE_URL || 'http://localhost:3002'

test.describe('Ping API', () => {
  test('pings 1.1.1.1 and reports reachable', async ({ request }) => {
    const res = await request.post(`${BASE}/api/tools/ping`, {
      data: { host: '1.1.1.1' },
      timeout: 20_000,
    })
    const body = await res.json()
    expect(body.success).toBe(true)
    expect(body.data.host).toBe('1.1.1.1')
    expect(body.data.status).toMatch(/^(reachable|unreachable)$/)
    if (body.data.status === 'reachable') {
      expect(typeof body.data.avg).toBe('number')
    }
  })

  test('returns 400 for invalid host', async ({ request }) => {
    const res = await request.post(`${BASE}/api/tools/ping`, {
      data: { host: 'not a host!!!' },
    })
    expect(res.status()).toBe(400)
    const body = await res.json()
    expect(body.success).toBe(false)
  })
})

test.describe('Port Checker API', () => {
  test('checks ports 80 and 443 on example.com', async ({ request }) => {
    const res = await request.post(`${BASE}/api/tools/port-checker`, {
      data: { host: 'example.com', ports: [80, 443] },
      timeout: 20_000,
    })
    const body = await res.json()
    expect(body.success).toBe(true)
    expect(body.data.results).toHaveLength(2)
    expect(body.data.results[0]).toMatchObject({
      port: expect.any(Number),
      service: expect.any(String),
      isOpen: expect.any(Boolean),
    })
    expect(body.data.summary).toMatchObject({
      total: 2,
      open: expect.any(Number),
      closed: expect.any(Number),
    })
  })

  test('returns 400 for invalid host', async ({ request }) => {
    const res = await request.post(`${BASE}/api/tools/port-checker`, {
      data: { host: 'invalid!!!', ports: [80] },
    })
    expect(res.status()).toBe(400)
  })

  test('uses default ports when none specified', async ({ request }) => {
    const res = await request.post(`${BASE}/api/tools/port-checker`, {
      data: { host: '8.8.8.8' },
      timeout: 30_000,
    })
    const body = await res.json()
    expect(body.success).toBe(true)
    expect(body.data.results.length).toBeGreaterThan(1)
  })
})

test.describe('IP Geolocation API', () => {
  test('geolocates Google DNS 8.8.8.8', async ({ request }) => {
    const res = await request.post(`${BASE}/api/tools/ip-geolocation`, {
      data: { ip: '8.8.8.8' },
      timeout: 15_000,
    })
    const body = await res.json()
    expect(body.success).toBe(true)
    expect(body.data.ip).toBe('8.8.8.8')
    expect(body.data.country).toBeTruthy()
    expect(body.data.isp).toBeTruthy()
  })

  test('returns 400 for invalid IP', async ({ request }) => {
    const res = await request.post(`${BASE}/api/tools/ip-geolocation`, {
      data: { ip: 'not.an.ip' },
    })
    expect(res.status()).toBe(400)
  })

  test('returns 400 for out-of-range IP', async ({ request }) => {
    const res = await request.post(`${BASE}/api/tools/ip-geolocation`, {
      data: { ip: '999.0.0.1' },
    })
    expect(res.status()).toBe(400)
  })
})

test.describe('ASN Lookup API', () => {
  test('looks up ASN by IP', async ({ request }) => {
    const res = await request.post(`${BASE}/api/tools/asn-lookup`, {
      data: { query: '8.8.8.8' },
      timeout: 15_000,
    })
    const body = await res.json()
    expect(body.success).toBe(true)
    expect(body.data.asn).toBeTruthy()
  })

  test('returns 400 for empty query', async ({ request }) => {
    const res = await request.post(`${BASE}/api/tools/asn-lookup`, {
      data: { query: '' },
    })
    expect(res.status()).toBe(400)
  })
})

test.describe('My Infrastructure API', () => {
  test('returns public IP and request info', async ({ request }) => {
    const res = await request.get(`${BASE}/api/tools/my-infrastructure`)
    const body = await res.json()
    expect(body.success).toBe(true)
    expect(body.data).toHaveProperty('ip')
    expect(body.data).toHaveProperty('requestHeaders')
    expect(typeof body.data.ip).toBe('string')
  })
})
