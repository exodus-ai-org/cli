import { Box, Text } from 'ink'
import Spinner from 'ink-spinner'
import TextInput from 'ink-text-input'
import React, { useEffect, useState } from 'react'

import { listSkills, searchSkills, type SkillListItem } from '../lib/skills-sh-client'
import { FooterHint } from './footer-hint'
import { useListNav } from './use-list-nav'

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

  const { selectedIndex } = useListNav(items, { onSelect })

  return (
    <Box flexDirection="column">
      <Box>
        <Text>Search: </Text>
        <TextInput value={query} onChange={setQuery} />
      </Box>
      {loading && (
        <Box>
          <Text color="cyan">
            <Spinner type="dots" />
          </Text>
          <Text> Loading…</Text>
        </Box>
      )}
      {error && <Text color="red">{error}</Text>}
      {!loading &&
        !error &&
        items.map((item, i) => (
          <Text key={item.id} inverse={i === selectedIndex}>
            {item.name} · {item.source} · {item.installs.toLocaleString()} installs
          </Text>
        ))}
      <FooterHint
        hints={[
          { key: 'Type', label: 'search' },
          { key: '↑/↓', label: 'move' },
          { key: 'Enter', label: 'view' },
          { key: 'Esc', label: 'go back' }
        ]}
      />
    </Box>
  )
}
