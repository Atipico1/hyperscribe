import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { render } from "../../plugins/hyperscribe/scripts/render.mjs";

function envelope(child) {
  return {
    a2ui_version: "0.9",
    catalog: "hyperscribe/v1",
    is_task_complete: true,
    parts: [
      {
        component: "hyperscribe/Page",
        props: { title: "Diagram Gallery" },
        children: [child]
      }
    ]
  };
}

test("render: Quadrant outputs labeled quadrants and plotted points", async () => {
  const html = await render(envelope({
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
        { label: "Docs refresh", x: 24, y: 78, tone: "accent", tag: "now" },
        { label: "<Risky>", x: 76, y: 32, tone: "muted" }
      ]
    }
  }));

  assert.match(html, /class="hs-quadrant"/);
  assert.match(html, /Quick wins/);
  assert.match(html, /Docs refresh/);
  assert.match(html, /&lt;Risky&gt;/);
  assert.match(html, /Impact/);
  assert.match(html, /Effort/);
});

test("render: Swimlane outputs lanes, steps, and edge labels", async () => {
  const html = await render(envelope({
    component: "hyperscribe/Swimlane",
    props: {
      lanes: [
        { id: "user", title: "User", subtitle: "Prompt source" },
        { id: "agent", title: "Agent", subtitle: "Renderer" },
        { id: "report", title: "Report", subtitle: "Artifact" }
      ],
      steps: [
        { id: "s1", lane: "user", title: "Ask", description: "Request all diagrams", tag: "1" },
        { id: "s2", lane: "agent", title: "Render", description: "Generate HTML", tag: "2" },
        { id: "s3", lane: "report", title: "<Gallery>", description: "Single-page showcase", tag: "3" }
      ],
      edges: [
        { from: "s1", to: "s2", label: "prompt" },
        { from: "s2", to: "s3", label: "artifact" }
      ]
    }
  }));

  assert.match(html, /class="hs-swimlane"/);
  assert.match(html, /User/);
  assert.match(html, /Generate HTML/);
  assert.match(html, /artifact/);
  assert.match(html, /&lt;Gallery&gt;/);
});

test("Quadrant CSS: uses theme variables for divider lines", () => {
  const css = readFileSync(new URL("../../plugins/hyperscribe/assets/components/quadrant.css", import.meta.url), "utf8");
  assert.match(css, /var\(--hs-color-fg-muted\)/);
});
