import { Box, Text, useWindowSize } from 'ink'
import React from 'react'

import { Panel } from './panel'

// A row is a title line, a subtitle line and a blank spacer.
const ROW_HEIGHT = 3

// Lines the list panel spends on itself: its border (2) and the overflow hint
// lines above and below the rows (2).
const PANEL_OVERHEAD = 4

// How many rows fit once `reservedRows` (everything on screen outside the
// list panel) is taken from the terminal height.
export function visibleRowCount(terminalRows: number, reservedRows: number): number {
  return Math.max(1, Math.floor((terminalRows - reservedRows - PANEL_OVERHEAD) / ROW_HEIGHT))
}

export function useVisibleCount(reservedRows: number): number {
  const { rows } = useWindowSize()
  return visibleRowCount(rows, reservedRows)
}

export function ListRow({
  selected,
  title,
  meta,
  metaColor,
  subtitle
}: {
  selected: boolean
  title: string
  meta: string
  metaColor?: string
  subtitle: string
}) {
  return (
    <Box flexDirection="column" marginBottom={1}>
      <Box>
        <Box flexGrow={1} flexShrink={1}>
          <Text bold={selected} color={selected ? 'cyan' : undefined} wrap="truncate-end">
            {selected ? '❯ ' : '  '}
            {title}
          </Text>
        </Box>
        <Box flexShrink={0} marginLeft={2}>
          <Text dimColor={!metaColor} color={metaColor}>
            {meta}
          </Text>
        </Box>
      </Box>
      <Text dimColor wrap="truncate-end">
        {'  '}
        {subtitle}
      </Text>
    </Box>
  )
}

export function ListView<T>({
  items,
  selectedIndex,
  windowStart,
  visibleCount,
  getKey,
  renderRow
}: {
  items: T[]
  selectedIndex: number
  windowStart: number
  visibleCount: number
  getKey: (item: T) => string
  renderRow: (item: T, selected: boolean) => React.ReactNode
}) {
  const end = Math.min(windowStart + visibleCount, items.length)
  const above = windowStart
  const below = items.length - end

  return (
    <Panel grow>
      <Text dimColor>{above > 0 ? `  ↑ ${above} more` : ' '}</Text>
      {items.slice(windowStart, end).map((item, offset) => {
        const index = windowStart + offset
        // The API can list the same skill twice, so the id alone is not unique.
        return (
          <React.Fragment key={`${getKey(item)}:${index}`}>
            {renderRow(item, index === selectedIndex)}
          </React.Fragment>
        )
      })}
      {/* Soaks up leftover height so the overflow line sits on the panel's bottom edge. */}
      <Box flexGrow={1} />
      <Box justifyContent="space-between">
        <Text dimColor>{below > 0 ? `  ↓ ${below} more` : ' '}</Text>
        <Text dimColor>
          {selectedIndex + 1}/{items.length}
        </Text>
      </Box>
    </Panel>
  )
}
