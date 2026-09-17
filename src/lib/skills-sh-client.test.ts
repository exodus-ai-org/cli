import { afterEach, beforeEach, describe, expect, jest, test } from 'bun:test'

import {
  getSkillAudit,
  getSkillDetail,
  listSkills,
  searchSkills,
  SkillsApiError
} from './skills-sh-client'

const BASE = 'https://fake-bff.example.test'

let fetchSpy: ReturnType<typeof jest.spyOn>

beforeEach(() => {
  fetchSpy = jest.spyOn(globalThis, 'fetch')
})

afterEach(() => {
  fetchSpy.mockRestore()
})

function jsonResponse(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' }
  })
}

describe('listSkills', () => {
  test('requests /api/v1/skills with view/page/perPage query params', async () => {
    fetchSpy.mockResolvedValue(
      jsonResponse({
        data: [],
        pagination: { page: 0, perPage: 10, total: 0, hasMore: false }
      })
    )
    await listSkills({ view: 'trending', page: 1, perPage: 10 }, BASE)
    const calledUrl = new URL(String(fetchSpy.mock.calls[0]?.[0]))
    expect(calledUrl.pathname).toBe('/api/v1/skills')
    expect(calledUrl.searchParams.get('view')).toBe('trending')
    expect(calledUrl.searchParams.get('page')).toBe('1')
    expect(calledUrl.searchParams.get('per_page')).toBe('10')
  })

  test('throws SkillsApiError on a non-2xx response', async () => {
    fetchSpy.mockResolvedValue(
      jsonResponse({ error: 'rate_limited', message: 'Too many requests' }, 429)
    )
    await expect(listSkills({}, BASE)).rejects.toThrow(SkillsApiError)
  })
})

describe('searchSkills', () => {
  test('requests /api/v1/skills/search with q/owner/limit query params', async () => {
    fetchSpy.mockResolvedValue(
      jsonResponse({ data: [], query: 'react native', searchType: 'semantic', count: 0, durationMs: 1 })
    )
    await searchSkills('react native', { owner: 'expo', limit: 5 }, BASE)
    const calledUrl = new URL(String(fetchSpy.mock.calls[0]?.[0]))
    expect(calledUrl.pathname).toBe('/api/v1/skills/search')
    expect(calledUrl.searchParams.get('q')).toBe('react native')
    expect(calledUrl.searchParams.get('owner')).toBe('expo')
    expect(calledUrl.searchParams.get('limit')).toBe('5')
  })
})

describe('getSkillDetail', () => {
  test('requests /api/v1/skills/{id} and returns the parsed body', async () => {
    fetchSpy.mockResolvedValue(
      jsonResponse({
        id: 'vercel-labs/skills/find-skills',
        source: 'vercel-labs/skills',
        slug: 'find-skills',
        installs: 24531,
        hash: 'a1b2c3d4e5f6',
        files: [{ path: 'SKILL.md', contents: '---\nname: Find Skills\n---' }]
      })
    )
    const detail = await getSkillDetail('vercel-labs/skills/find-skills', BASE)
    const calledUrl = new URL(String(fetchSpy.mock.calls[0]?.[0]))
    expect(calledUrl.pathname).toBe('/api/v1/skills/vercel-labs/skills/find-skills')
    expect(detail.slug).toBe('find-skills')
    expect(detail.files[0]?.path).toBe('SKILL.md')
  })
})

describe('getSkillAudit', () => {
  test('requests /api/v1/skills/audit/{id} and returns the audits array', async () => {
    fetchSpy.mockResolvedValue(
      jsonResponse({
        id: 'vercel-labs/skills/find-skills',
        source: 'vercel-labs/skills',
        slug: 'find-skills',
        audits: [
          {
            provider: 'Socket',
            slug: 'socket',
            status: 'pass',
            summary: 'No alerts',
            auditedAt: '2026-04-15T12:05:00.000Z'
          }
        ]
      })
    )
    const audit = await getSkillAudit('vercel-labs/skills/find-skills', BASE)
    const calledUrl = new URL(String(fetchSpy.mock.calls[0]?.[0]))
    expect(calledUrl.pathname).toBe('/api/v1/skills/audit/vercel-labs/skills/find-skills')
    expect(audit?.audits[0]?.provider).toBe('Socket')
  })

  test('returns null on 404 (no audits exist)', async () => {
    fetchSpy.mockResolvedValue(jsonResponse({ error: 'not_found', message: 'No audits' }, 404))
    const audit = await getSkillAudit('unaudited/skill', BASE)
    expect(audit).toBeNull()
  })
})
