import { useInput } from 'ink'
import { useState } from 'react'

import { fitWindow } from './scroll-window'

interface NavState {
  selectedIndex: number
  windowStart: number
}

export function useListNav<T>(
  items: T[],
  opts: {
    onSelect?: (item: T, index: number) => void
    onEscape?: () => void
    // How many rows the list can show at once. Omit to treat every item as visible.
    visibleCount?: number
    // Selection and scroll position return to the top whenever this changes.
    resetKey?: unknown
  } = {}
): { selectedIndex: number; windowStart: number } {
  const [state, setState] = useState<NavState>({ selectedIndex: 0, windowStart: 0 })
  const [seenResetKey, setSeenResetKey] = useState(opts.resetKey)
  if (opts.resetKey !== seenResetKey) {
    setSeenResetKey(opts.resetKey)
    setState({ selectedIndex: 0, windowStart: 0 })
  }

  const total = items.length
  const lastIndex = Math.max(total - 1, 0)
  const visible = Math.max(opts.visibleCount ?? total, 1)
  // The list can shrink under a stored index (a new search returning fewer results).
  const selectedIndex = Math.min(state.selectedIndex, lastIndex)
  const windowStart = fitWindow({ start: state.windowStart, selected: selectedIndex, visible, total })

  const moveTo = (target: (current: number) => number) =>
    setState((prev) => {
      const current = Math.min(prev.selectedIndex, lastIndex)
      const next = Math.min(Math.max(target(current), 0), lastIndex)
      return {
        selectedIndex: next,
        windowStart: fitWindow({ start: prev.windowStart, selected: next, visible, total })
      }
    })

  useInput((_input, key) => {
    if (key.downArrow) {
      moveTo((i) => i + 1)
    } else if (key.upArrow) {
      moveTo((i) => i - 1)
    } else if (key.pageDown) {
      moveTo((i) => i + visible)
    } else if (key.pageUp) {
      moveTo((i) => i - visible)
    } else if (key.home) {
      moveTo(() => 0)
    } else if (key.end) {
      moveTo(() => lastIndex)
    } else if (key.return) {
      const item = items[selectedIndex]
      if (item !== undefined) opts.onSelect?.(item, selectedIndex)
    } else if (key.escape) {
      opts.onEscape?.()
    }
  })

  return { selectedIndex, windowStart }
}
