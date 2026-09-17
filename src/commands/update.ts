import type { Command } from 'commander'

import { checkForUpdate, DIST_CHANNEL, type UpdateCheckResult } from '../lib/updater'

export async function runUpdate(opts: { check?: boolean } = {}): Promise<UpdateCheckResult> {
  const result = await checkForUpdate()

  if (!result.updateAvailable) {
    console.log(`exodus-cli is up to date (${result.current}).`)
    return result
  }

  console.log(`Update available: ${result.current} → ${result.latest}`)

  if (opts.check) return result

  if (DIST_CHANNEL === 'npm') {
    console.log('Run: npm install -g exodus-cli@latest')
  } else {
    console.log(
      'Automatic binary self-update isn\'t wired up in this build yet — download the latest release from https://github.com/exodus-ai-org/exodus-cli/releases/latest'
    )
  }

  return result
}

export function registerUpdateCommand(program: Command): void {
  program
    .command('update')
    .description('Check for a newer exodus-cli version')
    .option('--check', 'only report whether an update is available, take no further action')
    .action(async (opts: { check?: boolean }) => {
      await runUpdate(opts)
    })
}
