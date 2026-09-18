import type { Command } from 'commander'
import { render } from 'ink'
import React from 'react'

import { getSkillDetail, searchSkills, type SkillListItem } from '../lib/skills-sh-client'
import { getSkillsDir } from '../lib/paths'
import {
  installSkill,
  listInstalledSkills,
  uninstallSkill,
  type InstalledSkill
} from '../lib/skills-store'
import { App } from '../tui/app'

interface JsonOpt {
  json?: boolean
  skillsDir?: string
}

export async function runSkillsSearch(
  query: string,
  opts: JsonOpt = {}
): Promise<SkillListItem[]> {
  const { data } = await searchSkills(query)
  if (opts.json) {
    console.log(JSON.stringify(data, null, 2))
  } else {
    for (const item of data) {
      console.log(`${item.id}  (${item.installs.toLocaleString()} installs)`)
    }
  }
  return data
}

export async function runSkillsInstall(
  id: string,
  opts: JsonOpt = {}
): Promise<InstalledSkill> {
  const detail = await getSkillDetail(id)
  const installed = await installSkill(opts.skillsDir ?? getSkillsDir(), detail)
  if (opts.json) {
    console.log(JSON.stringify(installed, null, 2))
  } else {
    console.log(`Installed "${installed.displayName}" (${installed.slug}).`)
  }
  return installed
}

export async function runSkillsList(opts: JsonOpt = {}): Promise<InstalledSkill[]> {
  const installed = await listInstalledSkills(opts.skillsDir ?? getSkillsDir())
  if (opts.json) {
    console.log(JSON.stringify(installed, null, 2))
  } else if (installed.length === 0) {
    console.log('No skills installed.')
  } else {
    for (const skill of installed) {
      console.log(`${skill.slug}  ${skill.isActive ? '(active)' : '(inactive)'}`)
    }
  }
  return installed
}

export async function runSkillsUninstall(slug: string, opts: JsonOpt = {}): Promise<void> {
  await uninstallSkill(opts.skillsDir ?? getSkillsDir(), slug)
  if (!opts.json) console.log(`Uninstalled ${slug}.`)
}

export function registerSkillsCommand(program: Command): Command {
  const skills = program
    .command('skills')
    .description('Browse and manage skills.sh skills')
    .action(() => {
      render(<App />)
    })

  skills
    .command('search <query>')
    .description('Search skills.sh')
    .option('--json', 'output JSON instead of a formatted list')
    .action(async (query: string, opts: { json?: boolean }) => {
      await runSkillsSearch(query, opts)
    })

  skills
    .command('install <id>')
    .description('Install a skill by id (e.g. vercel-labs/skills/find-skills)')
    .option('--json', 'output JSON instead of a formatted message')
    .action(async (id: string, opts: { json?: boolean }) => {
      await runSkillsInstall(id, opts)
    })

  skills
    .command('list')
    .description('List installed skills')
    .option('--json', 'output JSON instead of a formatted list')
    .action(async (opts: { json?: boolean }) => {
      await runSkillsList(opts)
    })

  skills
    .command('uninstall <slug>')
    .description('Uninstall a skill')
    .option('--json', 'output JSON instead of a formatted message')
    .action(async (slug: string, opts: { json?: boolean }) => {
      await runSkillsUninstall(slug, opts)
    })

  return skills
}
