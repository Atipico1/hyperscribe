#!/usr/bin/env node
/**
 * Generate plugins/hyperscribe/references/catalog.md from plugins/hyperscribe/spec/catalog.json.
 * The markdown is the authoritative reference Claude loads when building JSON.
 */

import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = resolve(__dirname, "..");
const CATALOG_PATH = resolve(REPO_ROOT, "plugins", "hyperscribe", "spec", "catalog.json");
const OUT_PATH = resolve(REPO_ROOT, "plugins", "hyperscribe", "references", "catalog.md");

const catalog = JSON.parse(readFileSync(CATALOG_PATH, "utf8"));

function renderPropType(schema) {
  if (schema.type === "array") {
    const inner = schema.items ? renderPropType(schema.items) : "any";
    return `array<${inner}>`;
  }
  if (schema.type === "object") {
    if (schema.props) {
      const kvs = Object.entries(schema.props).map(([k, v]) => `${k}: ${renderPropType(v)}${v.required ? "" : "?"}`);
      return `{ ${kvs.join(", ")} }`;
    }
    return "object";
  }
  if (schema.enum) return schema.enum.map(x => JSON.stringify(x)).join(" | ");
  return schema.type || "any";
}

function renderPropsTable(props) {
  const rows = Object.entries(props).map(([name, s]) => {
    const type = renderPropType(s);
    const req = s.required ? "**required**" : "optional";
    const extra = s.pattern ? `pattern: \`${s.pattern}\`` : (s.default !== undefined ? `default: \`${JSON.stringify(s.default)}\`` : "");
    return `| \`${name}\` | \`${type}\` | ${req} | ${extra} |`;
  });
  return ["| Prop | Type | Required | Notes |", "|---|---|---|---|", ...rows].join("\n");
}

function renderComponent(name, schema) {
  const header = `### \`${name}\`\n\n${schema.description || ""}\n\n- **Children:** ${schema.children || "forbidden"}`;
  const table = renderPropsTable(schema.props || {});
  return `${header}\n\n${table}\n`;
}

function categorize(name) {
  if (["Page", "Section", "Heading", "Prose"].some(x => name.endsWith("/" + x))) return "Structure";
  if (["Image"].some(x => name.endsWith("/" + x))) return "Media";
  if (["Callout", "KPICard"].some(x => name.endsWith("/" + x))) return "Emphasis";
  if (["CodeBlock", "CodeDiff"].some(x => name.endsWith("/" + x))) return "Code";
  if (["Mermaid", "Sequence", "ArchitectureGrid", "FlowChart", "Quadrant", "Swimlane"].some(x => name.endsWith("/" + x))) return "Diagrams";
  if (["DataTable", "Chart", "Comparison"].some(x => name.endsWith("/" + x))) return "Data";
  if (["StepList"].some(x => name.endsWith("/" + x))) return "Narrative";
  if (["SlideDeck", "Slide"].some(x => name.endsWith("/" + x))) return "Slides";
  return "Other";
}

const CATEGORY_ORDER = ["Structure", "Media", "Emphasis", "Code", "Diagrams", "Data", "Narrative", "Other"];

const byCategory = {};
for (const [name, schema] of Object.entries(catalog.components)) {
  const cat = categorize(name);
  (byCategory[cat] ||= []).push([name, schema]);
}

const SLIDE_COMPONENTS = new Set(["hyperscribe/SlideDeck", "hyperscribe/Slide"]);
const totalComponents = Object.keys(catalog.components).length;
const defaultComponents = Object.keys(catalog.components).filter(name => !SLIDE_COMPONENTS.has(name)).length;

let md = `# Hyperscribe Component Catalog — ${catalog.version}

**This file is auto-generated from \`plugins/hyperscribe/spec/catalog.json\`. Do not edit by hand. Run \`node tools/build-catalog-md.mjs\` to regenerate.**

## Envelope

Every Hyperscribe document uses this envelope:

\`\`\`json
{
  "a2ui_version": "${catalog.envelope.a2ui_version}",
  "catalog": "${catalog.version}",
  "is_task_complete": true,
  "parts": [ /* exactly one ${catalog.envelope.root_component} */ ]
}
\`\`\`

Required envelope fields: ${catalog.envelope.required.map(f => `\`${f}\``).join(", ")}.

Root component must be \`${catalog.envelope.root_component}\`.

## Components (${defaultComponents} default + ${totalComponents - defaultComponents} slide-mode-only)

The default \`/hyperscribe\` page mode uses the components below.

\`hyperscribe/SlideDeck\` and \`hyperscribe/Slide\` are **slide-mode-only** components owned by \`/hyperscribe:slides\`.

`;

for (const cat of CATEGORY_ORDER) {
  if (!byCategory[cat]) continue;
  md += `## ${cat}\n\n`;
  for (const [name, schema] of byCategory[cat]) {
    md += renderComponent(name, schema) + "\n";
  }
}

if (byCategory.Slides) {
  md += `## Slide Mode Only\n\nThese components are intentionally separated from the default page-mode inventory. Use them through \`/hyperscribe:slides\`, not through the default \`/hyperscribe\` flow.\n\n`;
  for (const [name, schema] of byCategory.Slides) {
    md += renderComponent(name, schema) + "\n";
  }
}

md += `## Rules

- \`props\` must contain ONLY semantic data — never colors, fonts, sizes, or layout hints.
- \`children\` is used for container components (Page, Section). In slide mode, \`SlideDeck\` owns \`Slide[]\`.
- Unknown component names or props are rejected at schema validation (exit 2).
- Enum values are case-sensitive.
- String patterns (e.g. Section.id) are regex-matched.
`;

mkdirSync(dirname(OUT_PATH), { recursive: true });
writeFileSync(OUT_PATH, md, "utf8");
console.log("wrote:", OUT_PATH);
console.log("bytes:", md.length);
