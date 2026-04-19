import { test } from "node:test";
import assert from "node:assert/strict";
import { Comparison } from "../../plugins/hyperscribe/scripts/components/comparison.mjs";

test("Comparison: wraps with mode class", () => {
  assert.match(Comparison({ items: [], mode: "vs" }), /<div class="hs-compare hs-compare-vs"/);
  assert.match(Comparison({ items: [], mode: "grid" }), /hs-compare-grid/);
});

test("Comparison: renders item title + subtitle", () => {
  const html = Comparison({
    items: [{ title: "Option A", subtitle: "cheap", bullets: [] }],
    mode: "vs"
  });
  assert.match(html, /<div class="hs-compare-title">Option A<\/div>/);
  assert.match(html, /<div class="hs-compare-subtitle">cheap<\/div>/);
});

test("Comparison: omits subtitle when absent", () => {
  const html = Comparison({
    items: [{ title: "X", bullets: [] }],
    mode: "vs"
  });
  assert.doesNotMatch(html, /hs-compare-subtitle/);
});

test("Comparison: renders bullets as ul", () => {
  const html = Comparison({
    items: [{ title: "X", bullets: ["first", "second"] }],
    mode: "vs"
  });
  assert.match(html, /<ul class="hs-compare-bullets"><li>first<\/li><li>second<\/li><\/ul>/);
});

test("Comparison: bullets escape HTML", () => {
  const html = Comparison({
    items: [{ title: "X", bullets: ["<x>"] }],
    mode: "vs"
  });
  assert.match(html, /<li>&lt;x&gt;<\/li>/);
});

test("Comparison: renders verdict with tone class", () => {
  const html = Comparison({
    items: [{ title: "X", bullets: [], verdict: { label: "Pick this", tone: "winner" } }],
    mode: "vs"
  });
  assert.match(html, /<div class="hs-compare-verdict hs-compare-verdict-winner">Pick this<\/div>/);
});

test("Comparison: omits verdict when absent", () => {
  const html = Comparison({
    items: [{ title: "X", bullets: [] }],
    mode: "vs"
  });
  assert.doesNotMatch(html, /hs-compare-verdict/);
});

test("Comparison: renders multiple items", () => {
  const html = Comparison({
    items: [
      { title: "A", bullets: [] },
      { title: "B", bullets: [] }
    ],
    mode: "vs"
  });
  const matches = html.match(/hs-compare-item/g) || [];
  assert.equal(matches.length, 2);
});

test("Comparison: escapes item title", () => {
  const html = Comparison({
    items: [{ title: "<x>", bullets: [] }],
    mode: "vs"
  });
  assert.match(html, /&lt;x&gt;/);
});
