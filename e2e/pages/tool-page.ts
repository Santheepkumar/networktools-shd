import { type Page, type Locator } from '@playwright/test'

/**
 * Page Object Model for generic tool pages.
 * All forms share these base selectors via data-testid attributes.
 */
export class ToolPage {
  readonly page: Page

  // Form elements
  readonly input: Locator       // data-testid="tool-input"  (generic)
  readonly submitBtn: Locator   // data-testid="submit-btn"
  readonly inputError: Locator  // data-testid="input-error"

  // Result states
  readonly resultPanel: Locator   // data-testid="result-panel"
  readonly resultLoading: Locator // data-testid="result-loading"
  readonly resultError: Locator   // data-testid="result-error"

  constructor(page: Page) {
    this.page = page
    this.input = page.getByTestId('tool-input')
    this.submitBtn = page.getByTestId('submit-btn')
    this.inputError = page.getByTestId('input-error')
    this.resultPanel = page.getByTestId('result-panel')
    this.resultLoading = page.getByTestId('result-loading')
    this.resultError = page.getByTestId('result-error')
  }

  async goto(slug: string) {
    await this.page.goto(`/tools/${slug}`)
    await this.page.waitForLoadState('networkidle')
  }

  async fillAndSubmit(value: string) {
    await this.input.fill(value)
    await this.submitBtn.click()
  }

  async submitEmpty() {
    await this.submitBtn.click()
  }

  async waitForResult(timeoutMs = 25_000) {
    // Wait for loading to appear then disappear, OR result panel to appear directly
    await this.page.waitForFunction(
      () => {
        const panel = document.querySelector('[data-testid="result-panel"]')
        const err = document.querySelector('[data-testid="result-error"]')
        return panel !== null || err !== null
      },
      { timeout: timeoutMs }
    )
  }
}

/** DNS form has domain + record type selector */
export class DnsToolPage extends ToolPage {
  readonly domainInput: Locator
  readonly recordTypeSelect: Locator

  constructor(page: Page) {
    super(page)
    this.domainInput = page.getByTestId('domain-input')
    this.recordTypeSelect = page.getByTestId('record-type-select')
  }
}

/** DKIM form has two inputs */
export class DkimToolPage extends ToolPage {
  readonly domainInput: Locator
  readonly selectorInput: Locator

  constructor(page: Page) {
    super(page)
    this.domainInput = page.getByTestId('dkim-domain')
    this.selectorInput = page.getByTestId('dkim-selector')
  }
}

/** Port checker form */
export class PortCheckerPage extends ToolPage {
  readonly hostInput: Locator

  constructor(page: Page) {
    super(page)
    this.hostInput = page.getByTestId('host-input')
  }
}

/** Subnet calculator form */
export class SubnetCalcPage extends ToolPage {
  readonly cidrInput: Locator
  readonly prefixInput: Locator
  readonly cidrError: Locator
  readonly prefixError: Locator

  constructor(page: Page) {
    super(page)
    this.cidrInput = page.getByTestId('cidr-input')
    this.prefixInput = page.getByTestId('prefix-input')
    this.cidrError = page.getByTestId('cidr-error')
    this.prefixError = page.getByTestId('prefix-error')
  }
}
