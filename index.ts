#!/usr/bin/env bun
import { buildProgram } from './src/cli'

try {
  await buildProgram().parseAsync(process.argv)
} catch (err) {
  console.error(err instanceof Error ? err.message : String(err))
  process.exitCode = 1
}
