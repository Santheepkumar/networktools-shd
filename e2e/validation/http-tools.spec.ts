import { test, expect } from '@playwright/test'
import { ToolPage } from '../pages/tool-page'

// ─── HTTP Status ──────────────────────────────────────────────────────────────
test.describe('HTTP Status — validation', () => {
  test('shows error on empty submit', async ({ page }) => {
    const tool = new ToolPage(page)
    await tool.goto('http-status')
    await tool.submitEmpty()
    await expect(tool.inputError).toBeVisible()
  })

  test('shows error for domain without protocol', async ({ page }) => {
    const tool = new ToolPage(page)
    await tool.goto('http-status')
    await tool.fillAndSubmit('example.com')
    await expect(tool.inputError).toBeVisible()
    await expect(tool.inputError).toContainText('https://')
  })

  test('shows error for ftp:// protocol', async ({ page }) => {
    const tool = new ToolPage(page)
    await tool.goto('http-status')
    await tool.fillAndSubmit('ftp://example.com')
    await expect(tool.inputError).toBeVisible()
    await expect(tool.inputError).toContainText('http')
  })

  test('accepts https:// URL', async ({ page }) => {
    const tool = new ToolPage(page)
    await tool.goto('http-status')
    await tool.fillAndSubmit('https://example.com')
    await expect(tool.inputError).not.toBeVisible()
  })

  test('accepts http:// URL', async ({ page }) => {
    const tool = new ToolPage(page)
    await tool.goto('http-status')
    await tool.fillAndSubmit('http://example.com')
    await expect(tool.inputError).not.toBeVisible()
  })
})

// ─── HTTP Headers ─────────────────────────────────────────────────────────────
test.describe('HTTP Headers — validation', () => {
  test('shows error on empty submit', async ({ page }) => {
    const tool = new ToolPage(page)
    await tool.goto('http-headers')
    await tool.submitEmpty()
    await expect(tool.inputError).toBeVisible()
  })

  test('shows error for URL without protocol', async ({ page }) => {
    const tool = new ToolPage(page)
    await tool.goto('http-headers')
    await tool.fillAndSubmit('cloudflare.com')
    await expect(tool.inputError).toBeVisible()
    await expect(tool.inputError).toContainText('https://')
  })

  test('accepts valid https URL', async ({ page }) => {
    const tool = new ToolPage(page)
    await tool.goto('http-headers')
    await tool.fillAndSubmit('https://cloudflare.com')
    await expect(tool.inputError).not.toBeVisible()
  })
})

// ─── HTTP Redirects ───────────────────────────────────────────────────────────
test.describe('HTTP Redirects — validation', () => {
  test('shows error on empty submit', async ({ page }) => {
    const tool = new ToolPage(page)
    await tool.goto('http-redirects')
    await tool.submitEmpty()
    await expect(tool.inputError).toBeVisible()
  })

  test('shows error for plain domain without protocol', async ({ page }) => {
    const tool = new ToolPage(page)
    await tool.goto('http-redirects')
    await tool.fillAndSubmit('example.com')
    await expect(tool.inputError).toBeVisible()
  })

  test('accepts http:// URL', async ({ page }) => {
    const tool = new ToolPage(page)
    await tool.goto('http-redirects')
    await tool.fillAndSubmit('http://example.com')
    await expect(tool.inputError).not.toBeVisible()
  })
})
