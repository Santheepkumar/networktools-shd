import { test, expect } from '@playwright/test'
import { ToolPage, SubnetCalcPage } from '../pages/tool-page'



// ─── HTTP Status Full Flow ────────────────────────────────────────────────────
test('HTTP Status — checks https://example.com returns 200', async ({ page }) => {
  const tool = new ToolPage(page)
  await tool.goto('http-status')
  await tool.fillAndSubmit('https://example.com')
  await tool.waitForResult(20_000)
  await expect(tool.resultPanel).toBeVisible()
  await expect(page.getByText('200', { exact: false })).toBeVisible()
})

// ─── HTTP Headers Full Flow ───────────────────────────────────────────────────
test('HTTP Headers — inspects headers for cloudflare.com', async ({ page }) => {
  const tool = new ToolPage(page)
  await tool.goto('http-headers')
  await tool.fillAndSubmit('https://cloudflare.com')
  await tool.waitForResult(20_000)
  await expect(tool.resultPanel).toBeVisible()
  // Content-type header is universal
  await expect(page.getByText('content-type', { exact: false })).toBeVisible()
})

// ─── HTTP Redirects Full Flow ─────────────────────────────────────────────────
test('HTTP Redirects — traces redirect chain for http://github.com', async ({ page }) => {
  const tool = new ToolPage(page)
  await tool.goto('http-redirects')
  await tool.fillAndSubmit('http://github.com')
  await tool.waitForResult(25_000)
  await expect(tool.resultPanel).toBeVisible()
  // Should show hop(s) with status codes
  await expect(page.getByText('301').or(page.getByText('302')).first()).toBeVisible()
})

// ─── SSL Checker Full Flow ────────────────────────────────────────────────────
test('SSL Checker — shows cert details for example.com', async ({ page }) => {
  const tool = new ToolPage(page)
  await tool.goto('ssl-checker')
  await tool.fillAndSubmit('example.com')
  await tool.waitForResult(25_000)
  await expect(tool.resultPanel).toBeVisible()
  // Should show grade or days remaining
  await expect(page.getByText('days', { exact: false }).first()).toBeVisible()
})

// ─── CIDR Calculator Full Flow ────────────────────────────────────────────────
test('CIDR Calculator — computes 192.168.1.0/24 correctly', async ({ page }) => {
  const tool = new ToolPage(page)
  await tool.goto('cidr-calculator')
  await tool.fillAndSubmit('192.168.1.0/24')
  await tool.waitForResult(5_000)
  await expect(tool.resultPanel).toBeVisible()
  await expect(page.getByText('192.168.1.0', { exact: false })).toBeVisible()
  await expect(page.getByText('254', { exact: false })).toBeVisible()
})

// ─── Subnet Calculator Full Flow ──────────────────────────────────────────────
test('Subnet Calculator — divides 10.0.0.0/8 into /16 subnets', async ({ page }) => {
  const tool = new SubnetCalcPage(page)
  await tool.goto('subnet-calculator')
  await tool.cidrInput.fill('10.0.0.0/8')
  await tool.prefixInput.fill('16')
  await tool.submitBtn.click()
  await tool.waitForResult(5_000)
  await expect(tool.resultPanel).toBeVisible()
  await expect(page.getByText('10.0.0.0', { exact: false })).toBeVisible()
})

// ─── Domain Security Scanner Full Flow ────────────────────────────────────────
test('Domain Security Scanner — scans cloudflare.com and shows score', async ({ page }) => {
  test.setTimeout(70_000)
  const tool = new ToolPage(page)
  await tool.goto('domain-security')
  await tool.fillAndSubmit('cloudflare.com')
  await tool.waitForResult(60_000)
  await expect(tool.resultPanel).toBeVisible()
  // Score card should have a grade
  await expect(page.getByText('Grade', { exact: false }).first()).toBeVisible()
})
