# Hyperscribe Component Catalog — hyperscribe/v1

**This file is auto-generated from `spec/catalog.json`. Do not edit by hand. Run `node tools/build-catalog-md.mjs` to regenerate.**

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

## Components (18 total)

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

### `hyperscribe/ArchitectureGrid`

Card-based architecture with SVG connectors.

- **Children:** forbidden

| Prop | Type | Required | Notes |
|---|---|---|---|
| `nodes` | `array<{ id: string, title: string, description: string?, icon: string?, tag: string? }>` | **required** |  |
| `edges` | `array<{ from: string, to: string, label: string?, style: "data" | "control" | "dep"? }>` | optional |  |
| `layout` | `"grid" | "columns" | "layers"` | **required** |  |
| `groups` | `array<{ id: string, title: string, nodeIds: array<string> }>` | optional |  |

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

### `hyperscribe/Timeline`

Time-ordered events.

- **Children:** forbidden

| Prop | Type | Required | Notes |
|---|---|---|---|
| `items` | `array<{ when: string, title: string, body: string?, tag: string? }>` | **required** |  |
| `orientation` | `"vertical" | "horizontal"` | **required** |  |

### `hyperscribe/StepList`

Ordered steps / checklist.

- **Children:** forbidden

| Prop | Type | Required | Notes |
|---|---|---|---|
| `steps` | `array<{ title: string, body: string, state: "done" | "doing" | "todo" | "skipped"? }>` | **required** |  |
| `numbered` | `boolean` | optional | default: `true` |

## Dashboard

### `hyperscribe/Dashboard`

12-col grid of panels.

- **Children:** forbidden

| Prop | Type | Required | Notes |
|---|---|---|---|
| `panels` | `array<{ span: 1 | 2 | 3 | 4, child: object }>` | **required** |  |

## Slides

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
- `children` is used for container components (Page, Section, SlideDeck). For Dashboard, nested content goes in `props.panels[].child` instead.
- Unknown component names or props are rejected at schema validation (exit 2).
- Enum values are case-sensitive.
- String patterns (e.g. Section.id) are regex-matched.
