import { describe, expect, test } from 'bun:test'
import { homedir } from 'node:os'
import { join } from 'node:path'

import { getExodusHome, getSkillsDir } from './paths'

describe('paths', () => {
  test('getExodusHome resolves to ~/.exodus', () => {
    expect(getExodusHome()).toBe(join(homedir(), '.exodus'))
  })

  test('getSkillsDir defaults to <exodusHome>/skills', () => {
    expect(getSkillsDir()).toBe(join(getExodusHome(), 'skills'))
  })

  test('getSkillsDir accepts an override home for testing', () => {
    expect(getSkillsDir('/tmp/fake-home')).toBe(join('/tmp/fake-home', 'skills'))
  })
})
