import { test } from "node:test";
import assert from "node:assert/strict";
import { ArchitectureGrid } from "../../plugins/hyperscribe/scripts/components/architecture-grid.mjs";

test("ArchitectureGrid: renders grid with nodes", () => {
  const html = ArchitectureGrid({
    nodes: [{ id: "a", title: "A", description: "desc" }],
    layout: "grid"
  });
  assert.match(html, /<div class="hs-arch hs-arch-grid"/);
  assert.match(html, /<article class="hs-arch-node"[^>]*data-node-id="a"/);
  assert.match(html, /<div class="hs-arch-node-title">A<\/div>/);
  assert.match(html, /<div class="hs-arch-node-desc">desc<\/div>/);
});

test("ArchitectureGrid: layout class reflects prop", () => {
  assert.match(ArchitectureGrid({ nodes:[], layout: "columns" }), /hs-arch-columns/);
  assert.match(ArchitectureGrid({ nodes:[], layout: "layers" }), /hs-arch-layers/);
});

test("ArchitectureGrid: renders tag badge when present", () => {
  const html = ArchitectureGrid({
    nodes: [{ id: "a", title: "A", tag: "service" }],
    layout: "grid"
  });
  assert.match(html, /<span class="hs-arch-node-tag">service<\/span>/);
});

test("ArchitectureGrid: renders icon when present", () => {
  const html = ArchitectureGrid({
    nodes: [{ id: "a", title: "A", icon: "🚀" }],
    layout: "grid"
  });
  assert.match(html, /<span class="hs-arch-node-icon">🚀<\/span>/);
});

test("ArchitectureGrid: renders edges list when present", () => {
  const html = ArchitectureGrid({
    nodes: [{ id: "a", title: "A" }, { id: "b", title: "B" }],
    edges: [{ from: "a", to: "b", label: "calls" }],
    layout: "grid"
  });
  assert.match(html, /<ul class="hs-arch-edges">/);
  assert.match(html, /<li[^>]*>A → B<em>: calls<\/em><\/li>/);
});

test("ArchitectureGrid: edge style class", () => {
  const html = ArchitectureGrid({
    nodes: [{ id: "a", title: "A" }, { id: "b", title: "B" }],
    edges: [{ from: "a", to: "b", style: "data" }],
    layout: "grid"
  });
  assert.match(html, /<li class="hs-arch-edge-data"/);
});

test("ArchitectureGrid: renders groups as sections", () => {
  const html = ArchitectureGrid({
    nodes: [{ id: "a", title: "A" }, { id: "b", title: "B" }],
    groups: [{ id: "g1", title: "Backend", nodeIds: ["a", "b"] }],
    layout: "grid"
  });
  assert.match(html, /<section class="hs-arch-group"[^>]*>/);
  assert.match(html, /<div class="hs-arch-group-title">Backend<\/div>/);
});

test("ArchitectureGrid: escapes user content", () => {
  const html = ArchitectureGrid({
    nodes: [{ id: "a", title: "<x>" }],
    layout: "grid"
  });
  assert.match(html, /&lt;x&gt;/);
});

test("ArchitectureGrid: no edges block when edges empty or missing", () => {
  const html = ArchitectureGrid({ nodes: [{ id: "a", title: "A" }], layout: "grid" });
  assert.doesNotMatch(html, /hs-arch-edges/);
});
