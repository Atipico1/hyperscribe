# Hyperscribe

[![License: MIT](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
[![Node >= 20](https://img.shields.io/badge/node-%3E%3D20-brightgreen.svg)](https://nodejs.org/)
[![Claude Code plugin](https://img.shields.io/badge/claude--code-plugin-6E56CF.svg)](https://docs.claude.com/en/docs/claude-code)
[![Status: alpha](https://img.shields.io/badge/status-alpha-orange.svg)](#roadmap)

I like visual explanations.

I do not like asking a model to dump raw HTML for them.

The result is usually ugly, expensive, and annoying to revise. You burn a pile of tokens on markup, tweak prompts to fix spacing, then re-generate the whole thing because one part looks off.

So I built the renderer myself.

Hyperscribe lets the model emit semantic component JSON instead of full HTML. The renderer handles layout, styling, validation, and offline packaging. You get a self-contained HTML page or slide deck that is cheaper to generate, easier to iterate on, and much more consistent.

## Benchmark

Same source, same repo, same `context.md`, two spawned subagents.

<table>
<tr>
<th align="left">Metric</th>
<th align="left">visual-explainer</th>
<th align="left">Hyperscribe</th>
</tr>
<tr>
<td>Model output format</td>
<td>full HTML</td>
<td>semantic JSON envelope</td>
</tr>
<tr>
<td>Generated artifact tokens</td>
<td>7,506</td>
<td>2,410</td>
</tr>
<tr>
<td>Token reduction vs. raw HTML</td>
<td>baseline</td>
<td><strong>68% fewer</strong></td>
</tr>
</table>

Hyperscribe used <strong>5,096 fewer output tokens</strong> in this run.

Benchmark artifacts live in [`benchmark/`](benchmark/).

<!-- components-gallery:start -->
## Components Gallery

Visual previews for 20 non-text page-mode components.

<table>
<tr>
<td width="25%" align="center" valign="top">
  <sub><code>Image</code></sub>
  <br />
  <a href="assets/component-gallery/image.webp">
    <img src="assets/component-gallery/image.webp" alt="Image component preview" width="100%" />
  </a>
</td>
<td width="25%" align="center" valign="top">
  <sub><code>Callout</code></sub>
  <br />
  <a href="assets/component-gallery/callout.webp">
    <img src="assets/component-gallery/callout.webp" alt="Callout component preview" width="100%" />
  </a>
</td>
<td width="25%" align="center" valign="top">
  <sub><code>KPICard</code></sub>
  <br />
  <a href="assets/component-gallery/kpi-card.webp">
    <img src="assets/component-gallery/kpi-card.webp" alt="KPICard component preview" width="100%" />
  </a>
</td>
<td width="25%" align="center" valign="top">
  <sub><code>CodeBlock</code></sub>
  <br />
  <a href="assets/component-gallery/code-block.webp">
    <img src="assets/component-gallery/code-block.webp" alt="CodeBlock component preview" width="100%" />
  </a>
</td>
</tr>
<tr>
<td width="25%" align="center" valign="top">
  <sub><code>CodeDiff</code></sub>
  <br />
  <a href="assets/component-gallery/code-diff.webp">
    <img src="assets/component-gallery/code-diff.webp" alt="CodeDiff component preview" width="100%" />
  </a>
</td>
<td width="25%" align="center" valign="top">
  <sub><code>Mermaid</code></sub>
  <br />
  <a href="assets/component-gallery/mermaid.webp">
    <img src="assets/component-gallery/mermaid.webp" alt="Mermaid component preview" width="100%" />
  </a>
</td>
<td width="25%" align="center" valign="top">
  <sub><code>Sequence</code></sub>
  <br />
  <a href="assets/component-gallery/sequence.webp">
    <img src="assets/component-gallery/sequence.webp" alt="Sequence component preview" width="100%" />
  </a>
</td>
<td width="25%" align="center" valign="top">
  <sub><code>ArchitectureGrid</code></sub>
  <br />
  <a href="assets/component-gallery/architecture-grid.webp">
    <img src="assets/component-gallery/architecture-grid.webp" alt="ArchitectureGrid component preview" width="100%" />
  </a>
</td>
</tr>
<tr>
<td width="25%" align="center" valign="top">
  <sub><code>FlowChart</code></sub>
  <br />
  <a href="assets/component-gallery/flow-chart.webp">
    <img src="assets/component-gallery/flow-chart.webp" alt="FlowChart component preview" width="100%" />
  </a>
</td>
<td width="25%" align="center" valign="top">
  <sub><code>Quadrant</code></sub>
  <br />
  <a href="assets/component-gallery/quadrant.webp">
    <img src="assets/component-gallery/quadrant.webp" alt="Quadrant component preview" width="100%" />
  </a>
</td>
<td width="25%" align="center" valign="top">
  <sub><code>Swimlane</code></sub>
  <br />
  <a href="assets/component-gallery/swimlane.webp">
    <img src="assets/component-gallery/swimlane.webp" alt="Swimlane component preview" width="100%" />
  </a>
</td>
<td width="25%" align="center" valign="top">
  <sub><code>DataTable</code></sub>
  <br />
  <a href="assets/component-gallery/data-table.webp">
    <img src="assets/component-gallery/data-table.webp" alt="DataTable component preview" width="100%" />
  </a>
</td>
</tr>
<tr>
<td width="25%" align="center" valign="top">
  <sub><code>Chart</code></sub>
  <br />
  <a href="assets/component-gallery/chart.webp">
    <img src="assets/component-gallery/chart.webp" alt="Chart component preview" width="100%" />
  </a>
</td>
<td width="25%" align="center" valign="top">
  <sub><code>Comparison</code></sub>
  <br />
  <a href="assets/component-gallery/comparison.webp">
    <img src="assets/component-gallery/comparison.webp" alt="Comparison component preview" width="100%" />
  </a>
</td>
<td width="25%" align="center" valign="top">
  <sub><code>StepList</code></sub>
  <br />
  <a href="assets/component-gallery/step-list.webp">
    <img src="assets/component-gallery/step-list.webp" alt="StepList component preview" width="100%" />
  </a>
</td>
<td width="25%" align="center" valign="top">
  <sub><code>FileTree</code></sub>
  <br />
  <a href="assets/component-gallery/file-tree.webp">
    <img src="assets/component-gallery/file-tree.webp" alt="FileTree component preview" width="100%" />
  </a>
</td>
</tr>
<tr>
<td width="25%" align="center" valign="top">
  <sub><code>DependencyGraph</code></sub>
  <br />
  <a href="assets/component-gallery/dependency-graph.webp">
    <img src="assets/component-gallery/dependency-graph.webp" alt="DependencyGraph component preview" width="100%" />
  </a>
</td>
<td width="25%" align="center" valign="top">
  <sub><code>FileCard</code></sub>
  <br />
  <a href="assets/component-gallery/file-card.webp">
    <img src="assets/component-gallery/file-card.webp" alt="FileCard component preview" width="100%" />
  </a>
</td>
<td width="25%" align="center" valign="top">
  <sub><code>AnnotatedCode</code></sub>
  <br />
  <a href="assets/component-gallery/annotated-code.webp">
    <img src="assets/component-gallery/annotated-code.webp" alt="AnnotatedCode component preview" width="100%" />
  </a>
</td>
<td width="25%" align="center" valign="top">
  <sub><code>ERDDiagram</code></sub>
  <br />
  <a href="assets/component-gallery/erd-diagram.webp">
    <img src="assets/component-gallery/erd-diagram.webp" alt="ERDDiagram component preview" width="100%" />
  </a>
</td>
</tr>
</table>
<!-- components-gallery:end -->

## Why Hyperscribe

What I wanted was a better contract between the model and the renderer.

Instead of asking the LLM to emit a complete HTML document, Hyperscribe asks it to emit a JSON envelope against a fixed catalog of 24 default page components plus 2 slide-mode-only components, and ships the renderer itself.

That shift has three practical consequences:

- **Token cost.** A medium page of HTML runs 5,000+ output tokens. The equivalent Hyperscribe envelope is typically 200–1,500 tokens of JSON — an 80–90% reduction on the output side, which is the side that dominates latency and spend.
- **Schema-checked output.** The CLI validates the envelope before rendering. Missing required props, unknown component names, and out-of-range enums fail with a `path: message` error the model can read and retry against. HTML has no equivalent guardrail.
- **Multi-agent reuse.** The envelope format is declarative JSON — anything that can emit JSON can produce a Hyperscribe page. The Claude Code plugin is the first surface; Codex, custom agents, RAG pipelines, and hand-written tooling can target the same renderer without any LLM in the loop. The renderer is 100% offline and has no network dependencies at runtime.

That shift to a catalog-based JSON protocol is an intentional tradeoff — slightly less expressive (you can't invent new layouts on the fly), significantly cheaper to run, and easier to validate and revise.

## Install

### Claude Code (recommended)

If you use Claude Code, start here.

If you want the `/hyperscribe`, `/hyperscribe:slides`, `/hyperscribe:diff`, and `/hyperscribe:share` slash commands, install via the plugin marketplace:

```
/plugin marketplace add Atipico1/hyperscribe
/plugin install hyperscribe@hyperscribe-marketplace
```

You can also install the skills with `npx skills` if you want the `SKILL.md` flow instead of slash commands, but the Claude Code plugin path is the recommended setup.

### Any agent — Codex, Cursor, OpenCode, Gemini CLI, … 

```bash
npx skills add Atipico1/hyperscribe
```

This installs four skills via the [open agent skills CLI](https://github.com/vercel-labs/skills):

| Skill | Purpose |
|---|---|
| `hyperscribe` | General-purpose visual HTML renderer (ships the engine) |
| `hyperscribe-slides` | Slide deck mode |
| `hyperscribe-diff` | PR / diff review page |
| `hyperscribe-share` | Deploy an output to Vercel, return a public URL |

The CLI auto-detects which agents are present (Claude Code, Codex, Cursor, OpenCode, Gemini CLI, Windsurf, Warp, and 40+ more) and writes each `SKILL.md` into that agent's skill path. Pick a subset with `--skill` or target one agent with `-a`:

```bash
npx skills add Atipico1/hyperscribe --skill hyperscribe --skill hyperscribe-slides
npx skills add Atipico1/hyperscribe -a claude-code -a codex
```

The `hyperscribe` skill is the only one that carries the renderer; the other three depend on it being installed.

### Manual use (any language / bespoke pipeline)

The renderer has zero runtime dependencies:

```bash
git clone https://github.com/Atipico1/hyperscribe.git
cd hyperscribe

# Pipe an A2UI envelope on stdin, write HTML to stdout or --out
echo '<envelope.json>' | node plugins/hyperscribe/scripts/render.mjs --out page.html
```

Any agent or tool that can emit the JSON envelope described in [`plugins/hyperscribe/skills/hyperscribe/SKILL.md`](plugins/hyperscribe/skills/hyperscribe/SKILL.md) can drive this renderer.

## Uninstall

```bash
# One-shot: removes all four skills from every agent (project + global scope)
curl -fsSL https://raw.githubusercontent.com/Atipico1/hyperscribe/main/uninstall.sh | bash

# Or use the skills CLI directly:
npx skills remove --agent '*' hyperscribe hyperscribe-slides hyperscribe-diff hyperscribe-share
npx skills remove --global --agent '*' hyperscribe hyperscribe-slides hyperscribe-diff hyperscribe-share
```

If you installed via Claude Code plugin marketplace, remove that separately:

```
/plugin uninstall hyperscribe@hyperscribe-marketplace
```

Rendered HTML output at `~/.hyperscribe/out/` is preserved. Delete manually with `rm -rf ~/.hyperscribe` if desired.

## Quick start

Inside Claude Code, after installing the plugin:

```
> /hyperscribe "draw a simple auth flow: browser, app, identity provider, token exchange"
```

Claude picks the components (typically `Page` > `Section` > `Mermaid` + `StepList`), emits the JSON envelope, pipes it to `scripts/render.mjs`, and opens the resulting HTML file in your default browser. The output path is printed back so you can re-open or share it later.

A minimal envelope — the actual JSON Claude emits — looks like:

```json
{
  "a2ui_version": "0.9",
  "catalog": "hyperscribe/v1",
  "is_task_complete": true,
  "parts": [
    {
      "component": "hyperscribe/Page",
      "props": { "title": "Auth flow" },
      "children": [
        {
          "component": "hyperscribe/Mermaid",
          "props": {
            "kind": "sequence",
            "source": "sequenceDiagram\n  Browser->>App: GET /login\n  App->>IdP: redirect\n  IdP-->>App: code\n  App->>IdP: exchange code\n  IdP-->>App: access_token"
          }
        }
      ]
    }
  ]
}
```

The renderer writes the HTML file to `~/.hyperscribe/out/` with a slugified filename and a timestamp, prints the absolute path, and exits. Re-opening the file later never re-queries the model — it is a plain HTML document on disk.

## Commands

| Command | Description |
|---|---|
| `/hyperscribe` | General-purpose page. Default entry point for diagrams, tables, architectures, explainers. |
| `/hyperscribe:slides` | Forces a `SlideDeck` root and produces a slide-oriented HTML file from a topic or outline. |
| `/hyperscribe:diff` | PR / diff review. Combines `ArchitectureGrid` for impacted modules, `CodeDiff`, and `Callout` risks. |
| `/hyperscribe:share` | Deploys an existing rendered HTML file to Vercel and returns a live URL. |

## Component catalog 🎯

24 default components plus 2 slide-mode-only components. Full prop schemas, examples, and validation rules live in [`plugins/hyperscribe/references/catalog.md`](plugins/hyperscribe/references/catalog.md).

| Category | Component | Purpose | Children |
|---|---|---|---|
| Structure | [`Page`](plugins/hyperscribe/references/catalog.md) | Root container; exactly one per envelope | required |
| Structure | [`Section`](plugins/hyperscribe/references/catalog.md) | Titled section with auto TOC anchor | allowed |
| Structure | [`Heading`](plugins/hyperscribe/references/catalog.md) | In-section h2/h3/h4 | forbidden |
| Structure | [`Prose`](plugins/hyperscribe/references/catalog.md) | Markdown paragraph block (CommonMark + GFM) | forbidden |
| Media | [`Image`](plugins/hyperscribe/references/catalog.md) | Inline image; URL passthrough or local → base64 inline | forbidden |
| Emphasis | [`Callout`](plugins/hyperscribe/references/catalog.md) | Boxed highlight (info / note / warn / success / danger) | forbidden |
| Emphasis | [`KPICard`](plugins/hyperscribe/references/catalog.md) | Metric card with optional delta | forbidden |
| Code | [`CodeBlock`](plugins/hyperscribe/references/catalog.md) | Single code snippet with optional line highlights | forbidden |
| Code | [`CodeDiff`](plugins/hyperscribe/references/catalog.md) | Before/after unified diff hunks | forbidden |
| Diagrams | [`Mermaid`](plugins/hyperscribe/references/catalog.md) | Mermaid.js diagram (flowchart / sequence / er / state / mindmap / class) | forbidden |
| Diagrams | [`Sequence`](plugins/hyperscribe/references/catalog.md) | Native SVG sequence diagram (Notion-styled, no CDN) | forbidden |
| Diagrams | [`ArchitectureGrid`](plugins/hyperscribe/references/catalog.md) | Card-based architecture with SVG connectors | forbidden |
| Diagrams | [`FlowChart`](plugins/hyperscribe/references/catalog.md) | Native SVG directed graph (box/pill/diamond nodes, TD/LR, ranked layout) | forbidden |
| Diagrams | [`Quadrant`](plugins/hyperscribe/references/catalog.md) | 2x2 prioritization matrix with plotted points | forbidden |
| Diagrams | [`Swimlane`](plugins/hyperscribe/references/catalog.md) | Lane-based process diagram across roles on a shared sequence | forbidden |
| Diagrams | [`DependencyGraph`](plugins/hyperscribe/references/catalog.md) | Ranked module/import dependency graph | forbidden |
| Diagrams | [`ERDDiagram`](plugins/hyperscribe/references/catalog.md) | Entity-relationship diagram for DB/type schemas | forbidden |
| Data | [`DataTable`](plugins/hyperscribe/references/catalog.md) | Semantic HTML table with columns / rows / caption | forbidden |
| Data | [`Chart`](plugins/hyperscribe/references/catalog.md) | Chart.js wrapper (line / bar / pie / area / scatter) | forbidden |
| Data | [`Comparison`](plugins/hyperscribe/references/catalog.md) | N-way comparison (`vs` or `grid` mode) | forbidden |
| Narrative | [`StepList`](plugins/hyperscribe/references/catalog.md) | Ordered steps / checklist with done/doing/todo/skipped state | forbidden |
| Structure | [`FileTree`](plugins/hyperscribe/references/catalog.md) | Directory/file structure visualization | forbidden |
| Structure | [`FileCard`](plugins/hyperscribe/references/catalog.md) | Per-file summary card with role/LOC/export metadata | forbidden |
| Code | [`AnnotatedCode`](plugins/hyperscribe/references/catalog.md) | Code block with pinned side annotations | forbidden |

### Slide mode only

These are intentionally separated from the default `/hyperscribe` page catalog.

| Category | Component | Purpose | Children |
|---|---|---|---|
| Slides | [`SlideDeck`](plugins/hyperscribe/references/catalog.md) | Slide container; aspect 16:9 or 4:3 | required |
| Slides | [`Slide`](plugins/hyperscribe/references/catalog.md) | Single slide (title / content / two-col / quote / image / section) | forbidden |

The design system is Notion-inspired — warm neutrals, whisper borders, Inter font fallback chain — and every visual decision is owned by the renderer. Components carry semantic data only; styling props (`color`, `backgroundColor`, `fontSize`, `className`, etc.) are rejected by the schema. If a page wants a "red warning box" the envelope asks for `Callout severity="warn"`, never a hex code.

## Themes

Four bundled themes, each shipping both **light and dark modes** in a single CSS file. Pass `--theme <name>` at render time to pick one; use `--mode light|dark` to force initial color mode (omit for `prefers-color-scheme` + localStorage).

| Name | Character | Best for |
|---|---|---|
| `studio` | Airtable — clean enterprise canvas, Haas-style typography, Airtable Blue accent, blue-tinted multi-layer shadow | Product launch pages, design reviews, polished docs |
| `midnight` | Cal.com — purely grayscale (no brand colors), Cal Sans display + Inter body, 3-layer ring shadow system | Technical writeups, minimalist reports, long-form reading |
| `void` | Bugatti — architectural black canvas, Unbounded display at massive scale, UPPERCASE mono UI, 3-color palette (black/white/gray) | Launch decks, hero moments, high-drama showcases |
| `gallery` | Apple — cinematic black↔light-gray section alternation, SF Pro with tight negative tracking, Apple Blue as sole accent | Executive summaries, product showcases, investor-facing decks |

Themes are pure CSS-variable overrides (`plugins/hyperscribe/themes/*.css`). Each defines tokens under `[data-theme="<name>"]` (light) and `[data-theme="<name>"][data-mode="dark"]` (dark). Semantic tones (`--hs-tone-{info|warn|success|danger}-{bg|fg}`) and surface palette (`--hs-color-surface*`) keep components legible across all four.

**Breaking change in v0.4:** `notion` is renamed to `studio`, `linear` is renamed to `midnight`. The old names no longer resolve — update any `--theme notion` / `--theme linear` calls to the new names. Running with the old names now throws `Unknown theme "notion". Available: gallery, midnight, studio, void`.

Your per-user theme + mode preference is stored at `~/.hyperscribe/preference.md` after first run. A project-local `./.hyperscribe/preference.md` overrides it. Delete either file to re-run first-run setup.

## How it works

1. **User runs a command.** In Claude Code, the user types something like `/hyperscribe "architecture for a rate limiter"`.
2. **Skill prompt loads.** The plugin injects [`SKILL.md`](plugins/hyperscribe/skills/hyperscribe/SKILL.md) and the command template, giving the model the catalog, envelope format, and the rule that props carry semantic data only.
3. **Claude emits JSON.** The model classifies the intent, picks components, and produces an A2UI envelope — no HTML, no CSS, no styling decisions. Unknown component names, missing required props, and out-of-range enums are caught in step 4, not left to a broken browser render.
4. **CLI validates + renders.** `plugins/hyperscribe/scripts/render.mjs` walks the envelope against the schema in `plugins/hyperscribe/spec/catalog.json`; on success it builds a single HTML document with inlined CSS and per-component SSR. Exit codes: `0` success, `1` JSON parse error, `2` schema validation failure, `3` IO error, `4` render runtime error.
5. **Self-contained HTML lands on disk.** Output is written to `~/.hyperscribe/out/<slug>-<timestamp>.html`. No network, no external CSS, no build step — the file opens on a plane.
6. **Open in browser.** `open` on macOS, `xdg-open` on Linux — the agent prints the absolute path and a one-line summary so the user can re-open or share later.

## Roadmap

- **Rendering polish** — better framing for complex diagrams, denser layouts where cards currently waste space, and more predictable output for long pages.
- **Catalog growth** — add a few more high-leverage components only where they reduce prompt complexity instead of expanding the surface area for its own sake.
- **Installation polish** — tighten setup across agents, improve diagnostics, and make it easier to verify that the right commands and skills were installed.

## Contributing

PRs are welcome.

Before opening one:

- use Node 20+
- run `npm test`
- keep renderer and catalog changes in sync
- update docs when the component surface or install flow changes

If you are changing the envelope format or component schemas, start with [`plugins/hyperscribe/references/catalog.md`](plugins/hyperscribe/references/catalog.md) and [`plugins/hyperscribe/spec/catalog.json`](plugins/hyperscribe/spec/catalog.json).

Issues and discussion: [github.com/Atipico1/hyperscribe/issues](https://github.com/Atipico1/hyperscribe/issues).

## License

MIT — see [LICENSE](LICENSE).

Copyright (c) 2026 Hyperscribe contributors.

## Credits

- [A2UI v0.9](https://developers.googleblog.com/) (Google Developers Blog) — the envelope shape (`a2ui_version`, `catalog`, `parts`, `is_task_complete`) is borrowed so Hyperscribe documents can follow an existing structured UI contract.
