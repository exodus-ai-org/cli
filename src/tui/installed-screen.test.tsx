import { afterEach, beforeEach, describe, expect, test } from 'bun:test'
import { mkdtemp, rm } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { render } from 'ink-testing-library'
import React from 'react'

import { installSkill } from '../lib/skills-store'
import { InstalledScreen } from './installed-screen'

let skillsDir: string

beforeEach(async () => {
  skillsDir = await mkdtemp(join(tmpdir(), 'exodus-cli-installed-screen-'))
  await installSkill(skillsDir, {
    id: 'vercel-labs/skills/find-skills',
    source: 'vercel-labs/skills',
    slug: 'find-skills',
    installs: 1,
    hash: 'deadbeefcafefeed',
    files: [{ path: 'SKILL.md', contents: '---\nname: Find Skills\n---' }]
  })
})

afterEach(async () => {
  await rm(skillsDir, { recursive: true, force: true })
})

describe('InstalledScreen', () => {
  test('renders the installed skill after mount', async () => {
    const { lastFrame } = render(<InstalledScreen skillsDir={skillsDir} />)
    await new Promise((r) => setTimeout(r, 10))
    expect(lastFrame()).toContain('Find Skills')
  })

  test('shows a message when nothing is installed', async () => {
    const emptyDir = await mkdtemp(join(tmpdir(), 'exodus-cli-installed-screen-empty-'))
    const { lastFrame } = render(<InstalledScreen skillsDir={emptyDir} />)
    await new Promise((r) => setTimeout(r, 10))
    expect(lastFrame()).toContain('No skills installed')
    await rm(emptyDir, { recursive: true, force: true })
  })
})
