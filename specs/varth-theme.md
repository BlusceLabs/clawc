# Varth Theme Design

> Status: implemented
> Date: 2026-06-28

## Goal

Add a new default theme named **varth** — built from jungle green, lemon
chiffon, dark black, and dark brown — to both the TUI and the desktop/web app,
and make it the active default across both surfaces.

## Palette

### Dark (primary experience)

| Token | Hex | Role |
|-------|-----|------|
| background | `#0A0A0A` | dark black |
| backgroundPanel | `#1A1410` | very dark brown |
| backgroundElement | `#2A1F18` | dark brown (lifted) |
| text | `#EFE9CF` | warm cream (lemon-chiffon-derived) |
| textMuted | `#948B76` | muted brown-gray |
| primary | `#29AB87` | jungle green |
| secondary | `#2E8B6E` | muted jungle |
| accent | `#FFFACD` | lemon chiffon |
| success | `#3FA66A` | brighter jungle |
| warning | `#E0A458` | warm amber |
| error | `#C8534C` | terracotta red |
| info | `#4DB89E` | jungle-teal |
| border | `#3A2E24` | brown |
| borderActive | `#29AB87` | jungle-green active |
| borderSubtle | `#2A1F18` | dark brown |

Syntax (dark): strings `#FFFACD`, functions `#3FA66A`, keywords `#E0A458`,
types `#4DB89E`, comments `#7D7264`, variables `#EFE9CF`, numbers `#E0A458`,
operators `#4DB89E`, punctuation `#EFE9CF`.

Markdown (dark): headings `#FFFACD`, links `#29AB87`, linkText `#3FA66A`,
code `#FFFACD`, blockQuote `#948B76`, emph `#E0A458`, strong `#FFFACD`,
listItem `#29AB87`, listEnumeration `#4DB89E`, codeBlock `#EFE9CF`.

Diff (dark): added `#3FA66A`, removed `#C8534C`, context `#948B76`,
hunkHeader `#4DB89E`, addedBg `#122B22`, removedBg `#2A1715`, contextBg `#1A1410`,
lineNumber `#948B76`.

### Light (desktop requires a light variant)

| Token | Hex | Role |
|-------|-----|------|
| background | `#FFFACD` | lemon chiffon |
| backgroundPanel | `#F2E8B8` | darker chiffon |
| backgroundElement | `#E6DCA0` | muted chiffon |
| text | `#2A1F18` | dark brown ink |
| textMuted | `#6B5A47` | muted brown |
| primary | `#1B5E20` | dark jungle green |
| secondary | `#2E7D32` | jungle |
| accent | `#5D4037` | dark brown |
| success | `#2E7D32` | jungle |
| warning | `#A85F00` | amber |
| error | `#9D2B2B` | dark red |
| info | `#00695C` | teal |
| border | `#C9B98A` | tan |
| borderActive | `#1B5E20` | dark jungle green |
| borderSubtle | `#D9CBA0` | light tan |

## thinkingOpacity

`thinkingOpacity: 0.45` (dimmer than the 0.6 default) so thinking blocks fade
further into the dark brown/black background.

## Implementation

### Files created

- `packages/tui/src/theme/assets/varth.json` — TUI theme (`defs` + `theme`),
  follows `gruvbox.json` conventions. `thinkingOpacity: 0.45`.
- `packages/ui/src/theme/themes/varth.json` — desktop theme (`palette` +
  `overrides`, light/dark), follows `nord.json` conventions.

### Files edited (registration)

- `packages/tui/src/theme/index.ts` — import `varth` + add to `DEFAULT_THEMES`.
- `packages/ui/src/theme/default-themes.ts` — import + export `varthTheme` +
  add to `DEFAULT_THEMES`.
- `packages/ui/src/theme/context.tsx` — add `varth: "Varth"` to `names` map.

### Files edited (TUI default)

- `packages/tui/src/context/theme.tsx` — 6 theme-default fallback literals
  `"opencode"` -> `"varth"` (initial store, kv fallback, draft fallback,
  catch fallback, 2x system-theme fallback).

### Files edited (desktop default — hybrid approach)

The approved plan called for approach B (full oc-2 rewire). During
implementation I discovered `oc-2`'s CSS is baked into
`packages/ui/src/styles/theme.css` as the `:root` fallback variable block
(~400 vars). Faithful approach B would require regenerating that block with
varth's resolved variables — a risky change not in the plan's file list.

I chose the **hybrid** approach instead: fresh users default to `varth`
(user-facing goal achieved), while `oc-2` remains the baked-in flash-fallback
base in `theme.css`. This means a brief first-paint flash from oc-2's base
colors to varth's, then varth applies — minimal since both are dark.

Edits:
- `packages/ui/src/theme/context.tsx` — 2 storage fallbacks `?? "oc-2"` ->
  `?? "varth"` (init + onMount). All oc-2 special-casing (seed, write-CSS
  branches, short-circuits, known-theme guards) left intact.
- `packages/app/public/oc-theme-preload.js` — default `|| "oc-2"` -> `|| "varth"`.
  Legacy `oc-1` -> `oc-2` migration and `if (themeId === "oc-2") return` left
  intact.
- `packages/desktop/src/main/windows.ts` — import `varthThemeJson` instead of
  oc-2; native window background resolves varth's `background-base`.
- `packages/ui/src/theme/loader.ts` — unchanged (`isDefaultTheme` stays oc-2
  since that's the baked-in base).
- `packages/app/src/theme-preload.test.ts` — unchanged (tests oc-1->oc-2
  migration, still valid).

### What stays untouched

- `oc-2.json` theme file (still selectable).
- Legacy `oc-1` -> `oc-2` normalize migration.
- TUI `provider.id === "opencode"` provider-identity checks.

## Verification

- `bun typecheck` in `packages/tui`, `packages/ui`, `packages/app`,
  `packages/desktop` — all PASS.
- `bun test test/theme.test.ts` in `packages/tui` — 8 pass / 0 fail.
- `bun test src/theme-preload.test.ts` in `packages/app` — 2 pass / 0 fail.
- `bun run lint` (oxlint) at repo root — 0 errors (4086 pre-existing warnings).

## Out of scope

- Renaming the project/package scope (separate parked task; see
  `.kimchi/docs/rename-opencode-to-varth-notes.md`).
- Touching any other theme file.
- Changing the `oc-2` legacy migration behavior.
- Full approach B (regenerating `theme.css` `:root` block with varth vars) —
  deferred; hybrid approach is the current implementation.
