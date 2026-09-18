import { Text } from 'ink'
import React from 'react'

// Lines the footer takes on screen.
export const FOOTER_ROWS = 1

export function FooterHint({ hints }: { hints: Array<{ key: string; label: string }> }) {
  const text = hints.map((h) => `${h.key} to ${h.label}`).join(' · ')
  return (
    <Text dimColor italic wrap="truncate-end">
      {text}
    </Text>
  )
}
