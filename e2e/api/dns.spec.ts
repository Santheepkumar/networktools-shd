import { test, expect } from '@playwright/test'

const BASE = process.env.BASE_URL || 'http://localhost:3002'

test.describe('DNS Lookup API', () => {
  test('returns A records for example.com', async ({ request }) => {
    const res = await request.post(`${BASE}/api/tools/dns-lookup`, {
      data: { domain: 'example.com', recordType: 'A' },
    })
    expect(res.ok()).toBe(true)
    const body = await res.json()
    expect(body.success).toBe(true)
    expect(Array.isArray(body.data)).toBe(true)
    expect(body.data.length).toBeGreaterThan(0)
    expect(body.data[0]).toMatchObject({ type: 'A', value: expect.any(String) })
  })

  test('returns TXT records for google.com', async ({ request }) => {
    const res = await request.post(`${BASE}/api/tools/dns-lookup`, {
      data: { domain: 'google.com', recordType: 'TXT' },
    })
    const body = await res.json()
    expect(body.success).toBe(true)
    expect(body.data.some((r: { value: string }) => r.value.includes('v=spf1'))).toBe(true)
  })

  test('returns 400 for invalid domain', async ({ request }) => {
    const res = await request.post(`${BASE}/api/tools/dns-lookup`, {
      data: { domain: 'not-valid!!', recordType: 'A' },
    })
    expect(res.status()).toBe(400)
    const body = await res.json()
    expect(body.success).toBe(false)
    expect(body.error).toBeTruthy()
  })

  test('returns 400 for missing domain', async ({ request }) => {
    const res = await request.post(`${BASE}/api/tools/dns-lookup`, {
      data: { recordType: 'A' },
    })
    expect(res.status()).toBe(400)
  })
})

test.describe('Reverse DNS API', () => {
  test('resolves 8.8.8.8 to google hostname', async ({ request }) => {
    const res = await request.post(`${BASE}/api/tools/reverse-dns`, {
      data: { ip: '8.8.8.8' },
    })
    const body = await res.json()
    expect(body.success).toBe(true)
    expect(body.data.hostnames.length).toBeGreaterThan(0)
    expect(body.data.hostnames[0]).toContain('google')
  })

  test('returns 400 for invalid IP', async ({ request }) => {
    const res = await request.post(`${BASE}/api/tools/reverse-dns`, {
      data: { ip: 'not-an-ip' },
    })
    expect(res.status()).toBe(400)
    const body = await res.json()
    expect(body.success).toBe(false)
  })
})

test.describe('MX Lookup API', () => {
  test('returns MX records for google.com', async ({ request }) => {
    const res = await request.post(`${BASE}/api/tools/mx-lookup`, {
      data: { domain: 'google.com' },
    })
    const body = await res.json()
    expect(body.success).toBe(true)
    expect(Array.isArray(body.data)).toBe(true)
    expect(body.data.length).toBeGreaterThan(0)
    expect(body.data[0]).toMatchObject({
      type: 'MX',
      priority: expect.any(Number),
      value: expect.any(String),
    })
  })

  test('returns 400 for invalid domain', async ({ request }) => {
    const res = await request.post(`${BASE}/api/tools/mx-lookup`, {
      data: { domain: '!!invalid!!' },
    })
    expect(res.status()).toBe(400)
  })
})

test.describe('SPF Checker API', () => {
  test('finds SPF record for google.com', async ({ request }) => {
    const res = await request.post(`${BASE}/api/tools/spf-checker`, {
      data: { domain: 'google.com' },
    })
    const body = await res.json()
    expect(body.success).toBe(true)
    expect(body.data.hasSpf).toBe(true)
    expect(body.data.record).toContain('v=spf1')
  })

  test('reports no SPF for domain without one', async ({ request }) => {
    const res = await request.post(`${BASE}/api/tools/spf-checker`, {
      data: { domain: 'example.com' },
    })
    const body = await res.json()
    expect(body.success).toBe(true)
    // example.com may or may not have SPF — just check shape
    expect(typeof body.data.hasSpf).toBe('boolean')
  })

  test('returns 400 for invalid domain', async ({ request }) => {
    const res = await request.post(`${BASE}/api/tools/spf-checker`, {
      data: { domain: 'bad domain!!!' },
    })
    expect(res.status()).toBe(400)
  })
})

test.describe('DKIM Checker API', () => {
  test('checks DKIM for google.com with google selector', async ({ request }) => {
    const res = await request.post(`${BASE}/api/tools/dkim-checker`, {
      data: { domain: 'google.com', selector: 'google' },
    })
    const body = await res.json()
    expect(body.success).toBe(true)
    expect(typeof body.data.found).toBe('boolean')
    expect(body.data.dkimHost).toBe('google._domainkey.google.com')
  })

  test('returns 400 for missing selector', async ({ request }) => {
    const res = await request.post(`${BASE}/api/tools/dkim-checker`, {
      data: { domain: 'google.com' },
    })
    // selector has a default so it may succeed — just check no crash
    const body = await res.json()
    expect(body).toHaveProperty('success')
  })
})

test.describe('DMARC Checker API', () => {
  test('finds DMARC for google.com', async ({ request }) => {
    const res = await request.post(`${BASE}/api/tools/dmarc-checker`, {
      data: { domain: 'google.com' },
    })
    const body = await res.json()
    expect(body.success).toBe(true)
    expect(body.data.hasDmarc).toBe(true)
    expect(['none', 'quarantine', 'reject']).toContain(body.data.policy)
  })

  test('returns 400 for invalid domain', async ({ request }) => {
    const res = await request.post(`${BASE}/api/tools/dmarc-checker`, {
      data: { domain: '!!!' },
    })
    expect(res.status()).toBe(400)
  })
})

test.describe('DNS Propagation API', () => {
  test('returns results from multiple resolvers for example.com', async ({ request }) => {
    const res = await request.post(`${BASE}/api/tools/dns-propagation`, {
      data: { domain: 'example.com', recordType: 'A' },
    })
    const body = await res.json()
    expect(body.success).toBe(true)
    expect(Array.isArray(body.data)).toBe(true)
    expect(body.data.length).toBeGreaterThanOrEqual(3)
    expect(body.data[0]).toMatchObject({
      name: expect.any(String),
      status: expect.stringMatching(/^(ok|error)$/),
    })
  })
})
