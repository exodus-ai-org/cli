import { Box, Text, useApp, useInput, useWindowSize } from 'ink'
import React, { useState } from 'react'

import { getSkillsDir } from '../lib/paths'
import type { SkillListItem } from '../lib/skills-sh-client'
import { DetailScreen } from './detail-screen'
import { DiscoverScreen } from './discover-screen'
import { InstalledScreen } from './installed-screen'
import { Rule } from './panel'

type Tab = 'discover' | 'installed'

export function App({ skillsDir = getSkillsDir() }: { skillsDir?: string }) {
  const [tab, setTab] = useState<Tab>('discover')
  const [selected, setSelected] = useState<SkillListItem | null>(null)
  const { exit } = useApp()
  const { rows } = useWindowSize()

  useInput((_input, key) => {
    if (selected) return // detail screen owns input while open
    if (key.tab) {
      setTab((t) => (t === 'discover' ? 'installed' : 'discover'))
    } else if (key.escape) {
      exit()
    }
  })

  return (
    <Box flexDirection="column" height={rows}>
      <Box justifyContent="space-between">
        <Box>
          <TabLabel label="Discover" active={tab === 'discover'} />
          <TabLabel label="Installed" active={tab === 'installed'} />
        </Box>
        <Text dimColor italic>
          Tab to switch
        </Text>
      </Box>
      <Rule />
      {selected ? (
        <DetailScreen item={selected} skillsDir={skillsDir} onBack={() => setSelected(null)} />
      ) : tab === 'discover' ? (
        <DiscoverScreen onSelect={setSelected} />
      ) : (
        <InstalledScreen skillsDir={skillsDir} />
      )}
    </Box>
  )
}

function TabLabel({ label, active }: { label: string; active: boolean }) {
  return (
    <Box marginRight={1}>
      <Text bold={active} inverse={active} dimColor={!active}>
        {` ${label} `}
      </Text>
    </Box>
  )
}
