import { Box } from 'ink'
import React from 'react'

// A rounded, dim-bordered box. `grow` lets it take whatever height is left.
export function Panel({ grow = false, children }: { grow?: boolean; children: React.ReactNode }) {
  return (
    <Box
      flexDirection="column"
      flexGrow={grow ? 1 : 0}
      borderStyle="round"
      borderDimColor
      paddingX={1}
    >
      {children}
    </Box>
  )
}

// A single horizontal line across the terminal.
export function Rule() {
  return (
    <Box
      borderStyle="single"
      borderDimColor
      borderTop
      borderBottom={false}
      borderLeft={false}
      borderRight={false}
    />
  )
}
