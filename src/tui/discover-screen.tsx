import { Box, Text } from 'ink'
import Spinner from 'ink-spinner'
import React, { useEffect, useState } from 'react'

import { listSkills, searchSkills, type SkillListItem } from '../lib/skills-sh-client'
import { FOOTER_ROWS, FooterHint } from './footer-hint'
import { APP_CHROME_ROWS } from './layout'
import { ListRow, ListView, useVisibleCount } from './list-view'
import { Panel } from './panel'
import { SEARCH_BOX_ROWS, SearchBox } from './search-box'
import { useListNav } from './use-list-nav'

// Everything on this screen that is not the list panel.
const RESERVED_ROWS = APP_CHROME_ROWS + SEARCH_BOX_ROWS + FOOTER_ROWS

export function DiscoverScreen({ onSelect }: { onSelect: (item: SkillListItem) => void }) {
  const [query, setQuery] = useState('')
  const [items, setItems] = useState<SkillListItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    setError(null)
    const trimmed = query.trim()
    const request = trimmed
      ? searchSkills(trimmed).then((r) => r.data)
      : listSkills({ view: 'all-time' }).then((r) => r.data)
    request
      .then((data) => {
        if (!cancelled) setItems(data)
      })
      .catch((err: unknown) => {
        if (!cancelled) setError(err instanceof Error ? err.message : 'Failed to load skills')
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [query])

  const visibleCount = useVisibleCount(RESERVED_ROWS)
  // A fresh result set (new search) starts back at the top.
  const { selectedIndex, windowStart } = useListNav(items, {
    onSelect,
    visibleCount,
    resetKey: items
  })

  return (
    <Box flexDirection="column" flexGrow={1}>
      <SearchBox value={query} onChange={setQuery} />
      {loading ? (
        <Panel grow>
          <Box>
            <Text color="cyan">
              <Spinner type="dots" />
            </Text>
            <Text dimColor> Loading…</Text>
          </Box>
        </Panel>
      ) : error ? (
        <Panel grow>
          <Text color="red">{error}</Text>
        </Panel>
      ) : items.length === 0 ? (
        <Panel grow>
          <Text dimColor>
            {query.trim() ? `No skills match "${query.trim()}".` : 'No skills found.'}
          </Text>
        </Panel>
      ) : (
        <ListView
          items={items}
          selectedIndex={selectedIndex}
          windowStart={windowStart}
          visibleCount={visibleCount}
          getKey={(item) => item.id}
          renderRow={(item, selected) => (
            <ListRow
              selected={selected}
              title={item.name}
              meta={`${item.installs.toLocaleString()} installs`}
              subtitle={item.source}
            />
          )}
        />
      )}
      <FooterHint
        hints={[
          { key: 'Type', label: 'search' },
          { key: '↑/↓', label: 'move' },
          { key: 'PgUp/PgDn', label: 'page' },
          { key: 'Enter', label: 'view' },
          { key: 'Esc', label: 'go back' }
        ]}
      />
    </Box>
  )
}
