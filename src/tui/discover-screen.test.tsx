import { afterEach, beforeEach, describe, expect, jest, test } from 'bun:test'
import { render } from 'ink-testing-library'
import React from 'react'

import { DiscoverScreen } from './discover-screen'

function jsonResponse(body: unknown): Response {
  return new Response(JSON.stringify(body), { status: 200 })
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
})
