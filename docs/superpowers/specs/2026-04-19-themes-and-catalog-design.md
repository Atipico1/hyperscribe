# Themes, catalog extensions, and preference system

**Status:** approved (brainstorming phase)
**Date:** 2026-04-19
**Scope:** A+B+C+D combined — catalog gap-fill, new themes, first-call UX, persistent preference.

## 1. Context and goals

Hyperscribe is a Claude Code plugin and cross-agent skill that turns A2UI-style component JSON into self-contained HTML. Current state: 22 components, two themes (`notion`, `linear`), light/dark per theme, zero persistent user settings.

User goal: **"see-at-a-glance wow" quality for codebase explanations** — enough components to describe a codebase structurally, and four theme presets that feel distinctly branded without copying vendor identity (`notion`, `linear`, or the Framer/Apple visual sources).

This spec covers four sub-areas that ship together:

- **A.** Catalog extensions for code-base visualization (five new components).
- **B.** Two new themes plus renaming of the two existing ones. Brand names are hidden.
- **C.** First-call UX that prompts for `theme` + `mode` once.
- **D.** Persistent preference at `~/.hyperscribe/preference.md` (with project-local override).

## 2. Non-goals

- No new third-party fonts (GT Walsheim, SF Pro are license-encumbered — use system/OSS fallbacks).
- No backwards-compatible aliases for the old theme names (`notion`, `linear`) — the rename is intentional erasure of the brand reference.
- No config slash-command (`/hyperscribe:config`) in v1. Users reset by deleting the preference file.
- No new "presentation chrome" on existing components (Carbon-style window traffic lights, gradient code backgrounds, icon libraries). Design stays inside the existing token system.
- No streaming render, no per-component theme overrides, no runtime theme hot-swap.

## 3. Catalog additions (A)

Five new components join `hyperscribe/v1`. All follow the existing conventions: `props` carries semantic data only, styling is owned by the renderer + theme CSS.

### 3.1 `hyperscribe/FileTree`

Directory/file structure visualization. Primary codebase-overview element.

| Prop | Type | Required | Notes |
|---|---|---|---|
| `nodes` | `array<FileNode>` | yes | Recursive tree of `{ name, type: "dir"\|"file", path?, children?: FileNode[], highlight?: "primary"\|"secondary"\|"muted" }` |
| `showIcons` | `boolean` | no | default `true`. File-type icon inferred from `name` extension |
| `caption` | `string` | no | Shown below the tree |

Children: forbidden. Tree is purely data-driven.

### 3.2 `hyperscribe/DependencyGraph`

Module/import dependency visualization.

| Prop | Type | Required | Notes |
|---|---|---|---|
| `nodes` | `array<{ id, label, type?: "module"\|"package"\|"external", tag?: string }>` | yes | |
| `edges` | `array<{ from, to, kind?: "import"\|"type"\|"runtime", cyclic?: boolean }>` | yes | `cyclic: true` edges render in the warn tone |
| `layout` | `"ranks"` | yes | v1 supports `ranks` only (caller-supplied layers). `"force"` reserved for v2 |
| `ranks` | `array<array<string>>` | yes when `layout="ranks"` | Same convention as `FlowChart` |

Children: forbidden. Rendered as native SVG, not Mermaid.

### 3.3 `hyperscribe/FileCard`

Summary card for a single file — name, LOC, responsibility, exports. Grid-friendly (multiple cards fit per row like `KPICard`).

| Prop | Type | Required | Notes |
|---|---|---|---|
| `name` | `string` | yes | Filename including extension |
| `path` | `string` | no | Relative or absolute path |
| `loc` | `number` | no | Lines of code |
| `responsibility` | `string` | yes | 1-2 line summary |
| `exports` | `array<{ name: string, kind: "function"\|"class"\|"const"\|"type" }>` | no | |
| `state` | `"modified"\|"added"\|"removed"\|"stable"` | no | default `"stable"`. Tints the card accent |
| `icon` | `string` | no | Override the inferred file-type icon |

Children: forbidden.

### 3.4 `hyperscribe/AnnotatedCode`

Code block with numbered pins that link to side annotations. Static-page equivalent of Slidev's click-highlight.

| Prop | Type | Required | Notes |
|---|---|---|---|
| `lang` | `string` | yes | Syntax language |
| `code` | `string` | yes | Full code block |
| `filename` | `string` | no | |
| `annotations` | `array<{ line: number, pin: number, title: string, body: string }>` | yes | `pin` is the displayed marker (typically matches `line` order) |
| `pinStyle` | `"numbered"\|"lettered"` | no | default `"numbered"` |

Children: forbidden. Layout: code on the left, annotation list on the right; stacks on mobile.

### 3.5 `hyperscribe/ERDDiagram`

Entity-relationship diagram (DB schemas, type models).

| Prop | Type | Required | Notes |
|---|---|---|---|
| `entities` | `array<{ id, name, fields: array<{ name, type, key?: "pk"\|"fk", nullable?: boolean }> }>` | yes | |
| `relationships` | `array<{ from: string, to: string, cardinality: "1-1"\|"1-n"\|"n-n", label?: string }>` | yes | `from`/`to` reference entity `id` |
| `layout` | `"grid"\|"columns"` | no | default `"grid"` |

Children: forbidden. Native SVG (not Mermaid `er`).

### 3.6 Catalog file updates

- `spec/catalog.json` — add five new entries under their category keys (`Structure`, `Diagrams`, `Code` per component).
- `references/catalog.md` — regenerated via `node tools/build-catalog-md.mjs` (existing generator).
- `scripts/render.mjs` — five new entries in `REGISTRY`.
- `scripts/components/` — five new component modules (`file-tree.mjs`, `dependency-graph.mjs`, `file-card.mjs`, `annotated-code.mjs`, `erd-diagram.mjs`).
- `assets/components/` — five new CSS files, imported via the existing `COMPONENTS_CSS_DIR` mechanism.
- `SKILL.md` Component inventory table — five new rows.

## 4. Theme system (B)

### 4.1 Rename (no aliases)

| Before | After | Reason |
|---|---|---|
| `themes/notion.css` | `themes/studio.css` | Hide brand name |
| `themes/linear.css` | `themes/midnight.css` | Hide brand name |

The `[data-theme="notion"]` and `[data-theme="linear"]` selectors are **removed**. No backwards-compat aliases. Users of the plugin marketplace who were calling `--theme notion` will get a clear error (`Unknown theme "notion". Available: studio, midnight, void, gallery`) from `loadTheme()`.

README's `## Themes` section is rewritten to list the four new names and explain the rename.

### 4.2 New theme: `void` (Framer-inspired)

Pure-black canvas with a cold blue accent. Dark-first; the light mode is a restrained inversion.

**Light mode** (`[data-theme="void"]`)
- `--hs-color-bg`: `#fafafa` (near-white, not pure — prevents sterility)
- `--hs-color-fg`: `#0a0a0a`
- `--hs-color-accent`: `#0066cc` (slightly cooler than void blue for contrast on light)
- `--hs-color-surface`: `#ffffff`
- `--hs-color-surface-alt`: `#f0f0f0`
- `--hs-border-whisper`: `1px solid rgba(0, 0, 0, 0.08)`
- `--hs-font-sans`: `Inter Variable, Inter, -apple-system, system-ui, sans-serif` (no GT Walsheim)

**Dark mode** (`[data-theme="void"][data-mode="dark"]`) — the signature variant
- `--hs-color-bg`: `#000000` (pure black, non-negotiable)
- `--hs-color-fg`: `#ffffff`
- `--hs-color-accent`: `#0099ff` (Framer blue — used only for links, borders, focus)
- `--hs-color-surface`: `#000000`
- `--hs-color-surface-alt`: `#090909`
- `--hs-color-fg-muted`: `#a6a6a6`
- `--hs-border-whisper`: `1px solid rgba(0, 153, 255, 0.15)` (signature blue ring)
- `--hs-shadow-card`: `rgba(255,255,255,0.1) 0 0.5px 0 0.5px, rgba(0,0,0,0.25) 0 10px 30px` (white top-edge highlight + deep ambient)
- Same semantic tones as existing themes (`--hs-tone-*`) but tuned for pure-black background

No letter-spacing overrides at the theme level — typography tuning (tight tracking on Inter at display sizes) happens in `base.css` if needed. Voiding the GT Walsheim-specific `-5.5px at 110px` is accepted; we get ~80% of the feel with Inter Variable + negative tracking.

### 4.3 New theme: `gallery` (Apple-inspired)

Cinematic rhythm through alternating surface colors; single blue accent.

**Light mode** (`[data-theme="gallery"]`)
- `--hs-color-bg`: `#ffffff`
- `--hs-color-surface-alt`: `#f5f5f7` (Apple's signature light gray)
- `--hs-color-fg`: `#1d1d1f`
- `--hs-color-accent`: `#0071e3` (Apple Blue)
- `--hs-color-fg-muted`: `rgba(0, 0, 0, 0.8)`
- `--hs-border-whisper`: none (Apple almost never uses borders) — set to `1px solid transparent`
- `--hs-shadow-card`: `rgba(0, 0, 0, 0.22) 3px 5px 30px 0px` (soft diffused "photo studio" shadow)
- `--hs-font-sans`: `-apple-system, BlinkMacSystemFont, "SF Pro Text", "SF Pro Display", Inter, system-ui, sans-serif` (SF Pro is auto-served on Apple OSes)
- Pill CTA radius: components that render buttons use `980px` (verified in existing button components; no schema change needed)

**Dark mode** (`[data-theme="gallery"][data-mode="dark"]`)
- `--hs-color-bg`: `#000000`
- `--hs-color-surface`: `#272729`
- `--hs-color-surface-alt`: `#1d1d1f`
- `--hs-color-fg`: `#f5f5f7`
- `--hs-color-accent`: `#2997ff` (brighter Apple blue for dark bg legibility)
- `--hs-shadow-card`: `rgba(0, 0, 0, 0.5) 3px 5px 30px 0px`

### 4.4 Loading logic

No changes to `scripts/lib/theme.mjs` — `listThemes()` auto-enumerates `themes/*.css`, so adding two files is enough. `loadTheme(name)` throws on unknown, which is the desired behavior post-rename.

## 5. First-call UX (C)

### 5.1 Trigger condition

At the start of every Hyperscribe invocation (main skill and all three sub-skills), before building the envelope:

```
if ! exists(resolve_pref_path()):
    prompt_user_for_theme_and_mode()
    write_preference_file(theme, mode)
```

`resolve_pref_path()` checks project-local first, then global:

1. `./.hyperscribe/preference.md` (if inside a repo or working directory explicitly uses it)
2. `~/.hyperscribe/preference.md` (fallback, global)

Both paths are probed; the first existing file wins. When writing for the first time, the global path is used unless the user explicitly asks "save to project" (v1 does not offer this — global is the default).

### 5.2 Prompt format

**Claude Code (AskUserQuestion tool available):**
- Question 1: "Theme?" — 4 options (`studio`, `midnight`, `void`, `gallery`), one-line description each.
- Question 2: "Mode?" — 2 options (`light`, `dark`) or "follow system" (which stores no mode and lets `prefers-color-scheme` + localStorage decide at render time).

**Other agents (Codex, Cursor, OpenCode, terminal-only):**
- Single text prompt:
  ```
  Hyperscribe first-run setup. Pick a theme and mode.

  Themes:  1) studio (warm, paper-feel)
           2) midnight (cool, developer-dark)
           3) void (pure black, electric blue accent)
           4) gallery (Apple-inspired, cinematic alternating surfaces)

  Modes:   light / dark / auto

  Reply with "<theme> <mode>" (e.g., "studio light"), a single number (defaults mode=light),
  or "skip" to use studio + light.
  ```
- Response parsing: lowercase, whitespace-split. Accept theme name, theme number, `skip`/`default`/empty for the baseline.

### 5.3 Defaults

If the user replies `skip`, gives an empty answer, or gives an unparseable answer, default to `theme=studio, mode=light` and continue silently (no nag).

## 6. Preference file (D)

### 6.1 Path resolution

| Priority | Path | Scope |
|---|---|---|
| 1 | `./.hyperscribe/preference.md` | Project-local override (committed or gitignored at user's choice) |
| 2 | `~/.hyperscribe/preference.md` | Global user preference |

Reader returns the first existing path, or `null` if neither exists.

### 6.2 Format

```markdown
---
theme: studio
mode: light
created_at: 2026-04-19T15:42:08Z
---

# Hyperscribe preferences

Edit the values above to change your defaults. Delete this file to re-run first-run setup.

Valid values:
  theme: studio | midnight | void | gallery
  mode:  light | dark | auto
```

- YAML frontmatter (three-dash fenced) for values, markdown body for human guidance.
- `auto` mode means "emit no `--mode` flag; let the page follow `prefers-color-scheme` + localStorage at load time" (existing toggler behavior).
- Future extensibility (not in v1): `toc`, `out_dir`, `theme_overrides` — reserved keys, ignored if present.

### 6.3 Reader/writer helper

New file: `plugins/hyperscribe/scripts/lib/preference.mjs`

```js
export function resolvePreferencePath() { /* project-local → global → null */ }
export function readPreference() { /* returns { theme, mode } or null */ }
export function writePreference({ theme, mode }, { scope = "global" } = {}) { /* ... */ }
export function defaults() { return { theme: "studio", mode: "light" }; }
```

Bash equivalent inlined in SKILL.md (`awk -F': *' '/^theme:/{print $2; exit}' "$PREF"`) so every agent can parse without spawning Node.

### 6.4 Renderer changes

`scripts/render.mjs`:
- Accept new CLI flag `--mode light|dark|auto`.
- When `--mode` is `light` or `dark`, inject `data-mode="<value>"` on `<html>` at render time (before the mode-toggler script runs), preventing first-paint flash.
- When `--mode auto` or absent, fall through to the existing toggler logic (`prefers-color-scheme` + localStorage).

## 7. Touched files

```
plugins/hyperscribe/
  SKILL.md                              # add Step 0 preference block + component inventory rows
  .claude-plugin/plugin.json            # version bump
  themes/studio.css                     # rename from notion.css
  themes/midnight.css                   # rename from linear.css
  themes/void.css                       # new
  themes/gallery.css                    # new
  scripts/render.mjs                    # --mode flag, 5 REGISTRY entries, <html data-mode="..."> injection
  scripts/lib/preference.mjs            # new helper
  scripts/components/file-tree.mjs      # new
  scripts/components/dependency-graph.mjs
  scripts/components/file-card.mjs
  scripts/components/annotated-code.mjs
  scripts/components/erd-diagram.mjs
  commands/hyperscribe.md               # Step 0 preference logic
  commands/slides.md                    # Step 0 preference logic
  commands/diff.md                      # Step 0 preference logic
  commands/share.md                     # (no Step 0; uses last rendered file)
  spec/catalog.json                     # 5 new schemas
  references/catalog.md                 # regenerated
  assets/components/file-tree.css       # new
  assets/components/dependency-graph.css
  assets/components/file-card.css
  assets/components/annotated-code.css
  assets/components/erd-diagram.css

skills/hyperscribe/                     # sync-copy all of the above engine files
skills/hyperscribe-slides/SKILL.md      # reference Step 0 from main skill
skills/hyperscribe-diff/SKILL.md        # reference Step 0 from main skill
skills/hyperscribe-share/SKILL.md       # (no change)

README.md                               # Themes section rewrite, new theme list
package.json                            # version bump
```

## 8. Risks and open questions

- **Font fallback fidelity.** Without GT Walsheim, `void` loses the extreme `-5.5px` tracking feel. Inter Variable with manual negative tracking at display sizes recovers ~80%. Not a blocker; noted in theme-doc.
- **Breaking the `notion`/`linear` theme flag.** Intentional — the brand-hiding is the point. Users are informed via README + a clear error from `loadTheme`. Alternative: keep files as aliases. Rejected per user instruction.
- **Preference parsing in pure Bash across shells.** `awk -F': *'` works in `mawk`, `gawk`, `nawk`. BSD awk on macOS also supports it. No POSIX risk expected.
- **First-call detection reliability across agents.** `AskUserQuestion` in Claude Code is ideal; the text-prompt fallback depends on the agent faithfully passing the response to the skill. If an agent strips interactive turns, the fallback to `skip` default kicks in silently.

## 9. Success criteria

- `npx skills add Atipico1/hyperscribe` → first `hyperscribe` call prompts for theme + mode, saves `~/.hyperscribe/preference.md`, renders with chosen defaults.
- Re-invoking `hyperscribe` after setup reads the preference and passes `--theme --mode` with zero prompting.
- Deleting `~/.hyperscribe/preference.md` restores the first-run prompt on next call.
- Project-local `./.hyperscribe/preference.md` overrides global inside that directory.
- `--theme void --mode dark` on a sample envelope produces a pure-black page with blue-ring cards and white top-edge highlights; `--theme gallery --mode light` produces an Apple-flavored page with alternating surface colors and a soft diffused shadow on cards.
- The five new components each render successfully on all four themes in both modes (24 render combinations = sanity smoke tests).
- Existing renders that used `--theme notion` or `--theme linear` fail with a clear `Unknown theme` error listing the four new names.

## 10. Out of scope (for follow-up specs)

- `/hyperscribe:config` or `/hyperscribe:preference` slash command for resetting/editing without file manipulation.
- Per-project theme override via CLI flag on `render.mjs` that takes precedence over preference.
- Additional components flagged by the survey but deferred: `APIReference`, `DiffView` (full-file), `Icon` library, `Legend`, full sticky navigation.
- Component-level presentation chrome (Carbon-style window traffic lights, gradient code backgrounds).
- `theme_overrides` user-level CSS variable patching in `preference.md`.
