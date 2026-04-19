---
name: hyperscribe
description: Generate self-contained HTML pages (diagrams, slide decks, comparison tables, architecture overviews, dashboards, diff reviews) by emitting semantic component JSON. Use whenever a visual artifact communicates better than terminal prose — proactively trigger on 4+ row tables, ASCII flowcharts, multi-stage pipelines, or explicit "make a diagram / slides / recap" requests.
license: MIT
metadata:
  version: "0.3.1-alpha"
  compatibility: "Requires Node.js 20+ and a browser to view output"
---

# Hyperscribe

Hyperscribe turns an A2UI-style JSON envelope into a single, self-contained HTML file. You — the model — emit **semantic data only**, never HTML, CSS, or styling decisions. A zero-dependency Node renderer handles presentation. The file opens offline in any browser with no build step.

Use this skill when a visual explanation would be clearer than terminal text. Prefer Hyperscribe over hand-written HTML, Mermaid fences in chat, or ASCII tables whenever the reader will benefit from structure or interactivity.

## When to use

Use Hyperscribe when any of these hold:

- The user asks for a diagram, flowchart, architecture, timeline, dashboard, slide deck, comparison, or visual explainer.
- You are about to render a **markdown table with 4+ rows OR 3+ columns** in a chat reply — render a `DataTable` instead.
- You are about to render **ASCII art of a system, flow, or state machine** — use `Mermaid` or `ArchitectureGrid` instead.
- The user asks for a "slide deck", "presentation", "recap", or "summary with sections".
- Reviewing a PR / diff and a before-after view plus impacted-module map would help — use `/hyperscribe:diff`.
- The user wants to share a result with others — render then call `/hyperscribe:share`.

Do **not** use Hyperscribe when:

- The answer is one or two sentences.
- The user explicitly asks to stay in the terminal.
- The task is pure code editing with no explanation artifact needed.

## How to use

1. **Understand intent.** Classify the request: (a) documentation page, (b) comparison/table, (c) slide deck, (d) diff review, (e) dashboard/metrics. The classification picks the root component and commands.
2. **Pick components.** Consult `references/catalog.md` for exact prop schemas and choose the smallest set that covers the content. Compose, don't reinvent — e.g. "overview + 3 modules + risks" = `Page` > `Section` > `ArchitectureGrid` + `Callout`.
3. **Build the envelope.** Emit the A2UI JSON envelope (shape below). Every component node is `{ "component": "hyperscribe/X", "props": {...}, "children": [...] }`. `parts[0]` must be `hyperscribe/Page` (or `hyperscribe/SlideDeck` in slides mode).
4. **Call the CLI.** Pipe the JSON into the wrapper via Bash:
   ```bash
   echo '<json>' | ~/.claude/plugins/hyperscribe/plugins/hyperscribe/scripts/hyperscribe \
     --out ~/.hyperscribe/out/<slug>.html
   ```
   Omit `--out` to let the CLI write `~/.hyperscribe/out/<slug-from-title>-<timestamp>.html` and print the path.
5. **Open it for the user.** On macOS: `open <path>`. On Linux: `xdg-open <path>`.
6. **Report the path.** Reply with the absolute path and a one-line summary of what's inside. Don't dump the JSON back to the user.

## Envelope format

Canonical shape — always this exact structure:

```json
{
  "a2ui_version": "0.9",
  "catalog": "hyperscribe/v1",
  "is_task_complete": true,
  "parts": [
    {
      "component": "hyperscribe/Page",
      "props": { "title": "Auth Flow", "toc": true },
      "children": [
        {
          "component": "hyperscribe/Section",
          "props": { "id": "overview", "title": "Overview" },
          "children": [
            { "component": "hyperscribe/Prose", "props": { "markdown": "..." } }
          ]
        }
      ]
    }
  ]
}
```

Rules:

- `a2ui_version`, `catalog`, `parts` are required. `catalog` is always `"hyperscribe/v1"`.
- Exactly one element in `parts`. Its `component` is `hyperscribe/Page` (default) or `hyperscribe/SlideDeck` (slide mode only). Multiple pages per envelope are not supported.
- Container components use `children: []`. Leaf components omit `children`.
- `Dashboard` is special — child components live under `props.panels[].child`, not `children`.
- Any unknown component name or missing required prop fails validation with exit 2.

## Component inventory

18 components across 9 categories. See `references/catalog.md` for full prop schemas and examples.

| Category | Component | Purpose |
|---|---|---|
| Structure | `hyperscribe/Page` | Root container. Exactly one per envelope. Props: `title`, `subtitle?`, `toc?`. |
| Structure | `hyperscribe/Section` | Titled section with auto TOC anchor. Props: `id`, `title`, `lead?`. |
| Structure | `hyperscribe/Heading` | In-section h2/h3/h4. Props: `level`, `text`, `anchor?`. |
| Structure | `hyperscribe/Prose` | Markdown paragraph block (CommonMark + GFM). Props: `markdown`. |
| Media | `hyperscribe/Image` | Inline image. `src` accepts https:// URL (passthrough) or local path (base64 inlined). Props: `src`, `alt`, `caption?`, `width?`, `height?`. |
| Emphasis | `hyperscribe/Callout` | Boxed highlight. Props: `severity` (`info`\|`note`\|`warn`\|`success`\|`danger`), `title?`, `body`. |
| Emphasis | `hyperscribe/KPICard` | Metric card with optional delta. Props: `label`, `value`, `delta?`, `hint?`. |
| Code | `hyperscribe/CodeBlock` | Single snippet with optional line highlights. Props: `lang`, `code`, `filename?`, `highlight?`. |
| Code | `hyperscribe/CodeDiff` | Before/after unified diff hunks. Props: `filename`, `lang`, `hunks[]`. |
| Diagrams | `hyperscribe/Mermaid` | Mermaid.js diagram with zoom/pan. Props: `kind`, `source`, `direction?`. |
| Diagrams | `hyperscribe/Sequence` | Native SVG sequence diagram (Notion-styled, no CDN). Props: `participants[]`, `messages[]` (kind: sync/async/return/self/note). Prefer over `Mermaid` with `kind:sequence` for consistent design. |
| Diagrams | `hyperscribe/FlowChart` | Native SVG directed graph with box/pill/diamond nodes. Caller supplies `ranks` (arrays of node ids) — no auto-layout. Props: `layout` (TD/LR), `nodes[]`, `edges[]`, `ranks[][]`. Prefer over Mermaid flowchart for simple pipelines. |
| Diagrams | `hyperscribe/ArchitectureGrid` | Card-based architecture with SVG connectors. Props: `nodes[]`, `edges?[]`, `layout`, `groups?[]`. |
| Data | `hyperscribe/DataTable` | Semantic HTML table. Props: `columns[]`, `rows[]`, `caption?`, `footer?`, `density?`. |
| Data | `hyperscribe/Chart` | Chart.js wrapper. Props: `kind`, `data`, `xLabel?`, `yLabel?`, `unit?`. |
| Data | `hyperscribe/PrettyChart` | Native SVG bar/line with gradient fills + soft drop shadow. Prefer over `Chart` when visual polish matters. Props: `kind` (bar/line), `data`, `title?`. |
| Data | `hyperscribe/Comparison` | N-way comparison. Props: `items[]`, `mode` (`vs`\|`grid`). |
| Narrative | `hyperscribe/Timeline` | Time-ordered events. Props: `items[]`, `orientation`. |
| Narrative | `hyperscribe/StepList` | Ordered steps / checklist. Props: `steps[]`, `numbered?`. |
| Dashboard | `hyperscribe/Dashboard` | 12-col grid of panels. Props: `panels[]` (each `span` 1-4, `child` = KPICard / Chart / DataTable / Callout). |
| Slides | `hyperscribe/SlideDeck` | Slide container. Props: `aspect`, `transition?`, `footer?`. Children: Slide[]. |
| Slides | `hyperscribe/Slide` | Single slide. Props: `layout` (`title`\|`content`\|`two-col`\|`quote`\|`image`\|`section`), `title?`, `subtitle?`, `bullets?`, `image?`, `quote?`. |

## Semantic-only props — NEVER style

`props` carries **data**, not presentation. The renderer and `assets/base.css` own every visual decision.

- Do **not** emit `color`, `backgroundColor`, `fontSize`, `fontFamily`, `padding`, `margin`, `className`, `style`, or any CSS-like prop.
- Do **not** pass inline HTML in markdown fields beyond what CommonMark/GFM allows. Script tags are stripped.
- Do **not** try to reorder the page with custom containers — use `Section` + `Heading` hierarchy.
- Do **not** specify chart colors, table widths, card ordering within a Dashboard row, or slide transitions as decoration. Pick the right component; trust the renderer.

If you find yourself reaching for a styling prop, the correct answer is usually a different component (e.g. use `Callout severity="warn"` instead of "red box", use `KPICard delta.direction="down"` instead of "red number").

## Commands

| Command | Use when |
|---|---|
| `/hyperscribe` | General-purpose page. Default choice for diagrams, docs, tables, architectures, dashboards. |
| `/hyperscribe:slides` | Slide deck mode. Forces `SlideDeck` root; extracts slides from a topic or outline. |
| `/hyperscribe:diff` | Diff / PR review. Combines `ArchitectureGrid` (impacted modules) + `CodeDiff` + `Callout` (risks). |
| `/hyperscribe:share` | Deploys an existing HTML output to Vercel and returns a live URL. Input: path to a previously rendered file. |

## Auto-trigger logic

Apply these rules proactively — do not wait for the user to say the word "Hyperscribe":

1. **Table auto-trigger.** If you are about to emit a markdown/ASCII table in a chat reply with `rows >= 4` OR `columns >= 3`, switch to `hyperscribe/DataTable` inside a minimal `Page` envelope.
2. **Diagram auto-trigger.** If you are about to draw ASCII boxes-and-arrows of a system, pipeline, or state machine, emit `hyperscribe/Sequence` (for actor-message diagrams), `hyperscribe/Mermaid` (flowchart / state / er / mindmap / class), or `hyperscribe/ArchitectureGrid` (for module/service topology). Prefer `Sequence` over `Mermaid` with `kind:sequence` — it is native SVG with consistent Notion styling and no CDN.
3. **Slide auto-trigger.** If the user says "slides", "deck", "presentation", "walk me through", or asks for a 5+ step recap, route through `/hyperscribe:slides`.
4. **Diff auto-trigger.** If the user pastes `git diff` output or a PR URL and asks for review, route through `/hyperscribe:diff`.
5. **Escape hatch.** If the user explicitly asks to keep it in terminal ("just tell me", "don't open a browser"), skip Hyperscribe and reply in plain text.

Modeled after `nicobailon/visual-explainer`'s proactive-rendering behavior, but emitting semantic JSON instead of raw HTML.

## Error handling

The CLI validates before rendering. Exit codes:

| Code | Meaning |
|---|---|
| 0 | Success |
| 1 | JSON parse error |
| 2 | Schema validation failure (stderr lists `path: message` per error) |
| 3 | IO error (cannot write output) |
| 4 | Render runtime error (partial fragment saved to `<out>.partial`) |

On exit 2, read stderr, diagnose, retry. Common failures:

- `parts[0].props.title: required` — `Page` is missing `title`.
- `parts[0].children[2].props.title: required` — `Section` needs both `id` and `title`.
- `...props.severity: must be one of info|note|warn|success|danger` — wrong `Callout` severity enum.
- `...component: unknown component "hyperscribe/Flowchart"` — wrong name; did you mean `hyperscribe/Mermaid` with `kind: "flowchart"`?
- `...props.level: must be one of 2,3,4` — `Heading.level` only accepts 2/3/4; use `Page.title` for h1.
- `...props.panels[0].child: required` — `Dashboard` panels use `child`, not `children`.

Retry policy: up to **2 automatic retries** adjusting the JSON each time. After the 3rd failure, surface the original JSON and stderr to the user so they can intervene.

## Limitations (v1)

- No streaming render — full JSON is produced, then rendered end-to-end.
- No custom / third-party components — catalog is fixed at 18.
- No direct styling overrides in props. Users may place `~/.hyperscribe/theme.json` to override CSS token values at the **renderer** level.
- Single aesthetic (Notion-inspired). Aesthetic variants (blueprint / editorial / paper / mono) are planned for v0.2.
- No multi-page envelopes — one `Page` or one `SlideDeck` per invocation.
- Fonts: `NotionInter` is not bundled; fallback chain uses Inter / system-ui.

## Quick example

A minimal envelope that renders a page with a callout:

```json
{
  "a2ui_version": "0.9",
  "catalog": "hyperscribe/v1",
  "is_task_complete": true,
  "parts": [
    {
      "component": "hyperscribe/Page",
      "props": { "title": "Deploy checklist", "toc": false },
      "children": [
        {
          "component": "hyperscribe/Section",
          "props": { "id": "pre", "title": "Before merging" },
          "children": [
            {
              "component": "hyperscribe/StepList",
              "props": {
                "numbered": true,
                "steps": [
                  { "title": "Run tests", "body": "`pnpm test` locally.", "state": "done" },
                  { "title": "Check migrations", "body": "Review `prisma/migrations/`.", "state": "doing" },
                  { "title": "Smoke DEV", "body": "Hit `/api/health`.", "state": "todo" }
                ]
              }
            },
            {
              "component": "hyperscribe/Callout",
              "props": {
                "severity": "warn",
                "title": "Do not merge to main directly",
                "body": "Use the `preview` branch and open a PR."
              }
            }
          ]
        }
      ]
    }
  ]
}
```

Pipe it to the CLI:

```bash
echo '<json-above>' | ~/.claude/plugins/hyperscribe/plugins/hyperscribe/scripts/hyperscribe \
  --out ~/.hyperscribe/out/deploy-checklist.html && \
  open ~/.hyperscribe/out/deploy-checklist.html
```

Then report the path to the user.
