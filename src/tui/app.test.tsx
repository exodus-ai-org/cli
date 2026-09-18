import { afterEach, beforeEach, describe, expect, jest, test } from 'bun:test'
import { Text, useWindowSize } from 'ink'
import { render } from 'ink-testing-library'
import { mkdtemp, rm } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import React from 'react'

import { App } from './app'

const plain = (frame: string | undefined) => Bun.stripANSI(frame ?? '')

// Polls until the frame contains `text`, since screens load their data asynchronously.
async function waitForText(lastFrame: () => string | undefined, text: string): Promise<string> {
  const deadline = Date.now() + 1000
  while (Date.now() < deadline) {
    const frame = plain(lastFrame())
    if (frame.includes(text)) return frame
    await new Promise((r) => setTimeout(r, 5))
  }
  throw new Error(`Timed out waiting for "${text}" in:\n${plain(lastFrame())}`)
}

// The height Ink believes the terminal has under the test renderer.
function terminalRows(): number {
  function Probe() {
    return <Text>{useWindowSize().rows}</Text>
  }
  return Number(render(<Probe />).lastFrame())
}

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
    const frame = await waitForText(lastFrame, 'No skills found')
    expect(frame).toContain('Discover')
    expect(frame).toContain('Installed')
  })

  test('fills the terminal height and separates the tab bar with a rule', async () => {
    const { lastFrame } = render(<App skillsDir={skillsDir} />)
    const lines = (await waitForText(lastFrame, 'No skills found')).split('\n')
    expect(lines[0]).toContain('Discover')
    expect(lines[1]).toMatch(/^─+$/)
    expect(lines).toHaveLength(terminalRows())
  })

  test('tells the user that Tab switches tabs', async () => {
    const { lastFrame } = render(<App skillsDir={skillsDir} />)
    const frame = await waitForText(lastFrame, 'No skills found')
    expect(frame.split('\n')[0]).toContain('Tab to switch')
  })

  test('Tab switches to the Installed tab', async () => {
    const { lastFrame, stdin } = render(<App skillsDir={skillsDir} />)
    await waitForText(lastFrame, 'No skills found')
    stdin.write('\t')
    await waitForText(lastFrame, 'No skills installed')
  })
})
