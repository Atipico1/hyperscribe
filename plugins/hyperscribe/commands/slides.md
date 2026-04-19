---
name: slides
description: Generate a slide deck (SlideDeck + multiple Slides) for presentations. Uses keyboard navigation (arrow keys, Home/End).
argument-hint: <topic or outline>
---

You are invoking Hyperscribe's slide-deck mode. The user asked for slides about:

$ARGUMENTS

## Rules for slide mode

1. **Root MUST be `hyperscribe/SlideDeck`.** NOT Page. Slides never nest inside Page.
2. SlideDeck's `children` must be an array of `hyperscribe/Slide` objects — nothing else.
3. Choose `aspect`: `"16:9"` (default for widescreen) or `"4:3"` (compact/legacy).
4. Optional `transition: "fade" | "slide"` for visual polish.
5. Include a `footer` with the topic or date.

## Slide layout picker

| Layout | Use when | Props used |
|---|---|---|
| `title` | Opening/cover slide | title, subtitle |
| `section` | Divider between major parts | title, subtitle |
| `content` | Single-topic slide with bullets | title, bullets |
| `two-col` | Comparing two related lists | title, bullets (auto-split in half) |
| `quote` | Featured quote or big statement | quote, subtitle (attribution) |
| `image` | Screenshot or visual | title, image (URL), subtitle (caption) |

## Typical deck structure

1. `title` — deck cover
2. `section` — "Context" / intro divider
3. `content` × 3-5 — each major point
4. `quote` or `image` — emphasis beat
5. `two-col` — comparison if relevant
6. `section` — "Next steps" divider
7. `content` — action items
8. `title` — closing / thank you

Aim for 5-12 slides for most topics. If the topic is huge, suggest splitting into multiple decks rather than one 40-slider.

## Envelope

```json
{
  "a2ui_version": "0.9",
  "catalog": "hyperscribe/v1",
  "is_task_complete": true,
  "parts": [
    {
      "component": "hyperscribe/SlideDeck",
      "props": { "aspect": "16:9", "transition": "fade", "footer": "My topic · 2026" },
      "children": [
        { "component": "hyperscribe/Slide", "props": { "layout": "title", "title": "...", "subtitle": "..." }},
        { "component": "hyperscribe/Slide", "props": { "layout": "content", "title": "...", "bullets": ["...", "..."] }},
        /* ... more slides ... */
        { "component": "hyperscribe/Slide", "props": { "layout": "title", "title": "Thanks", "subtitle": "Q&A" }}
      ]
    }
  ]
}
```

## Render + open

Same workflow as `/hyperscribe` — pipe the JSON to the CLI, write to `~/.hyperscribe/out/<slug>.html`, then `open` it.

```bash
mkdir -p ~/.hyperscribe/out
OUT=~/.hyperscribe/out/slides-$(date +%Y%m%d-%H%M%S).html
cat <<'EOF' | ~/.claude/plugins/cache/hyperscribe-marketplace/*/plugins/hyperscribe/scripts/hyperscribe --out "$OUT"
<the JSON you built>
EOF
open "$OUT"
```

## Interaction in output

The user can navigate with **arrow keys / space / Home / End**, or click the nav buttons at the bottom. Tell them this.

## Avoid

- Putting too much text on a single slide — if bullets go beyond 5-6 items, split into multiple slides.
- Using Slide components inside a Page (that fails schema validation).
- Copying the user's entire document verbatim — distill the essence.
- Nesting markdown inside Slide props — props are plain text (bullets is `string[]`, not markdown).
