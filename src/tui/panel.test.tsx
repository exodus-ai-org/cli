import { describe, expect, test } from 'bun:test'
import { Text } from 'ink'
import { render } from 'ink-testing-library'
import React from 'react'

import { Panel, Rule } from './panel'

const plain = (frame: string | undefined) => Bun.stripANSI(frame ?? '')

describe('Panel', () => {
  test('draws a rounded border around its content, stretched to the terminal width', () => {
    const lines = plain(
      render(
        <Panel>
          <Text>inside</Text>
        </Panel>
      ).lastFrame()
    ).split('\n')
    expect(lines).toHaveLength(3)
    expect(lines[0]).toMatch(/^╭─+╮$/)
    expect(lines[1]).toMatch(/^│ inside\s+│$/)
    expect(lines[2]).toMatch(/^╰─+╯$/)
    expect(lines[0]).toHaveLength(100)
  })
})

describe('Rule', () => {
  test('draws a single full-width horizontal line', () => {
    const frame = plain(render(<Rule />).lastFrame())
    expect(frame).toMatch(/^─+$/)
    expect(frame).toHaveLength(100)
  })
})
