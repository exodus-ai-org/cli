import { Command } from 'commander'

import { version } from '../package.json'
import { registerOpenCommand } from './commands/open'
import { registerSkillsCommand } from './commands/skills'
import { registerUpdateCommand } from './commands/update'

export function buildProgram(): Command {
  const program = new Command()
  program
    .name('exodus')
    .description('exodus-cli — launch Exodus, manage skills, and self-update')
    .version(version)

  registerOpenCommand(program)
  registerUpdateCommand(program)
  registerSkillsCommand(program)

  return program
}
