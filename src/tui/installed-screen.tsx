import { Box, Text, useInput } from 'ink'
import React, { useEffect, useState } from 'react'

import { getSkillsDir } from '../lib/paths'
import {
  listInstalledSkills,
  toggleSkillActive,
  uninstallSkill,
  type InstalledSkill
} from '../lib/skills-store'
import { FOOTER_ROWS, FooterHint } from './footer-hint'
import { APP_CHROME_ROWS } from './layout'
import { ListRow, ListView, useVisibleCount } from './list-view'
import { Panel } from './panel'
import { useListNav } from './use-list-nav'

// Everything on this screen that is not the list panel.
const RESERVED_ROWS = APP_CHROME_ROWS + FOOTER_ROWS

export function InstalledScreen({ skillsDir = getSkillsDir() }: { skillsDir?: string }) {
  const [items, setItems] = useState<InstalledSkill[]>([])
  const [loading, setLoading] = useState(true)
  const [reloadToken, setReloadToken] = useState(0)
  const [actionError, setActionError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    listInstalledSkills(skillsDir).then((data) => {
      if (!cancelled) {
        setItems(data)
        setLoading(false)
      }
    })
    return () => {
      cancelled = true
    }
  }, [skillsDir, reloadToken])

  const visibleCount = useVisibleCount(RESERVED_ROWS)
  const { selectedIndex, windowStart } = useListNav(items, { visibleCount })

  useInput((input) => {
    // The error sits where the key hints go, so any key brings the hints back.
    setActionError(null)
    const item = items[selectedIndex]
    if (!item) return
    if (input === ' ') {
      toggleSkillActive(skillsDir, item.slug, !item.isActive)
        .then(() => setReloadToken((t) => t + 1))
        .catch((err: unknown) =>
          setActionError(err instanceof Error ? err.message : 'Failed to toggle skill')
        )
    } else if (input === 'x') {
      uninstallSkill(skillsDir, item.slug)
        .then(() => setReloadToken((t) => t + 1))
        .catch((err: unknown) =>
          setActionError(err instanceof Error ? err.message : 'Failed to uninstall skill')
        )
    }
  })

  return (
    <Box flexDirection="column" flexGrow={1}>
      {loading ? (
        <Panel grow>
          <Text dimColor>Loading…</Text>
        </Panel>
      ) : items.length === 0 ? (
        <Panel grow>
          <Text>No skills installed.</Text>
          <Text dimColor>Press Tab to discover skills.</Text>
        </Panel>
      ) : (
        <ListView
          items={items}
          selectedIndex={selectedIndex}
          windowStart={windowStart}
          visibleCount={visibleCount}
          getKey={(item) => item.slug}
          renderRow={(item, selected) => (
            <ListRow
              selected={selected}
              title={item.displayName}
              meta={item.isActive ? 'active' : 'inactive'}
              metaColor={item.isActive ? 'green' : undefined}
              subtitle={item.slug}
            />
          )}
        />
      )}
      {actionError ? (
        <Text color="red" wrap="truncate-end">
          {actionError}
        </Text>
      ) : (
        <FooterHint
          hints={[
            { key: '↑/↓', label: 'move' },
            { key: 'PgUp/PgDn', label: 'page' },
            { key: 'Space', label: 'toggle active' },
            { key: 'x', label: 'uninstall' },
            { key: 'Esc', label: 'quit' }
          ]}
        />
      )}
    </Box>
  )
}
