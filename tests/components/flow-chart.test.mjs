import { test } from "node:test";
import assert from "node:assert/strict";
import { FlowChart } from "../../plugins/hyperscribe/scripts/components/flow-chart.mjs";

const simple = {
  layout: "LR",
  nodes: [
    { id: "a", label: "Start" },
    { id: "b", label: "Work" },
    { id: "c", label: "End" }
  ],
  edges: [{ from: "a", to: "b" }, { from: "b", to: "c", label: "done" }],
  ranks: [["a"], ["b"], ["c"]]
};

test("FlowChart: renders wrapper + svg", () => {
  const html = FlowChart(simple);
  assert.match(html, /<div class="hs-flow hs-flow-lr[^"]*"/);
  assert.match(html, /<svg/);
});

test("FlowChart: renders one node element per node", () => {
  const html = FlowChart(simple);
  const m = html.match(/class="hs-flow-node"/g);
  assert.equal(m.length, 3);
});

test("FlowChart: renders edge label when given", () => {
  const html = FlowChart(simple);
  assert.match(html, />done</);
});

test("FlowChart: diamond shape uses <polygon>", () => {
  const html = FlowChart({
    ...simple,
    nodes: [{ id: "a", label: "?", shape: "diamond" }],
    edges: [],
    ranks: [["a"]]
  });
  assert.match(html, /<polygon[^>]+class="hs-flow-shape-diamond"/);
});

test("FlowChart: TD layout class", () => {
  const html = FlowChart({ ...simple, layout: "TD" });
  assert.match(html, /hs-flow-td/);
});

test("FlowChart: escapes labels", () => {
  const html = FlowChart({
    layout: "LR",
    nodes: [{ id: "a", label: "<x>" }],
    edges: [],
    ranks: [["a"]]
  });
  assert.match(html, /&lt;x&gt;/);
});
