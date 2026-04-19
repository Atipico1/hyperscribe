#!/usr/bin/env node

import { readFileSync, writeFileSync, mkdirSync, existsSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { validate } from "./lib/schema.mjs";
import { renderTree } from "./lib/tree.mjs";
import { loadTheme, modeTogglerHtml } from "./lib/theme.mjs";
import { Page } from "./components/page.mjs";
import { Section } from "./components/section.mjs";
import { Heading } from "./components/heading.mjs";
import { Prose } from "./components/prose.mjs";
import { Image } from "./components/image.mjs";
import { Callout } from "./components/callout.mjs";
import { CodeBlock } from "./components/code-block.mjs";
import { DataTable } from "./components/data-table.mjs";
import { Mermaid } from "./components/mermaid.mjs";
import { Sequence } from "./components/sequence.mjs";
import { ArchitectureGrid } from "./components/architecture-grid.mjs";
import { FlowChart } from "./components/flow-chart.mjs";
import { Timeline } from "./components/timeline.mjs";
import { StepList } from "./components/step-list.mjs";
import { Comparison } from "./components/comparison.mjs";
import { Chart } from "./components/chart.mjs";
import { PrettyChart } from "./components/pretty-chart.mjs";
import { CodeDiff } from "./components/code-diff.mjs";
import { KPICard } from "./components/kpi-card.mjs";
import { Dashboard } from "./components/dashboard.mjs";
import { SlideDeck } from "./components/slide-deck.mjs";
import { Slide } from "./components/slide.mjs";
import { FileTree } from "./components/file-tree.mjs";
import { DependencyGraph } from "./components/dependency-graph.mjs";
import { FileCard } from "./components/file-card.mjs";
import { AnnotatedCode } from "./components/annotated-code.mjs";
import { ERDDiagram } from "./components/erd-diagram.mjs";

const __dirname = dirname(fileURLToPath(import.meta.url));
const PLUGIN_ROOT = resolve(__dirname, "..");
const CATALOG_PATH = resolve(PLUGIN_ROOT, "spec", "catalog.json");
const BASE_CSS_PATH = resolve(PLUGIN_ROOT, "assets", "base.css");
const COMPONENTS_CSS_DIR = resolve(PLUGIN_ROOT, "assets", "components");

const REGISTRY = {
  "hyperscribe/Page": Page,
  "hyperscribe/Section": Section,
  "hyperscribe/Heading": Heading,
  "hyperscribe/Prose": Prose,
  "hyperscribe/Image": Image,
  "hyperscribe/Callout": Callout,
  "hyperscribe/CodeBlock": CodeBlock,
  "hyperscribe/DataTable": DataTable,
  "hyperscribe/Mermaid": Mermaid,
  "hyperscribe/Sequence": Sequence,
  "hyperscribe/ArchitectureGrid": ArchitectureGrid,
  "hyperscribe/FlowChart": FlowChart,
  "hyperscribe/Timeline": Timeline,
  "hyperscribe/StepList": StepList,
  "hyperscribe/Comparison": Comparison,
  "hyperscribe/Chart": Chart,
  "hyperscribe/PrettyChart": PrettyChart,
  "hyperscribe/CodeDiff": CodeDiff,
  "hyperscribe/KPICard": KPICard,
  "hyperscribe/Dashboard": Dashboard,
  "hyperscribe/SlideDeck": SlideDeck,
  "hyperscribe/Slide": Slide,
  "hyperscribe/FileTree": FileTree,
  "hyperscribe/DependencyGraph": DependencyGraph,
  "hyperscribe/FileCard": FileCard,
  "hyperscribe/AnnotatedCode": AnnotatedCode,
  "hyperscribe/ERDDiagram": ERDDiagram
};

export async function render(doc, options = {}) {
  const catalog = options.catalog || loadCatalog();
  const errors = validate(doc, catalog);
  if (errors.length > 0) {
    const err = new Error("Schema validation failed");
    err.code = "SCHEMA";
    err.errors = errors;
    throw err;
  }

  const themeName = options.theme || "studio";
  const themeCss = loadTheme(themeName); // throws if unknown

  const MODES = new Set(["light", "dark", "auto"]);
  const mode = options.mode;
  if (mode !== undefined && !MODES.has(mode)) {
    throw new Error(`Invalid mode "${mode}". Allowed: light|dark|auto`);
  }

  const toggler = modeTogglerHtml();

  const rootNode = doc.parts[0];
  const ctx = {};
  ctx.renderNode = (node) => renderTree(node, REGISTRY, ctx);
  const bodyHtml = renderTree(rootNode, REGISTRY, ctx);
  const title = options.title || rootNode.props.title || "Hyperscribe";
  const componentCss = options.css !== undefined ? options.css : buildCss(rootNode);
  const css = `${themeCss}\n${componentCss}`;

  return buildDocument({ title, bodyHtml, css, theme: themeName, mode, toggler });
}

function componentFileBase(componentName) {
  return componentName
    .replace(/^hyperscribe\//, "")
    .replace(/([a-z\d])([A-Z])/g, "$1-$2")
    .replace(/([A-Z])([A-Z][a-z])/g, "$1-$2")
    .toLowerCase();
}

function collectUsedComponents(node, set = new Set()) {
  if (!node || typeof node !== "object") return set;
  if (typeof node.component === "string") set.add(node.component);
  if (Array.isArray(node.children)) {
    for (const c of node.children) collectUsedComponents(c, set);
  }
  // Dashboard: panels[].child is a nested component
  if (node.component === "hyperscribe/Dashboard" && Array.isArray(node.props?.panels)) {
    for (const p of node.props.panels) {
      if (p && typeof p.child === "object") collectUsedComponents(p.child, set);
    }
  }
  return set;
}

function buildCss(rootNode) {
  const base = readFileSync(BASE_CSS_PATH, "utf8");
  const used = collectUsedComponents(rootNode);
  let extras = "";
  for (const component of used) {
    const fileBase = componentFileBase(component);
    const path = resolve(COMPONENTS_CSS_DIR, fileBase + ".css");
    if (existsSync(path)) {
      extras += "\n/* " + component + " */\n" + readFileSync(path, "utf8");
    }
  }
  return base + extras;
}

function buildDocument({ title, bodyHtml, css, theme, mode, toggler }) {
  const modeAttr = (mode === "light" || mode === "dark") ? ` data-mode="${escapeHtml(mode)}"` : "";
  return `<!doctype html>
<html lang="en" data-theme="${escapeHtml(theme)}"${modeAttr}>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <title>${escapeHtml(title)}</title>
  <style>${css}</style>
</head>
<body>
${bodyHtml}
${toggler}
</body>
</html>
`;
}

function escapeHtml(s) {
  return String(s).replace(/[&<>"']/g, c => ({ "&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;" }[c]));
}

function loadCatalog() {
  return JSON.parse(readFileSync(CATALOG_PATH, "utf8"));
}

function parseArgs(argv) {
  const args = { in: null, out: null, theme: null, mode: null, title: null, quiet: false, validateOnly: false, saveEnvelope: true };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    switch (a) {
      case "--in": args.in = argv[++i]; break;
      case "--out": args.out = argv[++i]; break;
      case "--theme": args.theme = argv[++i]; break;
      case "--mode": args.mode = argv[++i]; break;
      case "--title": args.title = argv[++i]; break;
      case "--quiet": args.quiet = true; break;
      case "--validate-only": args.validateOnly = true; break;
      case "--no-save-envelope": args.saveEnvelope = false; break;
      case "--version":
        console.log("hyperscribe 0.4.2-alpha");
        process.exit(0);
      case "--help":
        printHelp();
        process.exit(0);
    }
  }
  return args;
}

function printHelp() {
  console.log(`Usage: hyperscribe --out <path> [--in <path>|<stdin>] [options]

Options:
  --in <path>          JSON input file (or pipe via stdin)
  --out <path>         Output HTML file (required unless --validate-only)
  --theme <name>       Theme name (studio|midnight|void|gallery); defaults to "studio"
  --mode <light|dark|auto>  Initial color mode. Omitted = follow user preference / prefers-color-scheme.
  --title <string>     Override Page.title
  --quiet              Suppress progress logs
  --validate-only      Validate JSON, do not render
  --no-save-envelope   Don't save the input JSON next to the HTML
  --version            Print version
  --help               Print this help
`);
}

async function readStdin() {
  return new Promise((res, rej) => {
    let data = "";
    process.stdin.setEncoding("utf8");
    process.stdin.on("data", chunk => data += chunk);
    process.stdin.on("end", () => res(data));
    process.stdin.on("error", rej);
  });
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  let input;
  try {
    input = args.in ? readFileSync(args.in, "utf8") : await readStdin();
  } catch (e) {
    console.error(`IO error reading input: ${e.message}`);
    process.exit(3);
  }

  let doc;
  try {
    doc = JSON.parse(input);
  } catch (e) {
    console.error(`JSON parse error: ${e.message}`);
    process.exit(1);
  }

  let html;
  try {
    html = await render(doc, { theme: args.theme, mode: args.mode, title: args.title });
  } catch (e) {
    if (e.code === "SCHEMA") {
      console.error("Schema validation failed:");
      for (const err of e.errors) {
        console.error(`  ${err.path}: ${err.message}`);
      }
      process.exit(2);
    }
    console.error(`Runtime error: ${e.stack || e.message}`);
    process.exit(4);
  }

  if (args.validateOnly) {
    if (!args.quiet) console.log("OK");
    process.exit(0);
  }

  if (!args.out) {
    console.error("Missing --out <path>");
    process.exit(3);
  }

  try {
    const outAbs = resolve(args.out);
    mkdirSync(dirname(outAbs), { recursive: true });
    writeFileSync(outAbs, html, "utf8");
    if (args.saveEnvelope) {
      const envelopePath = outAbs.replace(/\.html?$/i, "") + ".json";
      writeFileSync(envelopePath, JSON.stringify(doc, null, 2) + "\n", "utf8");
    }
    if (!args.quiet) console.log(outAbs);
  } catch (e) {
    console.error(`IO error writing output: ${e.message}`);
    process.exit(3);
  }
}

const isMain = import.meta.url === `file://${process.argv[1]}`;
if (isMain) {
  main();
}
