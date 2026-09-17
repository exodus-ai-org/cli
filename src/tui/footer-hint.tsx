import { Text } from 'ink'
import React from 'react'

export function FooterHint({ hints }: { hints: Array<{ key: string; label: string }> }) {
  const text = hints.map((h) => `${h.key} to ${h.label}`).join(' · ')
  return (
    <Text dimColor italic>
      {text}
    </Text>
  )
}
