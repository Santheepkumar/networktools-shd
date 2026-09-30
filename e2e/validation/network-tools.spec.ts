import { test, expect } from '@playwright/test'
import { ToolPage, PortCheckerPage } from '../pages/tool-page'

// ─── Ping ─────────────────────────────────────────────────────────────────────
test.describe('Ping — validation', () => {
  test('shows error on empty submit', async ({ page }) => {
    const tool = new ToolPage(page)
    await tool.goto('ping')
    await tool.submitEmpty()
    await expect(tool.inputError).toBeVisible()
  })

  test('shows error for invalid host', async ({ page }) => {
    const tool = new ToolPage(page)
    await tool.goto('ping')
    await tool.fillAndSubmit('not a host!!!')
    await expect(tool.inputError).toBeVisible()
  })

  test('accepts valid domain', async ({ page }) => {
    const tool = new ToolPage(page)
    await tool.goto('ping')
    await tool.fillAndSubmit('example.com')
    await expect(tool.inputError).not.toBeVisible()
  })

  test('accepts valid IP address', async ({ page }) => {
    const tool = new ToolPage(page)
    await tool.goto('ping')
    await tool.fillAndSubmit('8.8.8.8')
    // IP is a valid host — no validation error should appear
    await expect(tool.inputError).not.toBeVisible()
  })
})

// ─── Traceroute ───────────────────────────────────────────────────────────────
test.describe('Traceroute — validation', () => {
  test('shows error on empty submit', async ({ page }) => {
    const tool = new ToolPage(page)
    await tool.goto('traceroute')
    await tool.submitEmpty()
    await expect(tool.inputError).toBeVisible()
  })

  test('shows error for invalid host', async ({ page }) => {
    const tool = new ToolPage(page)
    await tool.goto('traceroute')
    await tool.fillAndSubmit('!!!invalid')
    await expect(tool.inputError).toBeVisible()
  })

  test('accepts IP address', async ({ page }) => {
    const tool = new ToolPage(page)
    await tool.goto('traceroute')
    await tool.fillAndSubmit('1.1.1.1')
    // Valid IP — no validation error
    await expect(tool.inputError).not.toBeVisible()
  })
})

// ─── Port Checker ─────────────────────────────────────────────────────────────
test.describe('Port Checker — validation', () => {
  test('shows error on empty host submit', async ({ page }) => {
    const tool = new PortCheckerPage(page)
    await tool.goto('port-checker')
    await tool.submitBtn.click()
    await expect(tool.inputError).toBeVisible()
    await expect(tool.inputError).toContainText('required')
  })

  test('shows error for invalid host format', async ({ page }) => {
    const tool = new PortCheckerPage(page)
    await tool.goto('port-checker')
    await tool.hostInput.fill('not a valid host!!!')
    await tool.submitBtn.click()
    await expect(tool.inputError).toBeVisible()
  })

  test('accepts valid domain', async ({ page }) => {
    const tool = new PortCheckerPage(page)
    await tool.goto('port-checker')
    await tool.hostInput.fill('example.com')
    await tool.submitBtn.click()
    await expect(tool.inputError).not.toBeVisible()
  })

  test('port toggle buttons work', async ({ page }) => {
    await page.goto('/tools/port-checker')
    const btn80 = page.getByTestId('port-toggle-80')
    // Toggle off
    await btn80.click()
    await expect(btn80).not.toHaveClass(/bg-primary/)
    // Toggle back on
    await btn80.click()
    await expect(btn80).toHaveClass(/bg-primary/)
  })

  test('custom port can be added', async ({ page }) => {
    await page.goto('/tools/port-checker')
    await page.getByTestId('custom-port-input').fill('9000')
    await page.getByTestId('add-port-btn').click()
    // After adding, the submit button text should show the updated port count
    await expect(page.getByTestId('submit-btn')).toContainText('Port')
  })
})

// ─── IP Geolocation ───────────────────────────────────────────────────────────
test.describe('IP Geolocation — validation', () => {
  test('shows error on empty submit', async ({ page }) => {
    const tool = new ToolPage(page)
    await tool.goto('ip-geolocation')
    await tool.submitEmpty()
    await expect(tool.inputError).toBeVisible()
    await expect(tool.inputError).toContainText('IP address')
  })

  test('shows error for domain entered in IP field', async ({ page }) => {
    const tool = new ToolPage(page)
    await tool.goto('ip-geolocation')
    await tool.fillAndSubmit('example.com')
    await expect(tool.inputError).toBeVisible()
    await expect(tool.inputError).toContainText('valid IP')
  })

  test('shows error for out-of-range IP like 999.0.0.1', async ({ page }) => {
    const tool = new ToolPage(page)
    await tool.goto('ip-geolocation')
    await tool.fillAndSubmit('999.0.0.1')
    await expect(tool.inputError).toBeVisible()
  })

  test('accepts valid IPv4', async ({ page }) => {
    const tool = new ToolPage(page)
    await tool.goto('ip-geolocation')
    await tool.fillAndSubmit('8.8.8.8')
    await expect(tool.inputError).not.toBeVisible()
  })
})

// ─── ASN Lookup ───────────────────────────────────────────────────────────────
test.describe('ASN Lookup — validation', () => {
  test('shows error on empty submit', async ({ page }) => {
    const tool = new ToolPage(page)
    await tool.goto('asn-lookup')
    await tool.submitEmpty()
    await expect(tool.inputError).toBeVisible()
  })

  test('shows error for random text', async ({ page }) => {
    const tool = new ToolPage(page)
    await tool.goto('asn-lookup')
    await tool.fillAndSubmit('just some text')
    await expect(tool.inputError).toBeVisible()
    // Message mentions IP or ASN
    await expect(tool.inputError).toContainText('IP address or ASN')
  })

  test('accepts valid ASN', async ({ page }) => {
    const tool = new ToolPage(page)
    await tool.goto('asn-lookup')
    await tool.fillAndSubmit('AS15169')
    await expect(tool.inputError).not.toBeVisible()
  })

  test('accepts valid IP address', async ({ page }) => {
    const tool = new ToolPage(page)
    await tool.goto('asn-lookup')
    await tool.fillAndSubmit('8.8.8.8')
    await expect(tool.inputError).not.toBeVisible()
  })
})
