import { Box, Text, useInput } from 'ink'
import Spinner from 'ink-spinner'
import React, { useEffect, useState } from 'react'

import { getSkillsDir } from '../lib/paths'
import {
  getSkillAudit,
  getSkillDetail,
  type SkillAuditEntry,
  type SkillAuditResponse,
  type SkillListItem
} from '../lib/skills-sh-client'
import { installSkill, type SkillDetail as ClientSkillDetail } from '../lib/skills-store'
import { FooterHint } from './footer-hint'
import { Panel } from './panel'

const AUDIT_MARK: Record<SkillAuditEntry['status'], { glyph: string; color: string }> = {
  pass: { glyph: '✓', color: 'green' },
  warn: { glyph: '!', color: 'yellow' },
  fail: { glyph: '✗', color: 'red' }
}

export function DetailScreen({
  item,
  skillsDir = getSkillsDir(),
  onBack
}: {
  item: SkillListItem
  skillsDir?: string
  onBack: () => void
}) {
  const [detail, setDetail] = useState<ClientSkillDetail | null>(null)
  const [audit, setAudit] = useState<SkillAuditResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [installing, setInstalling] = useState(false)
  const [installed, setInstalled] = useState(false)
  const [installError, setInstallError] = useState<string | null>(null)
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
    if (key.return && detail && !installing && !installed) {
      setInstalling(true)
      setInstallError(null)
      installSkill(skillsDir, detail)
        .then(() => {
          setInstalling(false)
          setInstalled(true)
        })
        .catch((err: unknown) => {
          setInstalling(false)
          setInstallError(err instanceof Error ? err.message : 'Install failed')
        })
    }
  })

  const footer = (
    <FooterHint
      hints={[
        ...(installed ? [] : [{ key: 'Enter', label: 'install' }]),
        { key: 'Esc', label: 'go back' }
      ]}
    />
  )

  if (loading) {
    return (
      <Box flexDirection="column" flexGrow={1}>
        <Panel grow>
          <Box>
            <Text color="cyan">
              <Spinner type="dots" />
            </Text>
            <Text dimColor> Loading {item.name}…</Text>
          </Box>
        </Panel>
        {footer}
      </Box>
    )
  }

  if (error) {
    return (
      <Box flexDirection="column" flexGrow={1}>
        <Panel grow>
          <Text color="red">{error}</Text>
        </Panel>
        <FooterHint hints={[{ key: 'Esc', label: 'go back' }]} />
      </Box>
    )
  }

  return (
    <Box flexDirection="column" flexGrow={1}>
      <Panel grow>
        <Box justifyContent="space-between">
          <Text bold color="cyan" wrap="truncate-end">
            {item.name}
          </Text>
          <Box flexShrink={0} marginLeft={2}>
            <Text dimColor>{item.installs.toLocaleString()} installs</Text>
          </Box>
        </Box>
        <Text dimColor>{item.source}</Text>

        <Box marginTop={1} flexDirection="column">
          <Text bold>Security audit</Text>
          {!audit && <Text dimColor>No audit data available for this skill.</Text>}
          {audit?.audits.map((a) => {
            const mark = AUDIT_MARK[a.status]
            return (
              <Box key={a.slug}>
                <Text color={mark.color}>{mark.glyph} </Text>
                <Text>{a.provider}</Text>
                <Text dimColor>
                  {' · '}
                  {a.status}
                  {a.riskLevel ? ` (${a.riskLevel})` : ''}
                  {' · '}
                  {a.summary}
                </Text>
              </Box>
            )
          })}
        </Box>

        <Box marginTop={1} flexDirection="column">
          {installing ? (
            <Text color="cyan">
              <Spinner type="dots" /> Installing…
            </Text>
          ) : installed ? (
            <>
              <Text color="green">✓ Installed {item.name}</Text>
              <Text dimColor>Toggle or remove it from the Installed tab.</Text>
            </>
          ) : installError ? (
            <Text color="red">Install failed: {installError}</Text>
          ) : (
            <Text>Press Enter to install.</Text>
          )}
        </Box>
      </Panel>
      {footer}
    </Box>
  )
}
