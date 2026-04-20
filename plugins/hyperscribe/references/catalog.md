# Hyperscribe Component Catalog — hyperscribe/v1

**This file is auto-generated from `plugins/hyperscribe/spec/catalog.json`. Do not edit by hand. Run `node tools/build-catalog-md.mjs` to regenerate.**

## Envelope

Every Hyperscribe document uses this envelope:

```json
{
  "a2ui_version": "0.9",
  "catalog": "hyperscribe/v1",
  "is_task_complete": true,
  "parts": [ /* exactly one hyperscribe/Page */ ]
}
```

Required envelope fields: `a2ui_version`, `catalog`, `parts`.

Root component must be `hyperscribe/Page`.

## Components (24 default + 2 slide-mode-only)

The default `/hyperscribe` page mode uses the components below.

`hyperscribe/SlideDeck` and `hyperscribe/Slide` are **slide-mode-only** components owned by `/hyperscribe:slides`.

## Structure

### `hyperscribe/Page`

Root container. Exactly one Page per envelope.

- **Children:** required

| Prop | Type | Required | Notes |
|---|---|---|---|
| `title` | `string` | **required** |  |
| `subtitle` | `string` | optional |  |
| `toc` | `boolean` | optional | default: `false` |

### `hyperscribe/Section`

First-class section. Auto TOC anchor.

- **Children:** allowed

| Prop | Type | Required | Notes |
|---|---|---|---|
| `id` | `string` | **required** | pattern: `^[a-z0-9][a-z0-9-]*$` |
| `title` | `string` | **required** |  |
| `lead` | `string` | optional |  |

### `hyperscribe/Heading`

In-section heading (h2-h4).

- **Children:** forbidden

| Prop | Type | Required | Notes |
|---|---|---|---|
| `level` | `2 | 3 | 4` | **required** |  |
| `text` | `string` | **required** |  |
| `anchor` | `string` | optional | pattern: `^[a-z0-9][a-z0-9-]*$` |

### `hyperscribe/Prose`

Markdown paragraph block (inline formatting + lists).

- **Children:** forbidden

| Prop | Type | Required | Notes |
|---|---|---|---|
| `markdown` | `string` | **required** |  |

## Media

### `hyperscribe/Image`

Inline image. Accepts https:// URLs (passed through) or local paths (base64-inlined at render time to keep the HTML self-contained).

- **Children:** forbidden

| Prop | Type | Required | Notes |
|---|---|---|---|
| `src` | `string` | **required** |  |
| `alt` | `string` | **required** |  |
| `caption` | `string` | optional |  |
| `width` | `number` | optional |  |
| `height` | `number` | optional |  |

## Emphasis

### `hyperscribe/Callout`

Boxed highlight.

- **Children:** forbidden

| Prop | Type | Required | Notes |
|---|---|---|---|
| `severity` | `"info" | "note" | "warn" | "success" | "danger"` | **required** |  |
| `title` | `string` | optional |  |
| `body` | `string` | **required** |  |

### `hyperscribe/KPICard`

Metric card with optional delta.

- **Children:** forbidden

| Prop | Type | Required | Notes |
|---|---|---|---|
| `label` | `string` | **required** |  |
| `value` | `string` | **required** |  |
| `delta` | `{ value: string, direction: "up" | "down" | "flat" }` | optional |  |
| `hint` | `string` | optional |  |

## Code

### `hyperscribe/CodeBlock`

Single code snippet.

- **Children:** forbidden

| Prop | Type | Required | Notes |
|---|---|---|---|
| `lang` | `string` | **required** |  |
| `code` | `string` | **required** |  |
| `filename` | `string` | optional |  |
| `highlight` | `array<number>` | optional |  |

### `hyperscribe/CodeDiff`

Before/after unified diff.

- **Children:** forbidden

| Prop | Type | Required | Notes |
|---|---|---|---|
| `filename` | `string` | **required** |  |
| `lang` | `string` | **required** |  |
| `hunks` | `array<{ before: string, after: string, atLine: number? }>` | **required** |  |

## Diagrams

### `hyperscribe/Mermaid`

Mermaid.js diagram wrapper with zoom/pan.

- **Children:** forbidden

| Prop | Type | Required | Notes |
|---|---|---|---|
| `kind` | `"flowchart" | "sequence" | "er" | "state" | "mindmap" | "class"` | **required** |  |
| `source` | `string` | **required** |  |
| `direction` | `"TD" | "LR"` | optional |  |

### `hyperscribe/Sequence`

Native SVG sequence diagram, Hyperscribe-styled. Prefer over Mermaid 'sequence' when you want consistent design and no external CDN.

- **Children:** forbidden

| Prop | Type | Required | Notes |
|---|---|---|---|
| `participants` | `array<{ id: string, title: string, subtitle: string? }>` | **required** |  |
| `messages` | `array<{ from: string?, to: string?, text: string, kind: "sync" | "async" | "return" | "self" | "note"?, over: array<string>? }>` | **required** |  |

### `hyperscribe/ArchitectureGrid`

Card-based architecture with SVG connectors.

- **Children:** forbidden

| Prop | Type | Required | Notes |
|---|---|---|---|
| `nodes` | `array<{ id: string, title: string, description: string?, icon: string?, tag: string? }>` | **required** |  |
| `edges` | `array<{ from: string, to: string, label: string?, style: "data" | "control" | "dep"? }>` | optional |  |
| `layout` | `"grid" | "columns" | "layers"` | **required** |  |
| `groups` | `array<{ id: string, title: string, nodeIds: array<string> }>` | optional |  |

### `hyperscribe/FlowChart`

Native SVG directed graph. Ranked layout (TD or LR) — caller provides `ranks` (array of arrays of node ids) so no layout solver is needed. Prefer over Mermaid flowchart for simple pipelines with consistent design.

- **Children:** forbidden

| Prop | Type | Required | Notes |
|---|---|---|---|
| `layout` | `"TD" | "LR"` | **required** |  |
| `nodes` | `array<{ id: string, label: string, shape: "box" | "pill" | "diamond"?, tag: string? }>` | **required** |  |
| `edges` | `array<{ from: string, to: string, label: string? }>` | **required** |  |
| `ranks` | `array<array<string>>` | **required** |  |

### `hyperscribe/Quadrant`

2x2 prioritization matrix with plotted points.

- **Children:** forbidden

| Prop | Type | Required | Notes |
|---|---|---|---|
| `xLabel` | `string` | **required** |  |
| `yLabel` | `string` | **required** |  |
| `quadrants` | `array<{ id: string, title: string, description: string? }>` | **required** |  |
| `points` | `array<{ label: string, x: number, y: number, tag: string?, tone: "accent" | "muted" | "success" | "warn"? }>` | optional |  |

### `hyperscribe/Swimlane`

Lane-based process diagram laid out on a shared timeline.

- **Children:** forbidden

| Prop | Type | Required | Notes |
|---|---|---|---|
| `lanes` | `array<{ id: string, title: string, subtitle: string? }>` | **required** |  |
| `steps` | `array<{ id: string, lane: string, title: string, description: string?, tag: string? }>` | **required** |  |
| `edges` | `array<{ from: string, to: string, label: string? }>` | optional |  |

## Data

### `hyperscribe/DataTable`

Semantic HTML table.

- **Children:** forbidden

| Prop | Type | Required | Notes |
|---|---|---|---|
| `columns` | `array<{ key: string, label: string, align: "left" | "center" | "right"?, wrap: boolean? }>` | **required** |  |
| `rows` | `array<object>` | **required** |  |
| `caption` | `string` | optional |  |
| `footer` | `object` | optional |  |
| `density` | `"compact" | "standard"` | optional |  |

### `hyperscribe/Chart`

Chart.js wrapper.

- **Children:** forbidden

| Prop | Type | Required | Notes |
|---|---|---|---|
| `kind` | `"line" | "bar" | "pie" | "area" | "scatter"` | **required** |  |
| `data` | `{ labels: array<string>, series: array<{ name: string, values: array<number> }> }` | **required** |  |
| `xLabel` | `string` | optional |  |
| `yLabel` | `string` | optional |  |
| `unit` | `string` | optional |  |

### `hyperscribe/Comparison`

N-way comparison layout.

- **Children:** forbidden

| Prop | Type | Required | Notes |
|---|---|---|---|
| `items` | `array<{ title: string, subtitle: string?, bullets: array<string>, verdict: { label: string, tone: string }? }>` | **required** |  |
| `mode` | `"vs" | "grid"` | **required** |  |

## Narrative

### `hyperscribe/StepList`

Ordered steps / checklist.

- **Children:** forbidden

| Prop | Type | Required | Notes |
|---|---|---|---|
| `steps` | `array<{ title: string, body: string, state: "done" | "doing" | "todo" | "skipped"? }>` | **required** |  |
| `numbered` | `boolean` | optional | default: `true` |

## Other

### `hyperscribe/FileTree`

Directory/file structure visualization. Recursive nodes with optional highlights.

- **Children:** forbidden

| Prop | Type | Required | Notes |
|---|---|---|---|
| `nodes` | `array<any>` | **required** |  |
| `showIcons` | `boolean` | optional | default: `true` |
| `caption` | `string` | optional |  |

### `hyperscribe/DependencyGraph`

Module/import dependency visualization (ranked layout).

- **Children:** forbidden

| Prop | Type | Required | Notes |
|---|---|---|---|
| `nodes` | `array<any>` | **required** |  |
| `edges` | `array<any>` | **required** |  |
| `layout` | `"ranks"` | **required** |  |
| `ranks` | `array<any>` | **required** |  |

### `hyperscribe/FileCard`

Per-file summary card — name, path, LOC, responsibility, exports, change state.

- **Children:** forbidden

| Prop | Type | Required | Notes |
|---|---|---|---|
| `name` | `string` | **required** |  |
| `path` | `string` | optional |  |
| `loc` | `number` | optional |  |
| `responsibility` | `string` | **required** |  |
| `exports` | `array<any>` | optional |  |
| `state` | `"modified" | "added" | "removed" | "stable"` | optional | default: `"stable"` |
| `icon` | `string` | optional |  |

### `hyperscribe/AnnotatedCode`

Code block with numbered pins linking to side annotations.

- **Children:** forbidden

| Prop | Type | Required | Notes |
|---|---|---|---|
| `lang` | `string` | **required** |  |
| `code` | `string` | **required** |  |
| `filename` | `string` | optional |  |
| `annotations` | `array<any>` | **required** |  |
| `pinStyle` | `"numbered" | "lettered"` | optional | default: `"numbered"` |

### `hyperscribe/ERDDiagram`

Entity-relationship diagram — DB/type schemas with pk/fk/nullable markers and cardinality links.

- **Children:** forbidden

| Prop | Type | Required | Notes |
|---|---|---|---|
| `entities` | `array<any>` | **required** |  |
| `relationships` | `array<any>` | **required** |  |
| `layout` | `"grid" | "columns"` | optional | default: `"grid"` |

## Slide Mode Only

These components are intentionally separated from the default page-mode inventory. Use them through `/hyperscribe:slides`, not through the default `/hyperscribe` flow.

### `hyperscribe/SlideDeck`

Slide container.

- **Children:** required

| Prop | Type | Required | Notes |
|---|---|---|---|
| `aspect` | `"16:9" | "4:3"` | **required** |  |
| `transition` | `"none" | "fade" | "slide"` | optional |  |
| `footer` | `string` | optional |  |

### `hyperscribe/Slide`

Single slide.

- **Children:** forbidden

| Prop | Type | Required | Notes |
|---|---|---|---|
| `layout` | `"title" | "content" | "two-col" | "quote" | "image" | "section"` | **required** |  |
| `title` | `string` | optional |  |
| `subtitle` | `string` | optional |  |
| `bullets` | `array<string>` | optional |  |
| `image` | `string` | optional |  |
| `quote` | `string` | optional |  |

## Rules

- `props` must contain ONLY semantic data — never colors, fonts, sizes, or layout hints.
- `children` is used for container components (Page, Section). In slide mode, `SlideDeck` owns `Slide[]`.
- Unknown component names or props are rejected at schema validation (exit 2).
- Enum values are case-sensitive.
- String patterns (e.g. Section.id) are regex-matched.
