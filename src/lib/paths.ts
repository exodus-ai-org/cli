import { homedir } from 'node:os'
import { join } from 'node:path'

export function getExodusHome(): string {
  return join(homedir(), '.exodus')
}

export function getSkillsDir(exodusHome: string = getExodusHome()): string {
  return join(exodusHome, 'skills')
}
