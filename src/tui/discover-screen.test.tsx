import { afterEach, beforeEach, describe, expect, jest, test } from 'bun:test'
import { render } from 'ink-testing-library'
import React from 'react'

import { DiscoverScreen } from './discover-screen'

function jsonResponse(body: unknown): Response {
  return new Response(JSON.stringify(body), { status: 200 })
}

const ESC = String.fromCharCode(27)
const END = `${ESC}[F`
const plain = (frame: string | undefined) => Bun.stripANSI(frame ?? '')
const settle = (ms = 20) => new Promise<void>((resolve) => setTimeout(resolve, ms))

function skills(count: number) {
  return Array.from({ length: count }, (_, i) => ({
    id: `owner/repo/skill-${i}`,
    slug: `skill-${i}`,
    name: `skill-${i}`,
    source: 'owner/repo',
    installs: 1000 + i,
    sourceType: 'github',
    installUrl: 'https://github.com/owner/repo',
    url: `https://skills.sh/owner/repo/skill-${i}`
  }))
}

function listResponse(count: number): Response {
  return jsonResponse({
    data: skills(count),
    pagination: { page: 0, perPage: 100, total: count, hasMore: false }
  })
}

describe('DiscoverScreen', () => {
  let fetchSpy: ReturnType<typeof jest.spyOn>
  beforeEach(() => {
    fetchSpy = jest.spyOn(globalThis, 'fetch').mockResolvedValue(
      jsonResponse({
        data: [
          {
            id: 'vercel-labs/skills/find-skills',
            slug: 'find-skills',
            name: 'find-skills',
            source: 'vercel-labs/skills',
            installs: 24531,
            sourceType: 'github',
            installUrl: 'https://github.com/vercel-labs/skills',
            url: 'https://skills.sh/vercel-labs/skills/find-skills'
          }
        ],
        pagination: { page: 0, perPage: 100, total: 1, hasMore: false }
      })
    )
  })
  afterEach(() => fetchSpy.mockRestore())

  test('renders the loaded skill name after mount', async () => {
    const { lastFrame } = render(<DiscoverScreen onSelect={() => {}} />)
    // allow the effect's async listSkills() call to resolve
    await new Promise((r) => setTimeout(r, 10))
    expect(lastFrame()).toContain('find-skills')
  })

  test('shows a placeholder in the search box until something is typed', async () => {
    const { lastFrame, stdin } = render(<DiscoverScreen onSelect={() => {}} />)
    await settle()
    expect(plain(lastFrame())).toContain('Search skills')
    stdin.write('f')
    await settle()
    expect(plain(lastFrame())).not.toContain('Search skills')
  })

  test('says when nothing matches the query', async () => {
    fetchSpy
      .mockResolvedValueOnce(listResponse(3))
      .mockResolvedValueOnce(
        jsonResponse({ data: [], query: 'q', searchType: 'fuzzy', count: 0, durationMs: 1 })
      )
    const { lastFrame, stdin } = render(<DiscoverScreen onSelect={() => {}} />)
    await settle()
    stdin.write('q')
    await settle()
    const frame = plain(lastFrame())
    expect(frame).toContain('No skills match')
    expect(frame).not.toContain('skill-0')
  })

  test('shows the install count beside the name and the source beneath it', async () => {
    const { lastFrame } = render(<DiscoverScreen onSelect={() => {}} />)
    await settle()
    const lines = plain(lastFrame()).split('\n')
    const nameLine = lines.findIndex((l) => l.includes('find-skills'))
    expect(lines[nameLine]).toMatch(new RegExp(`find-skills\\s+${(24531).toLocaleString()} installs`))
    expect(lines[nameLine + 1]).toContain('vercel-labs/skills')
  })

  test('renders only the first screenful of a long result list', async () => {
    fetchSpy.mockResolvedValue(listResponse(200))
    const { lastFrame } = render(<DiscoverScreen onSelect={() => {}} />)
    await settle()
    const frame = plain(lastFrame())
    expect(frame).toContain('skill-0')
    expect(frame).not.toContain('skill-199')
    expect(frame).toMatch(/↓ \d+ more/)
    expect(frame).toContain('1/200')
  })

  test('End scrolls the last result into view without typing into the search box', async () => {
    fetchSpy.mockResolvedValue(listResponse(200))
    const { lastFrame, stdin } = render(<DiscoverScreen onSelect={() => {}} />)
    await settle()
    stdin.write(END)
    await settle()
    const frame = plain(lastFrame())
    expect(frame).toContain('skill-199')
    expect(frame).not.toContain('skill-0')
    expect(frame).toContain('200/200')
    expect(frame).toContain('Search skills') // the placeholder is still there: End typed nothing
  })

  test('hides the position counter while a new search is loading', async () => {
    fetchSpy
      .mockResolvedValueOnce(listResponse(200))
      .mockReturnValueOnce(new Promise<Response>(() => {})) // a search that never comes back
    const { lastFrame, stdin } = render(<DiscoverScreen onSelect={() => {}} />)
    await settle()
    expect(plain(lastFrame())).toContain('1/200')
    stdin.write('x')
    await settle()
    const frame = plain(lastFrame())
    expect(frame).toContain('Loading')
    expect(frame).not.toContain('/200')
  })

  test('a new search starts back at the top of its results', async () => {
    fetchSpy
      .mockResolvedValueOnce(listResponse(200))
      .mockResolvedValueOnce(
        jsonResponse({ data: skills(5), query: 'x', searchType: 'fuzzy', count: 5, durationMs: 1 })
      )
    const { lastFrame, stdin } = render(<DiscoverScreen onSelect={() => {}} />)
    await settle()
    stdin.write(END)
    await settle()
    stdin.write('x')
    await settle()
    expect(plain(lastFrame())).toContain('1/5')
  })
})
