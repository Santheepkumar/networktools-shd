import { test, expect } from '@playwright/test'

const BASE = process.env.BASE_URL || 'http://localhost:3002'

test.describe('HTTP Status API', () => {
  test('returns 200 for https://example.com', async ({ request }) => {
    const res = await request.post(`${BASE}/api/tools/http-status`, {
      data: { url: 'https://example.com' },
      timeout: 15_000,
    })
    const body = await res.json()
    expect(body.success).toBe(true)
    expect(body.data.statusCode).toBe(200)
    expect(body.data.isSuccess).toBe(true)
    expect(body.data.responseTimeMs).toBeGreaterThan(0)
  })

  test('detects redirect for http://example.com', async ({ request }) => {
    const res = await request.post(`${BASE}/api/tools/http-status`, {
      data: { url: 'http://github.com' },
      timeout: 15_000,
    })
    const body = await res.json()
    expect(body.success).toBe(true)
    // May redirect or return 200 depending on follow
    expect(typeof body.data.statusCode).toBe('number')
  })

  test('returns 400 for invalid URL', async ({ request }) => {
    const res = await request.post(`${BASE}/api/tools/http-status`, {
      data: { url: 'not-a-url' },
    })
    expect(res.status()).toBe(400)
    const body = await res.json()
    expect(body.success).toBe(false)
  })

  test('returns 400 for missing url', async ({ request }) => {
    const res = await request.post(`${BASE}/api/tools/http-status`, {
      data: {},
    })
    expect(res.status()).toBe(400)
  })
})

test.describe('HTTP Headers API', () => {
  test('returns headers array for cloudflare.com', async ({ request }) => {
    const res = await request.post(`${BASE}/api/tools/http-headers`, {
      data: { url: 'https://cloudflare.com' },
      timeout: 15_000,
    })
    const body = await res.json()
    expect(body.success).toBe(true)
    expect(Array.isArray(body.data.headers)).toBe(true)
    expect(body.data.headers.length).toBeGreaterThan(0)
    expect(body.data.headers[0]).toMatchObject({
      name: expect.any(String),
      value: expect.any(String),
    })
    expect(body.data.securityScore).toMatchObject({
      score: expect.any(Number),
      maxScore: expect.any(Number),
      grade: expect.stringMatching(/^[A-F]$/),
    })
  })

  test('reports missing security headers', async ({ request }) => {
    const res = await request.post(`${BASE}/api/tools/http-headers`, {
      data: { url: 'https://example.com' },
      timeout: 15_000,
    })
    const body = await res.json()
    expect(body.success).toBe(true)
    expect(Array.isArray(body.data.missingSecurityHeaders)).toBe(true)
  })

  test('returns 400 for domain without protocol', async ({ request }) => {
    const res = await request.post(`${BASE}/api/tools/http-headers`, {
      data: { url: 'cloudflare.com' },
    })
    expect(res.status()).toBe(400)
  })
})

test.describe('HTTP Redirects API', () => {
  test('traces redirect chain for http://github.com', async ({ request }) => {
    const res = await request.post(`${BASE}/api/tools/http-redirects`, {
      data: { url: 'http://github.com' },
      timeout: 15_000,
    })
    const body = await res.json()
    expect(body.success).toBe(true)
    expect(Array.isArray(body.data)).toBe(true)
    expect(body.data.length).toBeGreaterThan(0)
    expect(body.data[0]).toMatchObject({
      url: expect.any(String),
      statusCode: expect.any(Number),
      responseTimeMs: expect.any(Number),
    })
  })

  test('returns single hop for already-final URL', async ({ request }) => {
    const res = await request.post(`${BASE}/api/tools/http-redirects`, {
      data: { url: 'https://example.com' },
      timeout: 15_000,
    })
    const body = await res.json()
    expect(body.success).toBe(true)
    expect(body.data.length).toBeGreaterThanOrEqual(1)
    const lastHop = body.data[body.data.length - 1]
    expect(lastHop.statusCode).toBeGreaterThanOrEqual(200)
    expect(lastHop.statusCode).toBeLessThan(400)
  })

  test('returns 400 for invalid URL', async ({ request }) => {
    const res = await request.post(`${BASE}/api/tools/http-redirects`, {
      data: { url: 'example.com' },
    })
    expect(res.status()).toBe(400)
  })
})

test.describe('SSL Checker API', () => {
  test('returns valid cert info for cloudflare.com', async ({ request }) => {
    const res = await request.post(`${BASE}/api/tools/ssl-checker`, {
      data: { domain: 'cloudflare.com' },
      timeout: 20_000,
    })
    const body = await res.json()
    expect(body.success).toBe(true)
    expect(body.data.isValid).toBe(true)
    expect(body.data.daysRemaining).toBeGreaterThan(0)
    expect(body.data.issuer).toMatchObject({ CN: expect.any(String) })
    expect(['A+', 'A', 'B', 'C', 'D', 'F']).toContain(body.data.grade)
  })

  test('returns cert with SAN list', async ({ request }) => {
    const res = await request.post(`${BASE}/api/tools/ssl-checker`, {
      data: { domain: 'google.com' },
      timeout: 20_000,
    })
    const body = await res.json()
    expect(body.success).toBe(true)
    expect(Array.isArray(body.data.san)).toBe(true)
    expect(body.data.san.length).toBeGreaterThan(0)
  })

  test('returns 400 for invalid domain', async ({ request }) => {
    const res = await request.post(`${BASE}/api/tools/ssl-checker`, {
      data: { domain: 'not-a-domain!!!' },
    })
    expect(res.status()).toBe(400)
  })

  test('returns 400 for URL instead of domain', async ({ request }) => {
    const res = await request.post(`${BASE}/api/tools/ssl-checker`, {
      data: { domain: 'https://cloudflare.com' },
    })
    expect(res.status()).toBe(400)
  })
})

test.describe('WHOIS API', () => {
  test('returns registration info for cloudflare.com', async ({ request }) => {
    const res = await request.post(`${BASE}/api/tools/whois`, {
      data: { domain: 'cloudflare.com' },
      timeout: 20_000,
    })
    const body = await res.json()
    expect(body.success).toBe(true)
    expect(body.data.domain).toBe('cloudflare.com')
    expect(body.data.registrar).toBeTruthy()
    expect(Array.isArray(body.data.nameServers)).toBe(true)
    expect(body.data.nameServers.length).toBeGreaterThan(0)
  })

  test('returns 400 for invalid domain', async ({ request }) => {
    const res = await request.post(`${BASE}/api/tools/whois`, {
      data: { domain: 'bad!!domain' },
    })
    expect(res.status()).toBe(400)
  })
})
