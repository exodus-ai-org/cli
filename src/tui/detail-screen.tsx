import { Box, Text, useInput } from 'ink'
import Spinner from 'ink-spinner'
import React, { useEffect, useState } from 'react'

import { getSkillsDir } from '../lib/paths'
import {
  getSkillAudit,
  getSkillDetail,
  type SkillAuditResponse,
  type SkillListItem
} from '../lib/skills-sh-client'
import { installSkill, type SkillDetail as ClientSkillDetail } from '../lib/skills-store'
import { FooterHint } from './footer-hint'

export function DetailScreen({
  item,
  skillsDir = getSkillsDir(),
  onBack,
  onInstalled
}: {
  item: SkillListItem
  skillsDir?: string
  onBack: () => void
  onInstalled: () => void
}) {
  const [detail, setDetail] = useState<ClientSkillDetail | null>(null)
  const [audit, setAudit] = useState<SkillAuditResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [installing, setInstalling] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    Promise.all([getSkillDetail(item.id), getSkillAudit(item.id)])
      .then(([d, a]) => {
        if (cancelled) return
        setDetail(d)
        setAudit(a)
      })
      .catch((err: unknown) => {
        if (!cancelled) setError(err instanceof Error ? err.message : 'Failed to load skill details')
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [item.id])

  useInput((_input, key) => {
    if (key.escape) {
      onBack()
      return
    }
    if (key.return && detail && !installing) {
      setInstalling(true)
      installSkill(skillsDir, detail).then(() => {
        setInstalling(false)
        onInstalled()
      })
    }
  })

  if (loading) {
    return (
      <Box>
        <Text color="cyan">
          <Spinner type="dots" />
        </Text>
        <Text> Loading {item.name}…</Text>
      </Box>
    )
  }

  if (error) {
    return (
      <Box flexDirection="column">
        <Text color="red">{error}</Text>
        <FooterHint hints={[{ key: 'Esc', label: 'go back' }]} />
      </Box>
    )
  }

  return (
    <Box flexDirection="column">
      <Text bold>{item.name}</Text>
      <Text dimColor>{item.source}</Text>
      <Box marginTop={1} flexDirection="column">
        <Text underline>Security audit</Text>
        {!audit && <Text dimColor>No audit data available for this skill.</Text>}
        {audit?.audits.map((a) => (
          <Text key={a.slug}>
            {a.provider}: {a.status}
            {a.riskLevel ? ` (${a.riskLevel})` : ''} — {a.summary}
          </Text>
        ))}
      </Box>
      <Box marginTop={1}>
        {installing ? (
          <Text color="cyan">
            <Spinner type="dots" /> Installing…
          </Text>
        ) : (
          <Text>Press Enter to install.</Text>
        )}
      </Box>
      <FooterHint
        hints={[
          { key: 'Enter', label: 'install' },
          { key: 'Esc', label: 'go back' }
        ]}
      />
    </Box>
  )
}
