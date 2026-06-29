# Rename OpenCode → Varth: Scoping Notes

> Status: parked. User wants to do the rename later.
> Date: 2026-06-28

## Quick Stats

- **Total occurrences of `clawc` / `@clawc`:** ~22,692
- **Files affected:** ~2,311 (excluding `node_modules`, `.git`, `.clawc`, build dirs, lockfiles)

## Top Surface Areas

| Area | Count / Note |
|------|--------------|
| `packages/*` | 2,233 files — the bulk of the work |
| TypeScript (`.ts`) | 1,180 files |
| MDX docs | 601 files |
| TSX | 263 files |
| JSON configs | 137 files |
| GitHub workflows | 22 files |
| `README.md`, `CONTRIBUTING.md`, `SECURITY.md`, `LICENSE` | public-facing files |
| `install` script | curl path points to `BlusceLabs/clawc` |
| `package.json` | root package name `clawc`, workspace deps `@clawc/*` |
| `bunfig.toml`, `sst.config.ts`, `turbo.json` | tooling configs |

## Package Scope to Decide

Current npm scope: `@clawc/*`
Likely new scopes to choose from:
- `@varth/*`
- `@clawc/*`

Most-referenced packages (from code + docs + specs):
- `@clawc/sdk`
- `@clawc/plugin`
- `@clawc/script`
- `@clawc/core`
- `@clawc/client`
- `@clawc/protocol`
- `@clawc/schema`
- `@clawc/server`
- `@clawc/tui`

## Open Questions Before Implementation

1. **Scope:** repo-only, package-names too, or full rebrand (CLI, `~/.clawc`, binary, desktop app, docs URLs, Discord)?
2. **New npm scope:** `@varth/*` or `@clawc/*`?
3. **GitHub org/repo:** keep `BlusceLabs` or also rename org?
4. **Breaking changes:** single atomic rename, or staged (publish `@varth/*` packages, deprecate `@clawc/*`)?

## Suggested Implementation Plan (draft)

1. Decide new names and scope.
2. Automated string replacement script with human review for risky files.
3. Rename directories where package folder name includes `clawc` (e.g., `packages/clawc`).
4. Regenerate generated files (`packages/client/src/generated`, legacy JS SDK, etc.).
5. Update lockfile (`bun.lock`).
6. Run typecheck, lint, and a subset of tests.
7. Update install script and README install commands.
8. Open PR; note this is intentionally breaking.
