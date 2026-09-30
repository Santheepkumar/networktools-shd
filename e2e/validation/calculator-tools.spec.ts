import { test, expect } from '@playwright/test'
import { ToolPage, SubnetCalcPage } from '../pages/tool-page'

// ─── CIDR Calculator ──────────────────────────────────────────────────────────
test.describe('CIDR Calculator — validation', () => {
  test('shows error on empty submit', async ({ page }) => {
    const tool = new ToolPage(page)
    await tool.goto('cidr-calculator')
    await tool.submitEmpty()
    await expect(tool.inputError).toBeVisible()
  })

  test('shows error for malformed CIDR (letters)', async ({ page }) => {
    const tool = new ToolPage(page)
    await tool.goto('cidr-calculator')
    await tool.fillAndSubmit('not.a.cidr/24')
    await expect(tool.inputError).toBeVisible()
    await expect(tool.inputError).toContainText('CIDR')
  })

  test('shows error for missing prefix', async ({ page }) => {
    const tool = new ToolPage(page)
    await tool.goto('cidr-calculator')
    await tool.fillAndSubmit('192.168.1.0')
    await expect(tool.inputError).toBeVisible()
  })

  test('shows error for out-of-range prefix /33', async ({ page }) => {
    const tool = new ToolPage(page)
    await tool.goto('cidr-calculator')
    await tool.fillAndSubmit('192.168.1.0/33')
    await expect(tool.inputError).toBeVisible()
  })

  test('accepts valid CIDR /24', async ({ page }) => {
    const tool = new ToolPage(page)
    await tool.goto('cidr-calculator')
    await tool.fillAndSubmit('192.168.1.0/24')
    await expect(tool.inputError).not.toBeVisible()
  })

  test('accepts /8 CIDR', async ({ page }) => {
    const tool = new ToolPage(page)
    await tool.goto('cidr-calculator')
    await tool.fillAndSubmit('10.0.0.0/8')
    await expect(tool.inputError).not.toBeVisible()
  })
})

// ─── Subnet Calculator ────────────────────────────────────────────────────────
test.describe('Subnet Calculator — validation', () => {
  test('shows error on empty CIDR', async ({ page }) => {
    const tool = new SubnetCalcPage(page)
    await tool.goto('subnet-calculator')
    await tool.submitBtn.click()
    await expect(tool.cidrError).toBeVisible()
    await expect(tool.cidrError).toContainText('required')
  })

  test('shows error for malformed CIDR', async ({ page }) => {
    const tool = new SubnetCalcPage(page)
    await tool.goto('subnet-calculator')
    await tool.cidrInput.fill('not-a-cidr')
    await tool.submitBtn.click()
    await expect(tool.cidrError).toBeVisible()
  })

  test('shows error when new prefix is smaller than parent', async ({ page }) => {
    const tool = new SubnetCalcPage(page)
    await tool.goto('subnet-calculator')
    await tool.cidrInput.fill('10.0.0.0/24')
    await tool.prefixInput.fill('16') // /16 < /24, invalid
    await tool.submitBtn.click()
    await expect(tool.prefixError).toBeVisible()
    await expect(tool.prefixError).toContainText('larger than parent')
  })

  test('shows error for equal prefix', async ({ page }) => {
    const tool = new SubnetCalcPage(page)
    await tool.goto('subnet-calculator')
    await tool.cidrInput.fill('10.0.0.0/24')
    await tool.prefixInput.fill('24') // same prefix, invalid
    await tool.submitBtn.click()
    await expect(tool.prefixError).toBeVisible()
  })

  test('shows error for prefix out of range (31+)', async ({ page }) => {
    const tool = new SubnetCalcPage(page)
    await tool.goto('subnet-calculator')
    await tool.cidrInput.fill('10.0.0.0/8')
    // Use triple-click select-all then type to replace the default value
    await tool.prefixInput.click({ clickCount: 3 })
    await tool.prefixInput.fill('31')
    await tool.submitBtn.click()
    // JS validation: 31 > 30 → should show prefix error
    await expect(tool.prefixError).toBeVisible()
  })

  test('accepts valid CIDR and larger prefix', async ({ page }) => {
    const tool = new SubnetCalcPage(page)
    await tool.goto('subnet-calculator')
    await tool.cidrInput.fill('10.0.0.0/8')
    await tool.prefixInput.fill('16')
    await tool.submitBtn.click()
    await expect(tool.cidrError).not.toBeVisible()
    await expect(tool.prefixError).not.toBeVisible()
  })
})
