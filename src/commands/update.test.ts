import { describe, expect, spyOn, test } from 'bun:test'

import * as updater from '../lib/updater'
import { runUpdate } from './update'

describe('runUpdate', () => {
  test('reports up to date without side effects', async () => {
    const spy = spyOn(updater, 'checkForUpdate').mockResolvedValue({
      updateAvailable: false,
      current: '0.1.0'
    })
    const result = await runUpdate({ check: true })
    expect(result?.updateAvailable).toBe(false)
    spy.mockRestore()
  })

  test('reports an available update', async () => {
    const spy = spyOn(updater, 'checkForUpdate').mockResolvedValue({
      updateAvailable: true,
      current: '0.1.0',
      latest: '0.2.0'
    })
    const result = await runUpdate({ check: true })
    expect(result).toEqual({ updateAvailable: true, current: '0.1.0', latest: '0.2.0' })
    spy.mockRestore()
  })

  test('resolves to null and sets a non-zero exit code when checkForUpdate rejects', async () => {
    const spy = spyOn(updater, 'checkForUpdate').mockRejectedValue(new Error('offline'))
    const errorSpy = spyOn(console, 'error').mockImplementation(() => {})

    const result = await runUpdate({ check: true })

    expect(result).toBeNull()
    expect(process.exitCode).toBe(1)

    spy.mockRestore()
    errorSpy.mockRestore()
    process.exitCode = undefined
  })
})
