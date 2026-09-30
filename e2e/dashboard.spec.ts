import { test, expect } from '@playwright/test'

test.describe('Dashboard', () => {
  test('homepage loads with StrawHatDevs brand badge', async ({ page }) => {
    await page.goto('/')
    await expect(page).toHaveTitle(/Network Tools/)
    await expect(page.getByText('StrawHatDevs', { exact: false }).first()).toBeVisible()
  })

  test('shows all tool category sections', async ({ page }) => {
    await page.goto('/')
    for (const category of ['DNS & Domain', 'Network', 'HTTP & Web', 'Security', 'Calculators']) {
      await expect(page.getByText(category, { exact: false }).first()).toBeVisible()
    }
  })

  test('shows at least 20 tool cards', async ({ page }) => {
    await page.goto('/')
    const cards = page.locator('a[href^="/tools/"]')
    await expect(cards).toHaveCount(21)
  })

  test('clicking DNS Lookup card navigates to tool page', async ({ page }) => {
    await page.goto('/')
    await page.getByText('DNS Lookup').first().click()
    await expect(page).toHaveURL('/tools/dns-lookup')
    await expect(page.getByTestId('submit-btn')).toBeVisible()
  })

  test('dark mode toggle works', async ({ page }) => {
    await page.goto('/')
    const html = page.locator('html')
    await page.getByRole('button', { name: /switch to dark mode/i }).click()
    await expect(html).toHaveClass(/dark/)
  })
})
