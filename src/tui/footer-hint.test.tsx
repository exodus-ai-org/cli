import { describe, expect, test } from 'bun:test'
import { render } from 'ink-testing-library'
import React from 'react'

import { FooterHint } from './footer-hint'

const plain = (frame: string | undefined) => Bun.stripANSI(frame ?? '')

describe('FooterHint', () => {
  test('joins the hints with a middle dot', () => {
    const { lastFrame } = render(
      <FooterHint
        hints={[
          { key: '↑/↓', label: 'move' },
          { key: 'Esc', label: 'quit' }
        ]}
      />
    )
    expect(plain(lastFrame())).toBe('↑/↓ to move · Esc to quit')
  })

  test('truncates instead of wrapping when the hints do not fit', () => {
    const hints = Array.from({ length: 12 }, (_, i) => ({ key: `Key${i}`, label: 'do something long' }))
    const frame = plain(render(<FooterHint hints={hints} />).lastFrame())
    expect(frame.split('\n')).toHaveLength(1)
    expect(frame.length).toBeLessThanOrEqual(100)
  })
})
