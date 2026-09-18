import { Box, Text, useInput } from 'ink'
import React, { useEffect, useState } from 'react'

import { getSkillsDir } from '../lib/paths'
import {
  listInstalledSkills,
  toggleSkillActive,
  uninstallSkill,
  type InstalledSkill
} from '../lib/skills-store'
import { FooterHint } from './footer-hint'
import { useListNav } from './use-list-nav'

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

  const { selectedIndex } = useListNav(items, {})

  useInput((input) => {
    const item = items[selectedIndex]
    if (!item) return
    if (input === ' ') {
      setActionError(null)
      toggleSkillActive(skillsDir, item.slug, !item.isActive)
        .then(() => setReloadToken((t) => t + 1))
        .catch((err: unknown) =>
          setActionError(err instanceof Error ? err.message : 'Failed to toggle skill')
        )
    } else if (input === 'x') {
      setActionError(null)
      uninstallSkill(skillsDir, item.slug)
        .then(() => setReloadToken((t) => t + 1))
        .catch((err: unknown) =>
          setActionError(err instanceof Error ? err.message : 'Failed to uninstall skill')
        )
    }
  })

  return (
    <Box flexDirection="column">
      {loading && <Text>Loading…</Text>}
      {!loading && items.length === 0 && <Text>No skills installed.</Text>}
      {!loading &&
        items.map((item, i) => (
          <Text key={item.slug} inverse={i === selectedIndex}>
            {item.displayName} ({item.slug}) · {item.isActive ? 'active' : 'inactive'}
          </Text>
        ))}
      {actionError && <Text color="red">{actionError}</Text>}
      <FooterHint
        hints={[
          { key: '↑/↓', label: 'move' },
          { key: 'Space', label: 'toggle active' },
          { key: 'x', label: 'uninstall' },
          { key: 'Esc', label: 'quit' }
        ]}
      />
    </Box>
  )
}
