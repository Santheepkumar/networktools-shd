import { test, expect } from '@playwright/test'
import { ToolPage, DnsToolPage, DkimToolPage } from '../pages/tool-page'



// ─── DNS Lookup Full Flow ─────────────────────────────────────────────────────
test('DNS Lookup — submits example.com and shows A records', async ({ page }) => {
  const tool = new DnsToolPage(page)
  await tool.goto('dns-lookup')
  await tool.domainInput.fill('example.com')
  await tool.submitBtn.click()
  await tool.waitForResult(25_000)
  await expect(tool.resultPanel).toBeVisible()
  // Should show the A badge
  await expect(page.getByText('A').first()).toBeVisible()
})

test('DNS Lookup — MX record type returns MX records for google.com', async ({ page }) => {
  const tool = new DnsToolPage(page)
  await tool.goto('dns-lookup')
  await tool.domainInput.fill('google.com')
  // Change record type to MX via the select
  await tool.recordTypeSelect.click()
  await page.getByText('MX', { exact: true }).click()
  await tool.submitBtn.click()
  await tool.waitForResult(25_000)
  await expect(tool.resultPanel).toBeVisible()
  await expect(page.getByText('MX').first()).toBeVisible()
})

// ─── Reverse DNS Full Flow ────────────────────────────────────────────────────
test('Reverse DNS — resolves 8.8.8.8 and shows hostname', async ({ page }) => {
  const tool = new ToolPage(page)
  await tool.goto('reverse-dns')
  await tool.fillAndSubmit('8.8.8.8')
  await tool.waitForResult(20_000)
  await expect(tool.resultPanel).toBeVisible()
  await expect(page.getByText('google', { exact: false })).toBeVisible()
})

// ─── WHOIS Full Flow ──────────────────────────────────────────────────────────
test('WHOIS — shows registrar for cloudflare.com', async ({ page }) => {
  const tool = new ToolPage(page)
  await tool.goto('whois')
  await tool.fillAndSubmit('cloudflare.com')
  await tool.waitForResult(25_000)
  await expect(tool.resultPanel).toBeVisible()
  await expect(page.getByText('cloudflare.com', { exact: false }).first()).toBeVisible()
})

// ─── MX Lookup Full Flow ──────────────────────────────────────────────────────
test('MX Lookup — shows MX records for google.com', async ({ page }) => {
  const tool = new ToolPage(page)
  await tool.goto('mx-lookup')
  await tool.fillAndSubmit('google.com')
  await tool.waitForResult(20_000)
  await expect(tool.resultPanel).toBeVisible()
  await expect(page.getByText('MX').first()).toBeVisible()
})

// ─── SPF Checker Full Flow ────────────────────────────────────────────────────
test('SPF Checker — finds SPF for google.com', async ({ page }) => {
  const tool = new ToolPage(page)
  await tool.goto('spf-checker')
  await tool.fillAndSubmit('google.com')
  await tool.waitForResult(20_000)
  await expect(tool.resultPanel).toBeVisible()
  await expect(page.getByText('v=spf1', { exact: false })).toBeVisible()
})

// ─── DKIM Checker Full Flow ───────────────────────────────────────────────────
test('DKIM Checker — checks google selector for google.com', async ({ page }) => {
  const tool = new DkimToolPage(page)
  await tool.goto('dkim-checker')
  await tool.domainInput.fill('google.com')
  await tool.selectorInput.fill('google')
  await tool.submitBtn.click()
  await tool.waitForResult(20_000)
  await expect(tool.resultPanel).toBeVisible()
})

// ─── DMARC Checker Full Flow ──────────────────────────────────────────────────
test('DMARC Checker — shows policy for google.com', async ({ page }) => {
  const tool = new ToolPage(page)
  await tool.goto('dmarc-checker')
  await tool.fillAndSubmit('google.com')
  await tool.waitForResult(20_000)
  await expect(tool.resultPanel).toBeVisible()
  await expect(page.getByText('policy', { exact: false }).first()).toBeVisible()
})
