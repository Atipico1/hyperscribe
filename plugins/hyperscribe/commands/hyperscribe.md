---
name: hyperscribe
description: Generate a visual HTML page from natural language. Picks the right components from the catalog (diagrams, tables, cards, timelines, comparisons, etc.) and renders a self-contained HTML file opened in the browser.
argument-hint: <natural language description>
---

You are invoking Hyperscribe's general-purpose renderer. The user asked for:

$ARGUMENTS

## Your workflow

1. **Understand intent.** What is the user trying to communicate visually?
   - Architecture/flow → Mermaid or ArchitectureGrid
   - Comparison → Comparison or DataTable
   - Timeline of events → Timeline
   - Step-by-step instructions → StepList
   - Metrics summary → Dashboard with KPICards and Charts
   - Code review → CodeDiff + Callouts
   - Essay-style explanation → Page with Sections, Headings, Prose, and embedded components

2. **Read the catalog.** If you are uncertain about any component's schema or props, read `plugins/hyperscribe/references/catalog.md` BEFORE building the JSON.

3. **Build the A2UI envelope.**

   ```json
   {
     "a2ui_version": "0.9",
     "catalog": "hyperscribe/v1",
     "is_task_complete": true,
     "parts": [
       {
         "component": "hyperscribe/Page",
         "props": { "title": "...", "subtitle": "..." },
         "children": [ /* sections, components */ ]
       }
     ]
   }
   ```

   **Rules:**
   - `parts[0]` must be `hyperscribe/Page`. Use `hyperscribe/SlideDeck` only if user explicitly asked for slides (then use `/hyperscribe:slides` instead).
   - `props` contains ONLY semantic data. NEVER specify colors, fonts, sizes, or layout classes.
   - Use `children` for container nesting (Page/Section/SlideDeck). Use `props.panels[].child` for Dashboard.
   - Section `id` must be kebab-case (`[a-z0-9][a-z0-9-]*`).
   - Enum values are case-sensitive (e.g., Callout.severity: `info`, `warn`, etc., not `Warning`).

4. **Render via CLI.** Invoke the bash wrapper with the JSON piped in:

   ```bash
   mkdir -p ~/.hyperscribe/out
   SLUG="$(date +%Y%m%d-%H%M%S)"
   OUT=~/.hyperscribe/out/$SLUG.html
   cat <<'EOF' | ~/.claude/plugins/cache/hyperscribe-marketplace/*/plugins/hyperscribe/scripts/hyperscribe --out "$OUT"
   <the JSON you built>
   EOF
   echo "$OUT"
   ```

   If the plugin is installed at a different path, use the actual path to `plugins/hyperscribe/scripts/hyperscribe` in the plugin cache. The `node plugins/hyperscribe/scripts/render.mjs` direct invocation also works.

5. **Open in browser.**

   ```bash
   open "$OUT"    # macOS
   # xdg-open "$OUT"  # Linux
   ```

6. **Report to user.** Tell them:
   - The file path
   - Brief one-line summary of what was rendered (e.g. "3-section architecture overview with ArchitectureGrid + 2 Callouts")

## Error recovery

If the CLI exits with status 2 (schema validation failure), stderr contains lines like `parts[0].children[1].props.title: Missing required prop: title`. Read those paths, fix the JSON, and retry. Up to 2 retries. If still failing, report the errors + the JSON you tried to the user and ask for guidance.

## Avoid

- Styling hints in props (colors, layouts, spacing)
- ASCII art fallbacks — that is why this skill exists
- Giant single Prose blocks — break into Sections with Headings when there are multiple topics
- Mermaid for data tables — use DataTable
- DataTable for system diagrams — use Mermaid or ArchitectureGrid

## Quick component picker

| User says... | Use... |
|---|---|
| "Draw/diagram a system" | Mermaid (flowchart) or ArchitectureGrid |
| "Compare A and B" | Comparison |
| "Show steps to X" | StepList |
| "Timeline of X" | Timeline |
| "Dashboard with metrics" | Dashboard + KPICards + Charts |
| "Explain X" | Page + Sections + Prose + Callouts |
| "Review this diff" | use `/hyperscribe:diff` |
| "Make slides about X" | use `/hyperscribe:slides` |
