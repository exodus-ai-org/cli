import { existsSync } from 'node:fs'
import { mkdir, readFile, rm, writeFile } from 'node:fs/promises'
import { join, resolve, sep } from 'node:path'

const LOCK_FILE = '.lock.json'

function resolveSafeFilePath(skillDir: string, filePath: string): string {
  const resolvedSkillDir = resolve(skillDir)
  const targetPath = resolve(skillDir, filePath)
  const isInside =
    targetPath === resolvedSkillDir || targetPath.startsWith(resolvedSkillDir + sep)
  if (!isInside) {
    throw new Error(`Refusing to write outside the skill directory: ${filePath}`)
  }
  return targetPath
}

export interface InstalledSkill {
  slug: string
  displayName: string
  version: string
  isActive: boolean
  installPath: string
  installedAt: number
  source?: string
}

export interface SkillsLockfile {
  skills: Record<string, Omit<InstalledSkill, 'slug'>>
}

export interface SkillFile {
  path: string
  contents: string
}

export interface SkillDetail {
  id: string
  source: string
  slug: string
  installs: number
  hash: string
  files: SkillFile[]
}

function getLockfilePath(skillsDir: string): string {
  return join(skillsDir, LOCK_FILE)
}

export async function readLockfile(skillsDir: string): Promise<SkillsLockfile> {
  try {
    const raw = await readFile(getLockfilePath(skillsDir), 'utf-8')
    return JSON.parse(raw) as SkillsLockfile
  } catch {
    return { skills: {} }
  }
}

export async function writeLockfile(skillsDir: string, lock: SkillsLockfile): Promise<void> {
  await mkdir(skillsDir, { recursive: true })
  await writeFile(getLockfilePath(skillsDir), JSON.stringify(lock, null, 2), 'utf-8')
}

function parseDisplayName(files: SkillFile[], fallback: string): string {
  const skillMd = files.find((f) => f.path === 'SKILL.md')
  if (!skillMd) return fallback
  const match = skillMd.contents.match(/^---[\s\S]*?name:\s*(.+)/m)
  return match?.[1]?.trim() || fallback
}

export async function installSkill(
  skillsDir: string,
  detail: SkillDetail
): Promise<InstalledSkill> {
  const skillDir = join(skillsDir, detail.slug)
  await mkdir(skillDir, { recursive: true })

  for (const file of detail.files) {
    const targetPath = resolveSafeFilePath(skillDir, file.path)
    await mkdir(join(targetPath, '..'), { recursive: true })
    await writeFile(targetPath, file.contents, 'utf-8')
  }

  const lock = await readLockfile(skillsDir)
  const installed: Omit<InstalledSkill, 'slug'> = {
    displayName: parseDisplayName(detail.files, detail.slug),
    version: detail.hash.slice(0, 12),
    isActive: true,
    installPath: skillDir,
    installedAt: Date.now(),
    source: 'skills.sh'
  }
  lock.skills[detail.slug] = installed
  await writeLockfile(skillsDir, lock)

  return { slug: detail.slug, ...installed }
}

export async function uninstallSkill(skillsDir: string, slug: string): Promise<void> {
  const lock = await readLockfile(skillsDir)
  const entry = lock.skills[slug]
  if (!entry) return
  if (existsSync(entry.installPath)) {
    await rm(entry.installPath, { recursive: true, force: true })
  }
  delete lock.skills[slug]
  await writeLockfile(skillsDir, lock)
}

export async function toggleSkillActive(
  skillsDir: string,
  slug: string,
  isActive: boolean
): Promise<void> {
  const lock = await readLockfile(skillsDir)
  const entry = lock.skills[slug]
  if (!entry) return
  entry.isActive = isActive
  await writeLockfile(skillsDir, lock)
}

export async function listInstalledSkills(skillsDir: string): Promise<InstalledSkill[]> {
  const lock = await readLockfile(skillsDir)
  return Object.entries(lock.skills).map(([slug, info]) => ({ slug, ...info }))
}
