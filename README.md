# exodus-cli

A CLI for the exodus ecosystem: launch the Exodus desktop app, check for CLI
updates, and browse/install [Agent Skills](https://skills.sh) from the
terminal — either interactively or as scriptable JSON-emitting commands.

## Install

**Requires [Bun](https://bun.sh) `>=1.3.0`** on `PATH` — this CLI is built on
Bun and its compiled bundle runs under the Bun runtime, not plain Node.js.

```bash
npm install -g exodus-cli
# or, without installing:
bunx exodus-cli --help
```

Prefer not to install Bun? Download a standalone binary for your platform
from the [latest GitHub release](https://github.com/exodus-ai-org/exodus-cli/releases/latest)
instead — no Bun or Node required.

## Commands

```bash
exodus open                       # launch the Exodus desktop app
exodus update [--check]           # check for a newer exodus-cli version
exodus skills                     # interactive TUI: browse, view audits, install/uninstall
exodus skills search <query> [--json]
exodus skills install <id>  [--json]   # e.g. vercel-labs/skills/find-skills
exodus skills list           [--json]
exodus skills uninstall <slug> [--json]
exodus --help
```

Skills install into `~/.exodus/skills/<slug>/`, the same directory
`universal-client` (the Exodus desktop app) reads — a skill installed via
this CLI is immediately usable there too.

## Development

```bash
bun install
bun run index.ts --help   # run from source
bun test                  # run the test suite
bun run typecheck
```

See `docs/superpowers/specs/2026-09-18-exodus-cli-design.md` and
`docs/superpowers/plans/2026-09-18-exodus-cli-implementation.md` for the
full design and implementation history.

## Release

Pushing to `main` triggers `.github/workflows/release.yml`, which runs
`semantic-release`: it determines the next version from conventional
commits, publishes to npm, compiles cross-platform binaries (`bun build
--compile`), and attaches them to a GitHub Release.
