import { afterEach, beforeEach, describe, expect, jest, test } from 'bun:test'
import { mkdtemp, rm } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { render } from 'ink-testing-library'
import React from 'react'

import { App } from './app'

let skillsDir: string
let fetchSpy: ReturnType<typeof jest.spyOn>

beforeEach(async () => {
  skillsDir = await mkdtemp(join(tmpdir(), 'exodus-cli-app-'))
  fetchSpy = jest.spyOn(globalThis, 'fetch').mockResolvedValue(
    new Response(
      JSON.stringify({ data: [], pagination: { page: 0, perPage: 100, total: 0, hasMore: false } }),
      { status: 200 }
    )
  )
})

afterEach(async () => {
  fetchSpy.mockRestore()
  await rm(skillsDir, { recursive: true, force: true })
})

describe('App', () => {
  test('starts on the Discover tab', async () => {
    const { lastFrame } = render(<App skillsDir={skillsDir} />)
    await new Promise((r) => setTimeout(r, 10))
    expect(lastFrame()).toContain('Discover')
    expect(lastFrame()).toContain('Installed')
  })

  test('Tab switches to the Installed tab', async () => {
    const { lastFrame, stdin } = render(<App skillsDir={skillsDir} />)
    await new Promise((r) => setTimeout(r, 10))
    stdin.write('\t')
    await new Promise((r) => setTimeout(r, 10))
    expect(lastFrame()).toContain('No skills installed')
  })
})
