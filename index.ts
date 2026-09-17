#!/usr/bin/env bun
import { buildProgram } from './src/cli'

await buildProgram().parseAsync(process.argv)