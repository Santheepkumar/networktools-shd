import { test, expect } from '@playwright/test'
import { ToolPage, PortCheckerPage } from '../pages/tool-page'



// ─── Ping Full Flow ───────────────────────────────────────────────────────────
test('Ping — pings 1.1.1.1 and shows result', async ({ page }) => {
  const tool = new ToolPage(page)
  await tool.goto('ping')
  await tool.fillAndSubmit('1.1.1.1')
  await tool.waitForResult(25_000)
  await expect(tool.resultPanel).toBeVisible()
})

// ─── Port Checker Full Flow ───────────────────────────────────────────────────
test('Port Checker — checks 80 and 443 on example.com', async ({ page }) => {
  const tool = new PortCheckerPage(page)
  await tool.goto('port-checker')
  await tool.hostInput.fill('example.com')
  await tool.submitBtn.click()
  await tool.waitForResult(30_000)
  await expect(tool.resultPanel).toBeVisible()
  // Should show port table with Open/Closed
  await expect(page.getByText('Open').first().or(page.getByText('Closed').first())).toBeVisible()
})

// ─── IP Geolocation Full Flow ─────────────────────────────────────────────────
test('IP Geolocation — geolocates 8.8.8.8', async ({ page }) => {
  const tool = new ToolPage(page)
  await tool.goto('ip-geolocation')
  await tool.fillAndSubmit('8.8.8.8')
  await tool.waitForResult(20_000)
  await expect(tool.resultPanel).toBeVisible()
  await expect(page.getByText('8.8.8.8', { exact: false })).toBeVisible()
})

// ─── ASN Lookup Full Flow ─────────────────────────────────────────────────────
test('ASN Lookup — looks up AS15169 (Google)', async ({ page }) => {
  const tool = new ToolPage(page)
  await tool.goto('asn-lookup')
  await tool.fillAndSubmit('AS15169')
  await tool.waitForResult(20_000)
  await expect(tool.resultPanel).toBeVisible()
})

// ─── My Infrastructure Full Flow ──────────────────────────────────────────────
test('My Infrastructure — detects public IP', async ({ page }) => {
  const tool = new ToolPage(page)
  await tool.goto('my-infrastructure')
  await tool.submitBtn.click()
  await tool.waitForResult(20_000)
  await expect(tool.resultPanel).toBeVisible()
  // IP should be visible in results
  await expect(page.getByText('ip', { exact: false }).first()).toBeVisible()
})
