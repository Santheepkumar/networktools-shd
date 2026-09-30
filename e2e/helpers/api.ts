import { test, expect } from '@playwright/test'

const BASE = process.env.BASE_URL || 'http://localhost:3002'

/** Shared helper for POST API calls */
export async function apiPost(
  request: Parameters<typeof test>[1] extends (args: infer A) => any
    ? never
    : any,
  path: string,
  data: object
) {
  return request.post(`${BASE}${path}`, { data })
}

export { BASE }
