# Hyperscribe

[![License: MIT](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
[![Node >= 20](https://img.shields.io/badge/node-%3E%3D20-brightgreen.svg)](https://nodejs.org/)
[![Claude Code plugin](https://img.shields.io/badge/claude--code-plugin-6E56CF.svg)](https://docs.claude.com/en/docs/claude-code)
[![Status: alpha](https://img.shields.io/badge/status-alpha-orange.svg)](#roadmap)

A Claude Code plugin that turns terminal-bound explanations into self-contained HTML pages — the LLM emits A2UI-style component JSON, a zero-dependency Node renderer produces a single HTML file that works offline in any modern browser.

## 30-second demo

```
$ claude
> /hyperscribe "walk me through the OAuth 2.0 authorization code flow"

  Hyperscribe  classifying intent         → page + sequence diagram + step list
               picking components         → Page > Section x3 > Mermaid + StepList + Callout
               emitting envelope          → 847 tokens of JSON
               validating schema          → ok
               rendering HTML             → 62 KB, no external assets
               writing                    → ~/.hyperscribe/out/oauth-auth-code-flow-20260419-153021.html
               opening                    → done.

> Rendered the OAuth 2.0 authorization code flow as a 3-section page with a
  sequence diagram and a step-by-step breakdown. Open at the path above.
```

<!-- TODO: add GIF demo here once recorded -->

## Why Hyperscribe

Hyperscribe is directly inspired by [nicobailon/visual-explainer](https://github.com/nicobailon/visual-explainer) — the idea that agents should reach for "open this in a browser" instead of ASCII art is theirs. What Hyperscribe changes is the contract between the model and the renderer. Visual-explainer asks the LLM to emit a complete HTML document; Hyperscribe asks it to emit a JSON envelope against a fixed catalog of 18 components, and ships the renderer itself.

That shift has three practical consequences:

- **Token cost.** A medium page of HTML runs 5,000+ output tokens. The equivalent Hyperscribe envelope is typically 200–1,500 tokens of JSON — an 80–90% reduction on the output side, which is the side that dominates latency and spend.
- **Schema-checked output.** The CLI validates the envelope before rendering. Missing required props, unknown component names, and out-of-range enums fail with a `path: message` error the model can read and retry against. HTML has no equivalent guardrail.
- **Multi-agent reuse.** The envelope format is declarative JSON — anything that can emit JSON can produce a Hyperscribe page. The Claude Code plugin is the first surface; Codex, custom agents, RAG pipelines, and hand-written tooling can target the same renderer without any LLM in the loop. The renderer is 100% offline and has no network dependencies at runtime.

Credit where it's due: `visual-explainer` pioneered the behavioral pattern (proactively open a browser tab instead of dumping ASCII), which Hyperscribe inherits wholesale. The shift to a catalog-based JSON protocol is an orthogonal tradeoff — slightly less expressive (you can't invent new layouts on the fly), significantly cheaper to run, and safer to iterate on.

## Install

### Claude Code (recommended)

```
/plugin marketplace add Atipico1/hyperscribe
/plugin install hyperscribe@hyperscribe-marketplace
```

The `/hyperscribe`, `/hyperscribe:slides`, `/hyperscribe:diff`, and `/hyperscribe:share` commands become available once the plugin is installed.

### Other agents / manual use

The renderer has zero runtime dependencies and can be invoked directly:

```bash
git clone https://github.com/Atipico1/hyperscribe.git
cd hyperscribe

# Pipe an A2UI envelope on stdin, write HTML to stdout or --out
echo '<envelope.json>' | node plugins/hyperscribe/scripts/render.mjs --out page.html
```

Any agent (Codex, Pi, bespoke pipelines) that can produce the JSON envelope described in [`plugins/hyperscribe/SKILL.md`](plugins/hyperscribe/SKILL.md) can use this renderer.

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

22 components across 10 categories. Full prop schemas, examples, and validation rules live in [`plugins/hyperscribe/references/catalog.md`](plugins/hyperscribe/references/catalog.md).

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
| Data | [`DataTable`](plugins/hyperscribe/references/catalog.md) | Semantic HTML table with columns / rows / caption | forbidden |
| Data | [`Chart`](plugins/hyperscribe/references/catalog.md) | Chart.js wrapper (line / bar / pie / area / scatter) | forbidden |
| Data | [`PrettyChart`](plugins/hyperscribe/references/catalog.md) | Native SVG bar/line with gradient fills + soft shadow | forbidden |
| Data | [`Comparison`](plugins/hyperscribe/references/catalog.md) | N-way comparison (`vs` or `grid` mode) | forbidden |
| Narrative | [`Timeline`](plugins/hyperscribe/references/catalog.md) | Time-ordered events (vertical or horizontal) | forbidden |
| Narrative | [`StepList`](plugins/hyperscribe/references/catalog.md) | Ordered steps / checklist with done/doing/todo/skipped state | forbidden |
| Dashboard | [`Dashboard`](plugins/hyperscribe/references/catalog.md) | 12-col grid of panels (children via `props.panels[].child`) | forbidden |
| Slides | [`SlideDeck`](plugins/hyperscribe/references/catalog.md) | Slide container; aspect 16:9 or 4:3 | required |
| Slides | [`Slide`](plugins/hyperscribe/references/catalog.md) | Single slide (title / content / two-col / quote / image / section) | forbidden |

The design system is Notion-inspired — warm neutrals, whisper borders, Inter font fallback chain — and every visual decision is owned by the renderer. Components carry semantic data only; styling props (`color`, `backgroundColor`, `fontSize`, `className`, etc.) are rejected by the schema. If a page wants a "red warning box" the envelope asks for `Callout severity="warn"`, never a hex code.

## Themes

Two bundled themes as of v0.3.1: `notion` (default, warm Notion-inspired) and `linear` (Linear-inspired, Inter Variable + OpenType features). Each theme ships with both **light and dark modes** in the same CSS file. Theme is **fixed at render time** (pass `--theme <name>` to `render.mjs`); **light/dark mode** is toggled by the user via the circular button in the top-right of every rendered page. The choice is persisted in `localStorage` as `hyperscribe.mode`, and `prefers-color-scheme: dark` is honored on first load.

Themes are pure CSS variable overrides — `plugins/hyperscribe/themes/*.css`. Each file defines tokens under `[data-theme="<name>"]` (light) and `[data-theme="<name>"][data-mode="dark"]` (dark). Semantic tones (`--hs-tone-{info|warn|success|danger}-{bg|fg}`) and the surface palette (`--hs-color-surface`, `--hs-color-surface-alt`) keep components legible in both modes without hardcoded colors.

## How it works

1. **User runs a command.** In Claude Code, the user types something like `/hyperscribe "architecture for a rate limiter"`.
2. **Skill prompt loads.** The plugin injects [`SKILL.md`](plugins/hyperscribe/SKILL.md) and the command template, giving the model the catalog, envelope format, and the rule that props carry semantic data only.
3. **Claude emits JSON.** The model classifies the intent, picks components, and produces an A2UI envelope — no HTML, no CSS, no styling decisions. Unknown component names, missing required props, and out-of-range enums are caught in step 4, not left to a broken browser render.
4. **CLI validates + renders.** `plugins/hyperscribe/scripts/render.mjs` walks the envelope against the schema in `plugins/hyperscribe/spec/catalog.json`; on success it builds a single HTML document with inlined CSS and per-component SSR. Exit codes: `0` success, `1` JSON parse error, `2` schema validation failure, `3` IO error, `4` render runtime error.
5. **Self-contained HTML lands on disk.** Output is written to `~/.hyperscribe/out/<slug>-<timestamp>.html`. No network, no external CSS, no build step — the file opens on a plane.
6. **Open in browser.** `open` on macOS, `xdg-open` on Linux — the agent prints the absolute path and a one-line summary so the user can re-open or share later.

## Roadmap

- **v0.4** — locally-inlined Mermaid and Chart.js so output is truly offline-capable; streaming render for long pages; additional themes (blueprint / editorial / paper / mono).
- **v0.5** — plugin API for user-defined components, A2UI two-way sync (renderer emits state updates back to the agent), theming via `~/.hyperscribe/theme.json` at full token scope.
- **On demand** — `npm`-published CLI so non-Claude-Code users can `npx hyperscribe` without cloning the repo.

## Contributing

Fork the repo, run `npm test` from the root (Node 20+ required — `node --test` against the `tests/` suite), make your change on a branch, and open a PR. For envelope format and component schemas, see [`plugins/hyperscribe/references/catalog.md`](plugins/hyperscribe/references/catalog.md) and [`plugins/hyperscribe/spec/catalog.json`](plugins/hyperscribe/spec/catalog.json).

Issues and discussion: [github.com/Atipico1/hyperscribe/issues](https://github.com/Atipico1/hyperscribe/issues).

## License

MIT — see [LICENSE](LICENSE).

Copyright (c) 2026 Hyperscribe contributors.

## Credits

- [nicobailon/visual-explainer](https://github.com/nicobailon/visual-explainer) — the original "agents should render to the browser" insight and the proactive-rendering behavior Hyperscribe carries forward.
- [A2UI v0.9](https://developers.googleblog.com/) (Google Developers Blog) — envelope shape (`a2ui_version`, `catalog`, `parts`, `is_task_complete`) is borrowed wholesale so Hyperscribe envelopes can interoperate with other A2UI tooling.
- [Chart.js](https://www.chartjs.org/) and [Mermaid](https://mermaid.js.org/) for the diagram / chart surfaces referenced by the `Chart` and `Mermaid` components.
