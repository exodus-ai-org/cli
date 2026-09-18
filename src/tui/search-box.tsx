import { Box, Text } from 'ink'
import TextInput from 'ink-text-input'
import React from 'react'

import { Panel } from './panel'

// Lines the search box takes on screen: its border plus one line of input.
export const SEARCH_BOX_ROWS = 3

export function SearchBox({ value, onChange }: { value: string; onChange: (value: string) => void }) {
  return (
    <Panel>
      <Box>
        <Text color="cyan" bold>
          {'/ '}
        </Text>
        <TextInput value={value} onChange={onChange} placeholder="Search skills…" />
      </Box>
    </Panel>
  )
}
