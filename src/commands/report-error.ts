export function reportError(err: unknown, json?: boolean): void {
  const message = err instanceof Error ? err.message : String(err)
  if (json) {
    console.log(JSON.stringify({ error: 'command_failed', message }))
  } else {
    console.error(message)
  }
  process.exitCode = 1
}
