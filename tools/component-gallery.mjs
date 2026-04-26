import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { dirname, resolve } from "node:path";

const ROOT = resolve(new URL("..", import.meta.url).pathname);

export const GALLERY_MARKER_START = "<!-- components-gallery:start -->";
export const GALLERY_MARKER_END = "<!-- components-gallery:end -->";
export const GALLERY_ASSET_DIR = "assets/component-gallery";
export const GALLERY_SOURCE_IMAGE = resolve(ROOT, GALLERY_ASSET_DIR, "source", "sample-image.svg");

function page(title, children, subtitle) {
  return {
    a2ui_version: "0.9",
    catalog: "hyperscribe/v1",
    is_task_complete: true,
    parts: [
      {
        component: "hyperscribe/Page",
        props: subtitle ? { title, subtitle } : { title },
        children
      }
    ]
  };
}

function componentSlug(component) {
  return component
    .replace(/^hyperscribe\//, "")
    .replace(/([a-z\d])([A-Z])/g, "$1-$2")
    .replace(/([A-Z])([A-Z][a-z])/g, "$1-$2")
    .toLowerCase();
}

function galleryEntry(component, previewTitle, buildDoc, options = {}) {
  const slug = componentSlug(component);
  return {
    component,
    slug,
    label: component.replace(/^hyperscribe\//, ""),
    previewTitle,
    imagePath: `${GALLERY_ASSET_DIR}/${slug}.webp`,
    captureScale: options.captureScale ?? 1.2,
    captureWidth: options.captureWidth ?? "1040px",
    showHeader: options.showHeader ?? false,
    buildDoc
  };
}

export const GALLERY_COMPONENTS = [
  galleryEntry("hyperscribe/Page", "Page", () => page(
    "Page",
    [
      {
        component: "hyperscribe/Section",
        props: {
          id: "overview",
          title: "Single-file visual explainer",
          lead: "Root layout with a header, optional subtitle, and room for structured sections."
        },
        children: [
          {
            component: "hyperscribe/Prose",
            props: {
              markdown: "Use the page container when you want a complete document with a stable reading rhythm."
            }
          }
        ]
      }
    ],
    "The outer frame that holds a full Hyperscribe document."
  ), { captureScale: 1, captureWidth: "980px", showHeader: true }),
  galleryEntry("hyperscribe/Section", "Section", () => page("Section", [
    {
      component: "hyperscribe/Section",
      props: {
        id: "section",
        title: "Titled block with lead copy",
        lead: "Sections create anchors, spacing, and grouping for whatever comes next."
      },
      children: [
        {
          component: "hyperscribe/Prose",
          props: {
            markdown: "Good for long pages that need clear chunks instead of one undifferentiated wall."
          }
        }
      ]
    }
  ]), { captureScale: 1.2, captureWidth: "900px" }),
  galleryEntry("hyperscribe/Heading", "Heading", () => page("Heading", [
    { component: "hyperscribe/Heading", props: { level: 2, text: "H2 for big subsections" } },
    { component: "hyperscribe/Heading", props: { level: 3, text: "H3 for local grouping" } },
    { component: "hyperscribe/Heading", props: { level: 4, text: "H4 for small callouts" } }
  ]), { captureScale: 1.45, captureWidth: "900px" }),
  galleryEntry("hyperscribe/Prose", "Prose", () => page("Prose", [
    {
      component: "hyperscribe/Prose",
      props: {
        markdown: "Markdown paragraphs, lists, and inline formatting live here.\n\n- crisp bullets\n- **strong emphasis**\n- `inline code`"
      }
    }
  ]), { captureScale: 1.35, captureWidth: "820px" }),
  galleryEntry("hyperscribe/Image", "Image", () => page("Image", [
    {
      component: "hyperscribe/Image",
      props: {
        src: GALLERY_SOURCE_IMAGE,
        alt: "A sample layered dashboard illustration",
        caption: "Local files are inlined at render time so the output stays self-contained.",
        width: 960,
        height: 540
      }
    }
  ]), { captureScale: 1.08, captureWidth: "960px" }),
  galleryEntry("hyperscribe/Callout", "Callout", () => page("Callout", [
    {
      component: "hyperscribe/Callout",
      props: {
        severity: "warn",
        title: "Keep the contract semantic",
        body: "Use component props for meaning. The renderer owns color, spacing, and visual treatment."
      }
    }
  ]), { captureScale: 1.42, captureWidth: "860px" }),
  galleryEntry("hyperscribe/KPICard", "KPICard", () => page("KPICard", [
    {
      component: "hyperscribe/KPICard",
      props: {
        label: "Render time",
        value: "142 ms",
        delta: { value: "-18%", direction: "down" },
        hint: "Compared with the previous schema build."
      }
    }
  ]), { captureScale: 1.85, captureWidth: "520px" }),
  galleryEntry("hyperscribe/CodeBlock", "CodeBlock", () => page("CodeBlock", [
    {
      component: "hyperscribe/CodeBlock",
      props: {
        lang: "js",
        filename: "render.js",
        highlight: [2, 3],
        code: [
          "export async function renderDoc(doc) {",
          "  const html = await render(doc);",
          "  return html.trim();",
          "}"
        ].join("\n")
      }
    }
  ]), { captureScale: 1.4, captureWidth: "900px" }),
  galleryEntry("hyperscribe/CodeDiff", "CodeDiff", () => page("CodeDiff", [
    {
      component: "hyperscribe/CodeDiff",
      props: {
        filename: "page.mjs",
        lang: "diff",
        hunks: [
          {
            before: "const title = props.title;",
            after: "const title = props.title || 'Hyperscribe';",
            atLine: 12
          },
          {
            before: "return header;",
            after: "return header + subtitle;",
            atLine: 27
          }
        ]
      }
    }
  ]), { captureScale: 1.38, captureWidth: "980px" }),
  galleryEntry("hyperscribe/Mermaid", "Mermaid", () => page("Mermaid", [
    {
      component: "hyperscribe/Mermaid",
      props: {
        kind: "flowchart",
        direction: "LR",
        source: [
          "flowchart LR",
          "  prompt[Prompt] --> json[JSON Envelope]",
          "  json --> validate[Schema Check]",
          "  validate --> html[Rendered HTML]"
        ].join("\n")
      }
    }
  ]), { captureScale: 1.22, captureWidth: "1040px" }),
  galleryEntry("hyperscribe/Sequence", "Sequence", () => page("Sequence", [
    {
      component: "hyperscribe/Sequence",
      props: {
        participants: [
          { id: "user", title: "User" },
          { id: "agent", title: "Agent" },
          { id: "browser", title: "Browser" }
        ],
        messages: [
          { from: "user", to: "agent", text: "Describe the system", kind: "sync" },
          { from: "agent", to: "browser", text: "Render preview", kind: "async" },
          { kind: "note", over: ["agent", "browser"], text: "Self-contained HTML artifact" },
          { from: "browser", to: "agent", text: "Preview ready", kind: "return" }
        ]
      }
    }
  ]), { captureScale: 1.12, captureWidth: "980px" }),
  galleryEntry("hyperscribe/ArchitectureGrid", "ArchitectureGrid", () => page("ArchitectureGrid", [
    {
      component: "hyperscribe/ArchitectureGrid",
      props: {
        layout: "grid",
        nodes: [
          { id: "ui", title: "Prompt UI", description: "Collects intent", tag: "client", icon: "UI" },
          { id: "agent", title: "Agent", description: "Chooses components", tag: "logic", icon: "AI" },
          { id: "render", title: "Renderer", description: "Validates and emits HTML", tag: "node", icon: "JS" }
        ],
        edges: [
          { from: "ui", to: "agent", label: "request", style: "control" },
          { from: "agent", to: "render", label: "envelope", style: "data" }
        ]
      }
    }
  ]), { captureScale: 1.16, captureWidth: "1060px" }),
  galleryEntry("hyperscribe/FlowChart", "FlowChart", () => page("FlowChart", [
    {
      component: "hyperscribe/FlowChart",
      props: {
        layout: "LR",
        nodes: [
          { id: "a", label: "Receive prompt", shape: "pill" },
          { id: "b", label: "Pick component", shape: "box" },
          { id: "c", label: "Valid?", shape: "diamond" },
          { id: "d", label: "Render HTML", shape: "box" }
        ],
        edges: [
          { from: "a", to: "b" },
          { from: "b", to: "c" },
          { from: "c", to: "d", label: "yes" }
        ],
        ranks: [["a"], ["b"], ["c"], ["d"]]
      }
    }
  ]), { captureScale: 1.2, captureWidth: "1040px" }),
  galleryEntry("hyperscribe/Quadrant", "Quadrant", () => page("Quadrant", [
    {
      component: "hyperscribe/Quadrant",
      props: {
        xLabel: "Effort",
        yLabel: "Impact",
        quadrants: [
          { id: "q1", title: "Quick wins", description: "High impact, low effort" },
          { id: "q2", title: "Major bets", description: "High impact, high effort" },
          { id: "q3", title: "Fill-ins", description: "Low impact, low effort" },
          { id: "q4", title: "Avoid", description: "Low impact, high effort" }
        ],
        points: [
          { label: "README gallery", x: 28, y: 82, tag: "now", tone: "accent" },
          { label: "Theme refresh", x: 76, y: 52, tag: "later", tone: "muted" }
        ]
      }
    }
  ]), { captureScale: 1.12, captureWidth: "980px" }),
  galleryEntry("hyperscribe/Swimlane", "Swimlane", () => page("Swimlane", [
    {
      component: "hyperscribe/Swimlane",
      props: {
        lanes: [
          { id: "user", title: "User", subtitle: "Request" },
          { id: "agent", title: "Agent", subtitle: "Reasoning" },
          { id: "artifact", title: "Artifact", subtitle: "Output" }
        ],
        steps: [
          { id: "s1", lane: "user", title: "Ask", description: "Need a visual explainer", tag: "1" },
          { id: "s2", lane: "agent", title: "Model", description: "Pick the right component", tag: "2" },
          { id: "s3", lane: "artifact", title: "Render", description: "Open a browser-ready file", tag: "3" }
        ],
        edges: [
          { from: "s1", to: "s2", label: "prompt" },
          { from: "s2", to: "s3", label: "html" }
        ]
      }
    }
  ]), { captureScale: 1.15, captureWidth: "1080px" }),
  galleryEntry("hyperscribe/DataTable", "DataTable", () => page("DataTable", [
    {
      component: "hyperscribe/DataTable",
      props: {
        columns: [
          { key: "component", label: "Component" },
          { key: "bestFor", label: "Best for" },
          { key: "mode", label: "Mode", align: "center" }
        ],
        rows: [
          { component: "Page", bestFor: "Full documents", mode: "page" },
          { component: "Sequence", bestFor: "Actor timelines", mode: "page" },
          { component: "SlideDeck", bestFor: "Presentations", mode: "slides" }
        ],
        caption: "Quick way to compare catalog surfaces.",
        density: "compact"
      }
    }
  ]), { captureScale: 1.26, captureWidth: "1020px" }),
  galleryEntry("hyperscribe/Chart", "Chart", () => page("Chart", [
    {
      component: "hyperscribe/Chart",
      props: {
        kind: "bar",
        xLabel: "Week",
        yLabel: "Pages rendered",
        unit: " pages",
        data: {
          labels: ["Mon", "Tue", "Wed", "Thu"],
          series: [
            { name: "Studio", values: [12, 18, 15, 24] },
            { name: "Gallery", values: [8, 10, 14, 19] }
          ]
        }
      }
    }
  ]), { captureScale: 1.22, captureWidth: "1020px" }),
  galleryEntry("hyperscribe/Comparison", "Comparison", () => page("Comparison", [
    {
      component: "hyperscribe/Comparison",
      props: {
        mode: "vs",
        items: [
          {
            title: "Raw HTML",
            subtitle: "Flexible but verbose",
            bullets: ["High token cost", "Easy to drift visually", "Harder to validate"]
          },
          {
            title: "Hyperscribe",
            subtitle: "Schema-first",
            bullets: ["Semantic JSON only", "Cheaper output", "Deterministic renderer"],
            verdict: { label: "Recommended", tone: "winner" }
          }
        ]
      }
    }
  ]), { captureScale: 1.25, captureWidth: "1020px" }),
  galleryEntry("hyperscribe/StepList", "StepList", () => page("StepList", [
    {
      component: "hyperscribe/StepList",
      props: {
        steps: [
          { title: "Write prompt", body: "Describe the artifact you want.", state: "done" },
          { title: "Pick components", body: "Choose the smallest useful set.", state: "doing" },
          { title: "Render output", body: "Open the generated page.", state: "todo" }
        ]
      }
    }
  ]), { captureScale: 1.42, captureWidth: "840px" }),
  galleryEntry("hyperscribe/FileTree", "FileTree", () => page("FileTree", [
    {
      component: "hyperscribe/FileTree",
      props: {
        caption: "Typical renderer layout",
        nodes: [
          {
            name: "plugins",
            type: "dir",
            children: [
              {
                name: "hyperscribe",
                type: "dir",
                highlight: "primary",
                children: [
                  { name: "scripts", type: "dir", children: [{ name: "render.mjs", type: "file" }] },
                  { name: "assets", type: "dir", children: [{ name: "base.css", type: "file" }] }
                ]
              }
            ]
          },
          { name: "README.md", type: "file" }
        ]
      }
    }
  ]), { captureScale: 1.35, captureWidth: "920px" }),
  galleryEntry("hyperscribe/FileCard", "FileCard", () => page("FileCard", [
    {
      component: "hyperscribe/FileCard",
      props: {
        name: "render.mjs",
        path: "plugins/hyperscribe/scripts/render.mjs",
        responsibility: "Validates envelopes, loads the theme, and emits a self-contained HTML document.",
        loc: 248,
        state: "modified",
        exports: [
          { name: "render", kind: "function" },
          { name: "main", kind: "function" }
        ]
      }
    }
  ]), { captureScale: 1.55, captureWidth: "860px" }),
  galleryEntry("hyperscribe/AnnotatedCode", "AnnotatedCode", () => page("AnnotatedCode", [
    {
      component: "hyperscribe/AnnotatedCode",
      props: {
        lang: "js",
        filename: "capture.js",
        code: [
          "const html = await render(doc);",
          "writeFileSync(outFile, html, 'utf8');",
          "await capture(outFile, pngFile);"
        ].join("\n"),
        annotations: [
          { line: 1, pin: 1, title: "Render", body: "Convert semantic JSON into HTML." },
          { line: 3, pin: 2, title: "Capture", body: "Freeze a browser preview into a PNG." }
        ]
      }
    }
  ]), { captureScale: 1.22, captureWidth: "1040px" }),
  galleryEntry("hyperscribe/ERDDiagram", "ERDDiagram", () => page("ERDDiagram", [
    {
      component: "hyperscribe/ERDDiagram",
      props: {
        entities: [
          {
            id: "document",
            name: "Document",
            fields: [
              { name: "id", type: "uuid", key: "pk" },
              { name: "title", type: "text" },
              { name: "theme_id", type: "uuid", key: "fk" }
            ]
          },
          {
            id: "theme",
            name: "Theme",
            fields: [
              { name: "id", type: "uuid", key: "pk" },
              { name: "name", type: "text" },
              { name: "accent", type: "text", nullable: true }
            ]
          }
        ],
        relationships: [
          { from: "theme", to: "document", cardinality: "1-n", label: "styles" }
        ]
      }
    }
  ]), { captureScale: 1.25, captureWidth: "1020px" })
];

const README_HIDDEN_COMPONENTS = new Set([
  "hyperscribe/Page",
  "hyperscribe/Section",
  "hyperscribe/Heading",
  "hyperscribe/Prose"
]);

export const README_GALLERY_COMPONENTS = GALLERY_COMPONENTS.filter(
  (entry) => !README_HIDDEN_COMPONENTS.has(entry.component)
);

export const README_GALLERY_COUNT = README_GALLERY_COMPONENTS.length;

export function buildReadmeGallerySection(entries = README_GALLERY_COMPONENTS) {
  const rows = [];
  const columns = 4;
  for (let i = 0; i < entries.length; i += columns) {
    const row = entries.slice(i, i + columns);
    const cells = row.map((entry) => {
      return [
        "<td width=\"25%\" align=\"center\" valign=\"top\">",
        `  <sub><code>${entry.label}</code></sub>`,
        "  <br />",
        `  <a href="${entry.imagePath}">`,
        `    <img src="${entry.imagePath}" alt="${entry.label} component preview" width="100%" />`,
        "  </a>",
        "</td>"
      ].join("\n");
    });
    while (cells.length < columns) {
      cells.push("<td width=\"25%\"></td>");
    }
    rows.push(`<tr>\n${cells.join("\n")}\n</tr>`);
  }

  return [
    GALLERY_MARKER_START,
    "## Components Gallery",
    "",
    `Visual previews for ${README_GALLERY_COUNT} non-text page-mode components.`,
    "",
    "<table>",
    rows.join("\n"),
    "</table>",
    GALLERY_MARKER_END
  ].join("\n");
}

export function injectReadmeGallerySection(readme, section) {
  const blockPattern = new RegExp(
    `${escapeRegExp(GALLERY_MARKER_START)}[\\s\\S]*?${escapeRegExp(GALLERY_MARKER_END)}`
  );
  const withoutExisting = readme.replace(blockPattern, "").replace(/\n{3,}/g, "\n\n");

  if (withoutExisting.includes("## Why Hyperscribe")) {
    return withoutExisting.replace("## Why Hyperscribe", `${section}\n\n## Why Hyperscribe`);
  }

  return `${withoutExisting.trimEnd()}\n\n${section}\n`;
}

export function updateReadmeGallery(readmePath) {
  const current = readFileSync(readmePath, "utf8");
  const next = injectReadmeGallerySection(current, buildReadmeGallerySection());
  if (next !== current) {
    writeFileSync(readmePath, next, "utf8");
  }
}

export function ensureDir(path) {
  mkdirSync(path, { recursive: true });
}

export function writeJson(path, value) {
  ensureDir(dirname(path));
  writeFileSync(path, JSON.stringify(value, null, 2) + "\n", "utf8");
}

function escapeRegExp(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
