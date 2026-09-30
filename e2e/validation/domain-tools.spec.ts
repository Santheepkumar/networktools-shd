import { test, expect } from '@playwright/test'
import { ToolPage, DnsToolPage, DkimToolPage } from '../pages/tool-page'

// ─── DNS Lookup ──────────────────────────────────────────────────────────────
test.describe('DNS Lookup — validation', () => {
  test('shows error on empty submit', async ({ page }) => {
    const tool = new DnsToolPage(page)
    await tool.goto('dns-lookup')
    await tool.submitBtn.click()
    await expect(tool.inputError).toBeVisible()
    await expect(tool.inputError).toContainText('required')
  })

  test('shows error for invalid domain', async ({ page }) => {
    const tool = new DnsToolPage(page)
    await tool.goto('dns-lookup')
    await tool.domainInput.fill('not a domain!!!')
    await tool.submitBtn.click()
    await expect(tool.inputError).toBeVisible()
    await expect(tool.inputError).toContainText('valid domain')
  })

  test('shows error for IP address entered in domain field', async ({ page }) => {
    const tool = new DnsToolPage(page)
    await tool.goto('dns-lookup')
    await tool.domainInput.fill('8.8.8.8')
    await tool.submitBtn.click()
    // 8.8.8.8 is not a valid domain (no TLD), should fail
    await expect(tool.inputError).toBeVisible()
  })

  test('no error for valid domain', async ({ page }) => {
    const tool = new DnsToolPage(page)
    await tool.goto('dns-lookup')
    await tool.domainInput.fill('example.com')
    await tool.submitBtn.click()
    await expect(tool.inputError).not.toBeVisible()
  })

  test('error clears when user starts typing', async ({ page }) => {
    const tool = new DnsToolPage(page)
    await tool.goto('dns-lookup')
    await tool.submitBtn.click()
    await expect(tool.inputError).toBeVisible()
    await tool.domainInput.fill('e')
    await expect(tool.inputError).not.toBeVisible()
  })
})

// ─── Reverse DNS ─────────────────────────────────────────────────────────────
test.describe('Reverse DNS — validation', () => {
  test('shows error on empty submit', async ({ page }) => {
    const tool = new ToolPage(page)
    await tool.goto('reverse-dns')
    await tool.submitEmpty()
    await expect(tool.inputError).toBeVisible()
    await expect(tool.inputError).toContainText('IP address')
  })

  test('shows error for domain entered in IP field', async ({ page }) => {
    const tool = new ToolPage(page)
    await tool.goto('reverse-dns')
    await tool.fillAndSubmit('example.com')
    await expect(tool.inputError).toBeVisible()
    await expect(tool.inputError).toContainText('valid IP')
  })

  test('shows error for malformed IP like 999.0.0.1', async ({ page }) => {
    const tool = new ToolPage(page)
    await tool.goto('reverse-dns')
    await tool.fillAndSubmit('999.0.0.1')
    await expect(tool.inputError).toBeVisible()
  })

  test('accepts valid IPv4', async ({ page }) => {
    const tool = new ToolPage(page)
    await tool.goto('reverse-dns')
    await tool.fillAndSubmit('8.8.8.8')
    await expect(tool.inputError).not.toBeVisible()
  })
})

// ─── WHOIS ───────────────────────────────────────────────────────────────────
test.describe('WHOIS Lookup — validation', () => {
  test('shows error on empty submit', async ({ page }) => {
    const tool = new ToolPage(page)
    await tool.goto('whois')
    await tool.submitEmpty()
    await expect(tool.inputError).toBeVisible()
  })

  test('shows error for invalid domain', async ({ page }) => {
    const tool = new ToolPage(page)
    await tool.goto('whois')
    await tool.fillAndSubmit('not-valid!!!')
    await expect(tool.inputError).toBeVisible()
  })

  test('accepts valid domain', async ({ page }) => {
    const tool = new ToolPage(page)
    await tool.goto('whois')
    await tool.fillAndSubmit('example.com')
    await expect(tool.inputError).not.toBeVisible()
  })
})

// ─── MX Lookup ───────────────────────────────────────────────────────────────
test.describe('MX Lookup — validation', () => {
  test('shows error on empty submit', async ({ page }) => {
    const tool = new ToolPage(page)
    await tool.goto('mx-lookup')
    await tool.submitEmpty()
    await expect(tool.inputError).toBeVisible()
  })

  test('shows error for invalid domain', async ({ page }) => {
    const tool = new ToolPage(page)
    await tool.goto('mx-lookup')
    await tool.fillAndSubmit('not-a-domain')
    await expect(tool.inputError).toBeVisible()
  })
})

// ─── DNS Propagation ─────────────────────────────────────────────────────────
test.describe('DNS Propagation — validation', () => {
  test('shows error on empty submit', async ({ page }) => {
    const tool = new ToolPage(page)
    await tool.goto('dns-propagation')
    await tool.submitEmpty()
    await expect(tool.inputError).toBeVisible()
  })
})

// ─── SPF Checker ─────────────────────────────────────────────────────────────
test.describe('SPF Checker — validation', () => {
  test('shows error on empty submit', async ({ page }) => {
    const tool = new ToolPage(page)
    await tool.goto('spf-checker')
    await tool.submitEmpty()
    await expect(tool.inputError).toBeVisible()
  })

  test('shows error for invalid domain', async ({ page }) => {
    const tool = new ToolPage(page)
    await tool.goto('spf-checker')
    await tool.fillAndSubmit('not_valid')
    await expect(tool.inputError).toBeVisible()
  })
})

// ─── DKIM Checker ────────────────────────────────────────────────────────────
test.describe('DKIM Checker — validation', () => {
  test('shows error for empty domain', async ({ page }) => {
    const tool = new DkimToolPage(page)
    await tool.goto('dkim-checker')
    await tool.submitBtn.click()
    await expect(tool.inputError).toBeVisible()
    await expect(tool.inputError).toContainText('required')
  })

  test('shows error for invalid domain format', async ({ page }) => {
    const tool = new DkimToolPage(page)
    await tool.goto('dkim-checker')
    await tool.domainInput.fill('not_a_domain!!!')
    await tool.submitBtn.click()
    await expect(tool.inputError).toBeVisible()
  })

  test('shows error for empty selector', async ({ page }) => {
    const tool = new DkimToolPage(page)
    await tool.goto('dkim-checker')
    await tool.domainInput.fill('example.com')
    await tool.selectorInput.fill('')
    await tool.submitBtn.click()
    await expect(page.getByTestId('selector-error')).toBeVisible()
  })

  test('accepts valid domain and selector', async ({ page }) => {
    const tool = new DkimToolPage(page)
    await tool.goto('dkim-checker')
    await tool.domainInput.fill('google.com')
    await tool.selectorInput.fill('google')
    await tool.submitBtn.click()
    await expect(tool.inputError).not.toBeVisible()
  })
})

// ─── DMARC Checker ───────────────────────────────────────────────────────────
test.describe('DMARC Checker — validation', () => {
  test('shows error on empty submit', async ({ page }) => {
    const tool = new ToolPage(page)
    await tool.goto('dmarc-checker')
    await tool.submitEmpty()
    await expect(tool.inputError).toBeVisible()
  })

  test('shows error for invalid domain', async ({ page }) => {
    const tool = new ToolPage(page)
    await tool.goto('dmarc-checker')
    await tool.fillAndSubmit('http://notadomain')
    await expect(tool.inputError).toBeVisible()
  })
})

// ─── SSL Checker ─────────────────────────────────────────────────────────────
test.describe('SSL Checker — validation', () => {
  test('shows error on empty submit', async ({ page }) => {
    const tool = new ToolPage(page)
    await tool.goto('ssl-checker')
    await tool.submitEmpty()
    await expect(tool.inputError).toBeVisible()
  })

  test('shows error for URL entered instead of domain', async ({ page }) => {
    const tool = new ToolPage(page)
    await tool.goto('ssl-checker')
    await tool.fillAndSubmit('https://example.com')
    await expect(tool.inputError).toBeVisible()
  })

  test('accepts bare domain', async ({ page }) => {
    const tool = new ToolPage(page)
    await tool.goto('ssl-checker')
    await tool.fillAndSubmit('example.com')
    await expect(tool.inputError).not.toBeVisible()
  })
})

// ─── Domain Security Scanner ─────────────────────────────────────────────────
test.describe('Domain Security Scanner — validation', () => {
  test('shows error on empty submit', async ({ page }) => {
    const tool = new ToolPage(page)
    await tool.goto('domain-security')
    await tool.submitEmpty()
    await expect(tool.inputError).toBeVisible()
  })

  test('shows error for invalid domain', async ({ page }) => {
    const tool = new ToolPage(page)
    await tool.goto('domain-security')
    await tool.fillAndSubmit('not!!valid')
    await expect(tool.inputError).toBeVisible()
  })
})
