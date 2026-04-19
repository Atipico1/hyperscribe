---
name: hyperscribe-slides
description: Generate a self-contained HTML slide deck (SlideDeck + Slides with keyboard nav) from a topic or outline. Use whenever the user asks for "slides", "a deck", "a presentation", a "walkthrough", or a 5+ step recap. Requires the `hyperscribe` skill to be installed (provides the renderer engine).
license: MIT
metadata:
  version: "0.5.0-alpha"
  requires: "hyperscribe"
---

> **Step 0 — Preference:** Before running any renderer command, perform the theme-preference resolution block from the base `hyperscribe` skill (`~/.claude/skills/hyperscribe/SKILL.md`, section "Step 0"). It sets `$THEME` and `$MODE`. If absent, this wrapper falls back to `studio` + `light`.

# Hyperscribe — Slides mode

Forces a `hyperscribe/SlideDeck` root (NOT `Page`) and emits a slide-oriented HTML file via the Hyperscribe renderer. This skill is a thin wrapper over the `hyperscribe` skill: the envelope format and renderer contract live there, this skill adds the slide-specific rules.

## When to use

- User says "slides", "deck", "presentation", "walk me through", "recap as slides".
- You're about to produce 5+ sequential points that would benefit from pagination.
- User asks for a kickoff deck, readout, review, demo script, or training material.

Do **not** use for: single-page docs (use `hyperscribe`), diff reviews (use `hyperscribe-diff`), or linear prose.

## Rules for slide mode

1. **Root MUST be `hyperscribe/SlideDeck`**, never `hyperscribe/Page`. Slides don't nest inside Page.
2. `SlideDeck.children` must be an array of `hyperscribe/Slide` objects — nothing else.
3. Pick `aspect`: `"16:9"` (default widescreen) or `"4:3"` (compact/legacy).
4. Optional `transition: "fade" | "slide"` for visual polish.
5. Include a `footer` with topic + date.

## Slide layout picker

| Layout | Use when | Props |
|---|---|---|
| `title` | Opening/cover slide | `title`, `subtitle` |
| `section` | Divider between parts | `title`, `subtitle` |
| `content` | Single-topic slide with bullets | `title`, `bullets` |
| `two-col` | Comparing two related lists | `title`, `bullets` (auto-split in half) |
| `quote` | Featured quote or big statement | `quote`, `subtitle` (attribution) |
| `image` | Screenshot or visual | `title`, `image` (URL), `subtitle` (caption) |

## Typical deck structure

1. `title` — cover
2. `section` — "Context" / intro divider
3. `content` × 3–5 — each major point
4. `quote` or `image` — emphasis beat
5. `two-col` — comparison if relevant
6. `section` — "Next steps" divider
7. `content` — action items
8. `title` — closing / thank you

Aim for 5–12 slides. If the topic is huge, suggest splitting into multiple decks rather than one 40-slider.

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
        { "component": "hyperscribe/Slide", "props": { "layout": "title", "title": "Thanks", "subtitle": "Q&A" }}
      ]
    }
  ]
}
```

## Render + open

Same workflow as the base `hyperscribe` skill — resolve the renderer, pipe JSON, write output, open.

```bash
# Locate the hyperscribe renderer (installed via `npx skills add Atipico1/hyperscribe` or plugin marketplace).
HS=$(for p in \
  ./.claude/skills/hyperscribe ~/.claude/skills/hyperscribe \
  ./.codex/skills/hyperscribe ~/.codex/skills/hyperscribe \
  ./.cursor/skills/hyperscribe ~/.cursor/skills/hyperscribe \
  ./.opencode/skills/hyperscribe ~/.opencode/skills/hyperscribe \
  ~/.claude/plugins/cache/hyperscribe-marketplace/*/plugins/hyperscribe
do [ -x "$p/scripts/hyperscribe" ] && { echo "$p/scripts/hyperscribe"; break; }; done)

if [ -z "$HS" ]; then
  echo "hyperscribe renderer not found. Install with: npx skills add Atipico1/hyperscribe" >&2
  exit 1
fi

mkdir -p ~/.hyperscribe/out
OUT=~/.hyperscribe/out/slides-$(date +%Y%m%d-%H%M%S).html
MODE_FLAG=""
[ "${MODE:-}" = "light" ] && MODE_FLAG="--mode light"
[ "${MODE:-}" = "dark" ]  && MODE_FLAG="--mode dark"

cat <<'EOF' | "$HS" --theme "${THEME:-studio}" $MODE_FLAG --out "$OUT"
<the JSON you built>
EOF
open "$OUT"    # macOS; use xdg-open on Linux
```

## Interaction in output

Users navigate with **arrow keys / space / Home / End**, or click the bottom nav buttons. Mention this when reporting the path.

## Avoid

- Putting too much text on a single slide — if bullets exceed 5–6 items, split into multiple slides.
- Using `Slide` inside a `Page` (fails schema validation).
- Copying the user's document verbatim — distill the essence.
- Nesting markdown inside Slide props — `bullets` is `string[]`, plain text only.
