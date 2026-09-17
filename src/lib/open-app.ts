import { join } from 'node:path'

export type OpenAppResult = { status: 'opened' } | { status: 'not-found' }

async function tryDarwin(): Promise<OpenAppResult> {
  const proc = Bun.spawn(['open', '-a', 'Exodus'], { stdout: 'ignore', stderr: 'ignore' })
  const exitCode = await proc.exited
  return exitCode === 0 ? { status: 'opened' } : { status: 'not-found' }
}

async function tryWin32(): Promise<OpenAppResult> {
  const candidates = [
    join(process.env.LOCALAPPDATA ?? '', 'Programs', 'Exodus', 'Exodus.exe'),
    join(process.env.ProgramFiles ?? '', 'Exodus', 'Exodus.exe')
  ]
  for (const exePath of candidates) {
    if (await Bun.file(exePath).exists()) {
      Bun.spawn([exePath], { stdout: 'ignore', stderr: 'ignore' })
      return { status: 'opened' }
    }
  }
  return { status: 'not-found' }
}

async function tryLinux(): Promise<OpenAppResult> {
  const check = Bun.spawn(['sh', '-c', 'command -v exodus'], {
    stdout: 'ignore',
    stderr: 'ignore'
  })
  const exitCode = await check.exited
  if (exitCode !== 0) return { status: 'not-found' }
  Bun.spawn(['exodus'], { stdout: 'ignore', stderr: 'ignore' })
  return { status: 'opened' }
}

export async function openExodusApp(
  platform: NodeJS.Platform = process.platform
): Promise<OpenAppResult> {
  if (platform === 'darwin') return tryDarwin()
  if (platform === 'win32') return tryWin32()
  if (platform === 'linux') return tryLinux()
  return { status: 'not-found' }
}
