---
name: hyperscribe
description: Generate self-contained HTML pages and slide decks (diagrams, comparison tables, architecture overviews, diff reviews, visual recaps) by emitting semantic component JSON. Use whenever a visual artifact communicates better than terminal prose — proactively trigger on 4+ row tables, ASCII flowcharts, multi-stage pipelines, or explicit "make a diagram / slides / recap" requests.
license: MIT
metadata:
  version: "0.5.2-alpha"
  compatibility: "Requires Node.js 20+ and a browser to view output"
---

# Hyperscribe

Hyperscribe turns an A2UI-style JSON envelope into a single, self-contained HTML file. You — the model — emit **semantic data only**, never HTML, CSS, or styling decisions. A zero-dependency Node renderer handles presentation. The file opens offline in any browser with no build step.

Use this skill when a visual explanation would be clearer than terminal text. Prefer Hyperscribe over hand-written HTML, Mermaid fences in chat, or ASCII tables whenever the reader will benefit from structure or interactivity.

## When to use

Use Hyperscribe when any of these hold:

- The user asks for a diagram, flowchart, architecture, process view, slide deck, comparison, or visual explainer.
- You are about to render a **markdown table with 4+ rows OR 3+ columns** in a chat reply — render a `DataTable` instead.
- You are about to render **ASCII art of a system, flow, or state machine** — use `Mermaid` or `ArchitectureGrid` instead.
- The user asks for a "slide deck", "presentation", "recap", or "summary with sections".
- Reviewing a PR / diff and a before-after view plus impacted-module map would help — use `/hyperscribe:diff`.
- The user wants to share a result with others — render then call `/hyperscribe:share`.

Do **not** use Hyperscribe when:

- The answer is one or two sentences.
- The user explicitly asks to stay in the terminal.
- The task is pure code editing with no explanation artifact needed.

## Step 0 — resolve the user's theme preference (always run first)

Before building any envelope, resolve the user's theme + mode. If no preference file exists yet, prompt once, save, then proceed. This runs on every invocation of the main skill and its variants.

```bash
# 1. Resolve preference path: project-local first, then global.
PREF=""
for p in ./.hyperscribe/preference.md ~/.hyperscribe/preference.md; do
  [ -f "$p" ] && { PREF="$p"; break; }
done

# 2. First run — prompt and save defaults to ~/.hyperscribe/preference.md
if [ -z "$PREF" ]; then
  # Claude Code: ask via AskUserQuestion (theme 4-choice, mode 3-choice).
  # Other agents: print the prompt below and wait for a single-line answer.
  cat <<'PROMPT'
Hyperscribe first-run setup. Pick a theme and mode.

Themes:  1) studio    (Airtable — clean enterprise canvas + Airtable Blue)
         2) midnight  (Cal.com — grayscale monochrome + Cal Sans display)
         3) void      (Bugatti — architectural black + 3-color discipline)
         4) gallery   (Apple — cinematic binary surfaces + SF Pro)

Modes:   light / dark / auto

Reply with "<theme> <mode>" (e.g., "studio light"),
a single theme name (mode=light),
or "skip" to use studio + light.
PROMPT
  # Parse the user's answer into $THEME and $MODE.
  # If unparseable or empty, fall back to defaults silently.
  THEME="studio"
  MODE="light"
  # (Agents with AskUserQuestion populate $THEME and $MODE from the structured answer.)

  mkdir -p ~/.hyperscribe
  PREF=~/.hyperscribe/preference.md
  cat > "$PREF" <<EOF
---
theme: $THEME
mode: $MODE
created_at: $(date -u +%Y-%m-%dT%H:%M:%SZ)
---

# Hyperscribe preferences

Edit the values above to change your defaults. Delete this file to re-run
the first-run setup on the next hyperscribe invocation.

Valid values:
  theme: studio | midnight | void | gallery
  mode:  light | dark | auto
EOF
fi

# 3. Read preference into env vars (every run)
THEME=$(awk -F': *' '/^theme:/{print $2; exit}' "$PREF")
MODE=$(awk -F': *'  '/^mode:/{print $2; exit}'  "$PREF")
[ -z "$THEME" ] && THEME=studio
[ -z "$MODE" ]  && MODE=light
```

When invoking the renderer in later steps, always pass `--theme "$THEME"` and — when `$MODE` is `light` or `dark` — `--mode "$MODE"`. When `$MODE` is `auto`, omit `--mode` so the page follows `prefers-color-scheme` and localStorage at load time.

## How to use

1. **Understand intent.** Classify the request: (a) documentation page, (b) comparison/table, (c) slide deck, (d) diff review, (e) metrics/status page. The classification picks the root component and commands.
2. **Pick components.** Consult `references/catalog.md` for exact prop schemas and choose the smallest set that covers the content. Compose, don't reinvent — e.g. "overview + 3 modules + risks" = `Page` > `Section` > `ArchitectureGrid` + `Callout`.
3. **Build the envelope.** Emit the A2UI JSON envelope (shape below). Every component node is `{ "component": "hyperscribe/X", "props": {...}, "children": [...] }`. `parts[0]` must be `hyperscribe/Page` (or `hyperscribe/SlideDeck` in slides mode).
4. **Call the CLI.** Pipe the JSON into the wrapper via Bash:
   ```bash
   HS=$(for p in \
     ./.claude/skills/hyperscribe ~/.claude/skills/hyperscribe \
     ./.codex/skills/hyperscribe ~/.codex/skills/hyperscribe \
     ./.cursor/skills/hyperscribe ~/.cursor/skills/hyperscribe \
     ./.opencode/skills/hyperscribe ~/.opencode/skills/hyperscribe \
     ~/.claude/plugins/cache/hyperscribe-marketplace/*/plugins/hyperscribe \
     ./plugins/hyperscribe
   do [ -x "$p/scripts/hyperscribe" ] && { echo "$p/scripts/hyperscribe"; break; }; done)

   MODE_FLAG=""
   [ "$MODE" = "light" ] && MODE_FLAG="--mode light"
   [ "$MODE" = "dark" ]  && MODE_FLAG="--mode dark"

   mkdir -p ~/.hyperscribe/out
   echo '<json>' | "$HS" --theme "$THEME" $MODE_FLAG --out ~/.hyperscribe/out/<slug>.html
   ```
   Omit `--out` to let the CLI write `~/.hyperscribe/out/<slug-from-title>-<timestamp>.html` and print the path.
5. **Open it for the user.** On macOS: `open <path>`. On Linux: `xdg-open <path>`.
6. **Report the path.** Reply with the absolute path and a one-line summary of what's inside. Don't dump the JSON back to the user.

## Visualization planning

Before choosing components, make one fast pass over the content and decide what kind of visual this should be.

### 1. Classify the content

- **Topology** — systems, modules, services, ownership boundaries, dependencies.
- **Flow** — pipelines, request lifecycles, state changes, ordered handoffs.
- **Comparison** — options, before/after, trade-offs, audits, matrices.
- **Evidence** — metrics, tables, file inventories, code excerpts.
- **Narrative** — recap, walkthrough, phased explanation, summary for humans.

Most useful pages mix 2-3 of these, but one should dominate.

### 2. Pick the dominant visual surface first

- Use `ArchitectureGrid` when card content matters more than exact edge routing.
- Use `Mermaid` as the compatibility fallback for diagram types the native catalog does not cover.
- Use `Sequence` for actor-message timelines and request/response traces.
- Use `FlowChart` for simple pipelines with ranked stages and explicit decisions.
- Use `Swimlane` when the same process must be grouped by role, team, service, or lane.
- Use `Quadrant` for 2x2 prioritization, risk, or positioning matrices.
- Use `Comparison` or `DataTable` when the user needs side-by-side evaluation rather than a diagram.
- Use `Chart` only when the numbers themselves carry the point; do not chart tiny or mostly categorical data just to make the page feel visual.
- Use `StepList` when sequence matters but a diagram would add noise.

### 2.1 Resolve close calls

| If deciding between | Prefer this | When |
|---|---|---|
| `Sequence` vs `Swimlane` | `Sequence` | Actors exchange messages over time. |
| `Sequence` vs `Swimlane` | `Swimlane` | Work moves across lanes and ownership is the point. |
| `FlowChart` vs `Swimlane` | `FlowChart` | The stages are ordered and lane ownership is secondary. |
| `ArchitectureGrid` vs `FlowChart` | `ArchitectureGrid` | The user needs module/service shape, responsibilities, or boundaries. |
| `ArchitectureGrid` vs `FlowChart` | `FlowChart` | The user needs a pipeline, decision path, or lifecycle. |
| `Comparison` vs `Quadrant` | `Comparison` | Options need bullets, trade-offs, or verdicts. |
| `Comparison` vs `Quadrant` | `Quadrant` | Positioning on two axes is the main message. |
| `DataTable` vs `Chart` | `DataTable` | Exact values, labels, or rows matter. |
| `DataTable` vs `Chart` | `Chart` | Shape, trend, or magnitude is the main point. |
| `CodeBlock` vs `AnnotatedCode` | `AnnotatedCode` | Specific lines need explanation. |
| `CodeBlock` vs `CodeDiff` | `CodeDiff` | The change itself is the point. |

### 3. Compose around that surface

Prefer these page recipes:

- **Architecture explainer**:
  `Page` -> `Section` overview with `Prose` or `Callout` -> supporting `ArchitectureGrid`, `FlowChart`, `Swimlane`, `FileTree`, or `FileCard`
- **Process walkthrough**:
  `Page` -> `Section` summary -> `Sequence` or `FlowChart` -> `StepList` -> `Callout` for failure modes or decisions
- **Comparison / decision memo**:
  `Page` -> `Section` framing -> `Comparison` or `DataTable` -> `Callout` recommendation -> optional `Chart`
- **Code / diff explainer**:
  `Page` -> architecture or flow context -> `CodeDiff` / `AnnotatedCode` / `CodeBlock` -> `Callout` risks -> `StepList` next actions
- **Repo / system recap**:
  `Page` -> short `Prose` summary -> one dominant diagram -> one evidence block (`FileTree`, `FileCard`, `DataTable`, or `Comparison`)
  For repo explainers, the first content section should usually be diagram-led, anchored by `ArchitectureGrid`, `FlowChart`, `Swimlane`, or `Sequence`.
  Use `FileTree`, `FileCard`, or `AnnotatedCode` as evidence surfaces instead of long explanatory prose.

### 4. Scale information density deliberately

- If the page has **one key idea**, use one dominant visual and keep supporting content sparse.
- If the page has **multiple sections**, each section should have one job: overview, topology, evidence, or next steps.
- If the content is dense, prefer multiple focused sections over one overloaded mega-diagram.
- If labels would become long paragraphs inside nodes, use `ArchitectureGrid` + surrounding prose instead of forcing everything into `Mermaid`.
- For repo explainers, architecture explainers, and system walkthroughs, use **no more than 2 Prose blocks** unless the user explicitly asks for a prose-heavy artifact.
- For repo explainers, include at least one of `ArchitectureGrid`, `FlowChart`, `Swimlane`, `Sequence`, or `Comparison` as the dominant visual surface.

### 5. Avoid weak compositions

- Do not stack unrelated components just to show variety.
- Do not use both `Mermaid` and `FlowChart` for the same exact relationship unless they tell different stories.
- Do not use both `Sequence` and `Swimlane` for the same exact process unless one shows messages and the other shows ownership.
- Do not open with a table when a diagram would explain the system faster.
- Do not open with long prose when the user asked for something visual.
- Do not use `Chart` where a `DataTable` or `Comparison` would be more legible.
- Avoid `Comparison` as the dominant visual for repo explainers unless the source is explicitly about alternatives, trade-offs, or before/after states.
- Do not create a page where every section has equal visual weight; decide what the eye should land on first.
- Use inline code sparingly. Reserve backticks for real file paths, commands, identifiers, and schema keys.
- No more than 1-2 inline code spans per paragraph or list item. If a section needs many identifiers, switch to `FileCard`, `CodeBlock`, `AnnotatedCode`, or a diagram label instead.
- Do not wrap every tool, noun, or phrase in backticks just because it is technical.

The test: if you removed one component and the page got clearer, it probably did not belong there.

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
- Any unknown component name or missing required prop fails validation with exit 2.

## Component inventory

23 default components across 7 categories. See `references/catalog.md` for full prop schemas and examples.

`hyperscribe/SlideDeck` and `hyperscribe/Slide` are **slide-mode-only** components owned by `/hyperscribe:slides`. They are intentionally excluded from the default page-mode inventory below.

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
| Diagrams | `hyperscribe/Quadrant` | 2x2 prioritization matrix with plotted points. Props: `xLabel`, `yLabel`, `quadrants[]`, `points?[]`. |
| Diagrams | `hyperscribe/Swimlane` | Lane-based process diagram across roles on a shared sequence. Props: `lanes[]`, `steps[]`, `edges?[]`. |
| Data | `hyperscribe/DataTable` | Semantic HTML table. Props: `columns[]`, `rows[]`, `caption?`, `footer?`, `density?`. |
| Data | `hyperscribe/Chart` | Chart.js wrapper. Props: `kind`, `data`, `xLabel?`, `yLabel?`, `unit?`. |
| Data | `hyperscribe/Comparison` | N-way comparison. Props: `items[]`, `mode` (`vs`\|`grid`). |
| Narrative | `hyperscribe/StepList` | Ordered steps / checklist. Props: `steps[]`, `numbered?`. |
| Structure | `hyperscribe/FileTree` | Directory/file structure. Props: `nodes` (recursive), `showIcons?`, `caption?`. |
| Structure | `hyperscribe/FileCard` | Per-file summary card. Props: `name`, `path?`, `loc?`, `responsibility`, `exports?[]`, `state?`. |
| Code | `hyperscribe/AnnotatedCode` | Code with pinned side annotations. Props: `lang`, `code`, `annotations[]`, `pinStyle?`. |
| Diagrams | `hyperscribe/ERDDiagram` | DB/type ERD. Props: `entities[]`, `relationships[]`, `layout?`. |

## Slide mode only

Use these only through `/hyperscribe:slides`:

| Category | Component | Purpose |
|---|---|---|
| Slides | `hyperscribe/SlideDeck` | Slide container. Props: `aspect`, `transition?`, `footer?`. Children: Slide[]. |
| Slides | `hyperscribe/Slide` | Single slide. Props: `layout` (`title`\|`content`\|`two-col`\|`quote`\|`image`\|`section`), `title?`, `subtitle?`, `bullets?`, `image?`, `quote?`. |

## Semantic-only props — NEVER style

`props` carries **data**, not presentation. The renderer and `assets/base.css` own every visual decision.

- Do **not** emit `color`, `backgroundColor`, `fontSize`, `fontFamily`, `padding`, `margin`, `className`, `style`, or any CSS-like prop.
- Do **not** pass inline HTML in markdown fields beyond what CommonMark/GFM allows. Script tags are stripped.
- Do **not** try to reorder the page with custom containers — use `Section` + `Heading` hierarchy.
- Do **not** specify chart colors, table widths, or slide transitions as decoration. Pick the right component; trust the renderer.

If you find yourself reaching for a styling prop, the correct answer is usually a different component (e.g. use `Callout severity="warn"` instead of "red box", use `KPICard delta.direction="down"` instead of "red number").

## Commands

| Command | Use when |
|---|---|
| `/hyperscribe` | General-purpose page. Default choice for diagrams, docs, tables, architectures, and metric summaries. |
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
Retry policy: up to **2 automatic retries** adjusting the JSON each time. After the 3rd failure, surface the original JSON and stderr to the user so they can intervene.

## Limitations (v1)

- No streaming render — full JSON is produced, then rendered end-to-end.
- No custom / third-party components — catalog is fixed at 23 default page components plus 2 slide-only components.
- No direct styling overrides in props. Users may place `~/.hyperscribe/theme.json` to override CSS token values at the **renderer** level.
- Themeable renderer. Built-in themes are `studio`, `midnight`, `void`, and `gallery`.
- No multi-page envelopes — one `Page` per default invocation. Slide mode uses one `SlideDeck`.
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
