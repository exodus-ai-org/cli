#!/usr/bin/env bun
import { runCli } from './src/cli'

try {
  await runCli(process.argv)
} catch (err) {
  console.error(err instanceof Error ? err.message : String(err))
  process.exitCode = 1
}
