import { describe, expect, test } from 'bun:test'

import { fitWindow } from './scroll-window'

describe('fitWindow', () => {
  test('starts at 0 when every item fits in the window', () => {
    expect(fitWindow({ start: 3, selected: 1, visible: 10, total: 5 })).toBe(0)
  })

  test('leaves the window where it is while the selection stays inside it', () => {
    expect(fitWindow({ start: 4, selected: 6, visible: 5, total: 20 })).toBe(4)
  })

  test('scrolls up just enough to reveal a selection above the window', () => {
    expect(fitWindow({ start: 4, selected: 2, visible: 5, total: 20 })).toBe(2)
  })

  test('scrolls down just enough to reveal a selection below the window', () => {
    expect(fitWindow({ start: 0, selected: 5, visible: 5, total: 20 })).toBe(1)
  })

  test('pulls the window back when the list shrinks beneath it', () => {
    expect(fitWindow({ start: 15, selected: 8, visible: 5, total: 9 })).toBe(4)
  })
})
