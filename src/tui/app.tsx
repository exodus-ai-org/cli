import { Box, Text, useApp, useInput } from 'ink'
import React, { useState } from 'react'

import { getSkillsDir } from '../lib/paths'
import type { SkillListItem } from '../lib/skills-sh-client'
import { DetailScreen } from './detail-screen'
import { DiscoverScreen } from './discover-screen'
import { InstalledScreen } from './installed-screen'

type Tab = 'discover' | 'installed'

export function App({ skillsDir = getSkillsDir() }: { skillsDir?: string }) {
  const [tab, setTab] = useState<Tab>('discover')
  const [selected, setSelected] = useState<SkillListItem | null>(null)
  const { exit } = useApp()

  useInput((_input, key) => {
    if (selected) return // detail screen owns input while open
    if (key.tab) {
      setTab((t) => (t === 'discover' ? 'installed' : 'discover'))
    } else if (key.escape) {
      exit()
    }
  })

  return (
    <Box flexDirection="column">
      <Box marginBottom={1}>
        <Text bold={tab === 'discover'} inverse={tab === 'discover'}>
          {' Discover '}
        </Text>
        <Text bold={tab === 'installed'} inverse={tab === 'installed'}>
          {' Installed '}
        </Text>
      </Box>
      {selected ? (
        <DetailScreen
          item={selected}
          skillsDir={skillsDir}
          onBack={() => setSelected(null)}
          onInstalled={() => setSelected(null)}
        />
      ) : tab === 'discover' ? (
        <DiscoverScreen onSelect={setSelected} />
      ) : (
        <InstalledScreen skillsDir={skillsDir} />
      )}
    </Box>
  )
}
