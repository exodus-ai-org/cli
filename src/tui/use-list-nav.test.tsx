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

const DOWN = `${ESC}[B`
const UP = `${ESC}[A`
const PAGE_UP = `${ESC}[5~`
const PAGE_DOWN = `${ESC}[6~`
const HOME = `${ESC}[H`
const END = `${ESC}[F`

// Sends every key before yielding, so a test also proves that presses landing
// in the same tick accumulate instead of overwriting each other.
async function press(stdin: { write: (data: string) => void }, ...keys: string[]) {
  for (const key of keys) stdin.write(key)
  await flush()
}

function WindowHarness({
  items,
  visibleCount,
  resetKey
}: {
  items: string[]
  visibleCount: number
  resetKey?: unknown
}) {
  const { selectedIndex, windowStart } = useListNav(items, { visibleCount, resetKey })
  return <Text>{`index:${selectedIndex} start:${windowStart}`}</Text>
}

const TEN = Array.from({ length: 10 }, (_, i) => `item-${i}`)

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

describe('useListNav windowing', () => {
  test('the window follows the selection down and back up', async () => {
    const { lastFrame, stdin } = render(<WindowHarness items={TEN} visibleCount={3} />)
    await press(stdin, DOWN, DOWN, DOWN)
    expect(lastFrame()).toBe('index:3 start:1')
    await press(stdin, UP, UP, UP)
    expect(lastFrame()).toBe('index:0 start:0')
  })

  test('Page Down and Page Up move the selection by a full window', async () => {
    const { lastFrame, stdin } = render(<WindowHarness items={TEN} visibleCount={3} />)
    await press(stdin, PAGE_DOWN, PAGE_DOWN)
    expect(lastFrame()).toBe('index:6 start:4')
    await press(stdin, PAGE_UP)
    expect(lastFrame()).toBe('index:3 start:3')
  })

  test('Page Down stops at the last item', async () => {
    const { lastFrame, stdin } = render(<WindowHarness items={TEN} visibleCount={4} />)
    await press(stdin, PAGE_DOWN, PAGE_DOWN, PAGE_DOWN)
    expect(lastFrame()).toBe('index:9 start:6')
  })

  test('End jumps to the last item and Home back to the first', async () => {
    const { lastFrame, stdin } = render(<WindowHarness items={TEN} visibleCount={3} />)
    await press(stdin, END)
    expect(lastFrame()).toBe('index:9 start:7')
    await press(stdin, HOME)
    expect(lastFrame()).toBe('index:0 start:0')
  })

  test('without visibleCount every item counts as visible and the window never scrolls', async () => {
    const { lastFrame, stdin } = render(<Harness items={['a', 'b', 'c']} onSelect={() => {}} />)
    await press(stdin, END)
    expect(lastFrame()).toBe('index:2')
  })

  test('the selection is clamped when the list shrinks beneath it', async () => {
    const { lastFrame, stdin, rerender } = render(<WindowHarness items={TEN} visibleCount={3} />)
    await press(stdin, END)
    rerender(<WindowHarness items={TEN.slice(0, 4)} visibleCount={3} />)
    await flush()
    expect(lastFrame()).toBe('index:3 start:1')
  })

  test('Enter picks the clamped item after the list shrinks', async () => {
    let selected: string | undefined
    const onSelect = (item: string) => (selected = item)
    const { stdin, rerender } = render(<Harness items={['a', 'b', 'c', 'd']} onSelect={onSelect} />)
    await press(stdin, END)
    rerender(<Harness items={['a', 'b']} onSelect={onSelect} />)
    await flush()
    await press(stdin, '\r')
    expect(selected).toBe('b')
  })

  test('changing resetKey returns to the top', async () => {
    const { lastFrame, stdin, rerender } = render(
      <WindowHarness items={TEN} visibleCount={3} resetKey="first" />
    )
    await press(stdin, END)
    rerender(<WindowHarness items={TEN} visibleCount={3} resetKey="second" />)
    await flush()
    expect(lastFrame()).toBe('index:0 start:0')
  })
})
