import { describe, expect, test } from 'bun:test'
import { render } from 'ink-testing-library'
import { Text } from 'ink'
import React from 'react'

import { useListNav } from './use-list-nav'

function Harness({ items, onSelect }: { items: string[]; onSelect: (item: string) => void }) {
  const { selectedIndex } = useListNav(items, { onSelect: (item) => onSelect(item) })
  return <Text>{`index:${selectedIndex}`}</Text>
}

// Ink's key parser only recognizes arrow keys from the full ANSI escape
// sequence (an ESC byte followed by the CSI final byte) — e.g. down-arrow is
// ESC + "[B", not bare "[B". `useInput` also routes stdin data through
// React's discreteUpdates, which schedules the resulting state update
// instead of flushing it synchronously, so tests must await a tick before
// asserting on `lastFrame()`.
const ESC = String.fromCharCode(27)
const flush = () => new Promise<void>((resolve) => setImmediate(resolve))

describe('useListNav', () => {
  test('starts at index 0', () => {
    const { lastFrame } = render(<Harness items={['a', 'b', 'c']} onSelect={() => {}} />)
    expect(lastFrame()).toBe('index:0')
  })

  test('down arrow advances, up arrow retreats, clamped to bounds', async () => {
    const { lastFrame, stdin } = render(<Harness items={['a', 'b', 'c']} onSelect={() => {}} />)
    stdin.write(`${ESC}[B`) // down
    await flush()
    expect(lastFrame()).toBe('index:1')
    stdin.write(`${ESC}[B`) // down
    stdin.write(`${ESC}[B`) // down (would overshoot past index 2)
    await flush()
    expect(lastFrame()).toBe('index:2')
    stdin.write(`${ESC}[A`) // up
    await flush()
    expect(lastFrame()).toBe('index:1')
  })

  test('enter calls onSelect with the item at the current index', async () => {
    let selected: string | undefined
    const { stdin } = render(
      <Harness items={['a', 'b', 'c']} onSelect={(item) => (selected = item)} />
    )
    stdin.write(`${ESC}[B`)
    await flush()
    stdin.write('\r')
    await flush()
    expect(selected).toBe('b')
  })
})
