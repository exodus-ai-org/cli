import { useInput } from 'ink'
import { useState } from 'react'

export function useListNav<T>(
  items: T[],
  opts: { onSelect?: (item: T, index: number) => void; onEscape?: () => void } = {}
): { selectedIndex: number } {
  const [selectedIndex, setSelectedIndex] = useState(0)

  useInput((_input, key) => {
    if (key.downArrow) {
      setSelectedIndex((i) => Math.min(i + 1, Math.max(items.length - 1, 0)))
    } else if (key.upArrow) {
      setSelectedIndex((i) => Math.max(i - 1, 0))
    } else if (key.return) {
      const item = items[selectedIndex]
      if (item !== undefined) opts.onSelect?.(item, selectedIndex)
    } else if (key.escape) {
      opts.onEscape?.()
    }
  })

  return { selectedIndex }
}
