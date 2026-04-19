import { test } from "node:test";
import assert from "node:assert/strict";
import { KPICard } from "../../plugins/hyperscribe/scripts/components/kpi-card.mjs";

test("KPICard: renders label + value", () => {
  const html = KPICard({ label: "Revenue", value: "$4,200" });
  assert.match(html, /<div class="hs-kpi-label">Revenue<\/div>/);
  assert.match(html, /<div class="hs-kpi-value">\$4,200<\/div>/);
});

test("KPICard: wraps with hs-kpi class", () => {
  const html = KPICard({ label: "x", value: "y" });
  assert.match(html, /^<article class="hs-kpi">/);
});

test("KPICard: escapes label, value, hint", () => {
  const html = KPICard({ label: "<l>", value: "<v>", hint: "<h>" });
  assert.match(html, /&lt;l&gt;/);
  assert.match(html, /&lt;v&gt;/);
  assert.match(html, /&lt;h&gt;/);
});

test("KPICard: renders delta with direction class + symbol", () => {
  const up = KPICard({ label: "a", value: "b", delta: { value: "+3%", direction: "up" }});
  const down = KPICard({ label: "a", value: "b", delta: { value: "-1%", direction: "down" }});
  const flat = KPICard({ label: "a", value: "b", delta: { value: "0%", direction: "flat" }});
  assert.match(up, /<div class="hs-kpi-delta hs-kpi-delta-up">/);
  assert.match(up, /<span class="hs-kpi-delta-icon">↑<\/span>\+3%/);
  assert.match(down, /hs-kpi-delta-down/);
  assert.match(down, /<span class="hs-kpi-delta-icon">↓<\/span>-1%/);
  assert.match(flat, /hs-kpi-delta-flat/);
  assert.match(flat, /<span class="hs-kpi-delta-icon">→<\/span>0%/);
});

test("KPICard: omits delta when absent", () => {
  const html = KPICard({ label: "a", value: "b" });
  assert.doesNotMatch(html, /hs-kpi-delta/);
});

test("KPICard: renders hint when present", () => {
  const html = KPICard({ label: "a", value: "b", hint: "since Q1" });
  assert.match(html, /<div class="hs-kpi-hint">since Q1<\/div>/);
});

test("KPICard: omits hint when absent", () => {
  const html = KPICard({ label: "a", value: "b" });
  assert.doesNotMatch(html, /hs-kpi-hint/);
});
