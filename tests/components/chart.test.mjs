import { test } from "node:test";
import assert from "node:assert/strict";
import { Chart } from "../../plugins/hyperscribe/scripts/components/chart.mjs";

const sampleData = { labels: ["Jan","Feb"], series: [{ name: "Rev", values: [10,20] }] };

test("Chart: renders canvas with kind attribute", () => {
  const html = Chart({ kind: "bar", data: sampleData });
  assert.match(html, /<canvas class="hs-chart" data-kind="bar"/);
});

test("Chart: includes Chart.js CDN loader with guard", () => {
  const html = Chart({ kind: "line", data: sampleData });
  assert.match(html, /window\.__hsChartLoaded/);
  assert.match(html, /cdn\.jsdelivr\.net.*chart\.js/i);
});

test("Chart: inlines data JSON in per-canvas init script", () => {
  const html = Chart({ kind: "bar", data: sampleData });
  assert.match(html, /"labels":\["Jan","Feb"\]/);
  assert.match(html, /"name":"Rev"/);
  assert.match(html, /\[10,20\]/);
});

test("Chart: escapes unexpected HTML in series name", () => {
  const html = Chart({ kind: "bar", data: { labels: ["x"], series: [{ name: "<x>", values: [1] }] }});
  assert.doesNotMatch(html, /<x>[^"]*"/);
  // JSON.stringify should escape < automatically via our helper
});

test("Chart: wraps canvas in hs-chart-wrap", () => {
  const html = Chart({ kind: "bar", data: sampleData });
  assert.match(html, /<figure class="hs-chart-wrap"/);
});

test("Chart: optional xLabel/yLabel included as figcaption", () => {
  const html = Chart({ kind: "line", data: sampleData, xLabel: "Month", yLabel: "USD", unit: "$" });
  assert.match(html, /<figcaption class="hs-chart-cap">/);
  assert.match(html, /Month/);
  assert.match(html, /USD/);
});

test("Chart: line charts expose hover-friendly point radii and tooltip labels", () => {
  const html = Chart({ kind: "line", data: sampleData, unit: "$" });
  assert.match(html, /"pointRadius":4/);
  assert.match(html, /"pointHoverRadius":6/);
  assert.match(html, /tooltip/);
});
