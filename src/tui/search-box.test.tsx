import { describe, expect, test } from 'bun:test'
import { render } from 'ink-testing-library'
import React from 'react'

import { SearchBox } from './search-box'

const plain = (frame: string | undefined) => Bun.stripANSI(frame ?? '')

describe('SearchBox', () => {
  test('shows a placeholder inside a bordered box while the query is empty', () => {
    const lines = plain(render(<SearchBox value="" onChange={() => {}} />).lastFrame()).split('\n')
    expect(lines).toHaveLength(3)
    expect(lines[0]).toMatch(/^╭─+╮$/)
    expect(lines[1]).toContain('Search skills')
  })

  test('shows the query in place of the placeholder', () => {
    const frame = plain(render(<SearchBox value="design" onChange={() => {}} />).lastFrame())
    expect(frame).toContain('design')
    expect(frame).not.toContain('Search skills')
  })
})
