import { describe, expect, test } from 'bun:test'

import { openExodusApp } from './open-app'

describe('openExodusApp', () => {
  test('darwin: reports not-found when Exodus.app is not installed', async () => {
    // CI/dev sandboxes never have Exodus.app installed, so `open -a Exodus`
    // genuinely fails here — this exercises the real code path, no mocking.
    const result = await openExodusApp('darwin')
    expect(result.status).toBe('not-found')
  })

  test('win32: reports not-found when no known install path exists', async () => {
    const result = await openExodusApp('win32')
    expect(result.status).toBe('not-found')
  })

  test('linux: reports not-found when `exodus` is not on PATH', async () => {
    const result = await openExodusApp('linux')
    expect(result.status).toBe('not-found')
  })

  test('unsupported platform reports not-found rather than throwing', async () => {
    const result = await openExodusApp('sunos' as NodeJS.Platform)
    expect(result.status).toBe('not-found')
  })
})
