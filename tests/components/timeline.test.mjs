import { test } from "node:test";
import assert from "node:assert/strict";
import { Timeline } from "../../plugins/hyperscribe/scripts/components/timeline.mjs";

test("Timeline: wraps with orientation class", () => {
  assert.match(Timeline({ items: [], orientation: "vertical" }), /<ol class="hs-timeline hs-timeline-vertical"/);
  assert.match(Timeline({ items: [], orientation: "horizontal" }), /hs-timeline-horizontal/);
});

test("Timeline: renders items with when and title", () => {
  const html = Timeline({
    items: [{ when: "2024-01", title: "Launch" }],
    orientation: "vertical"
  });
  assert.match(html, /<li class="hs-timeline-item"/);
  assert.match(html, /<time class="hs-timeline-when">2024-01<\/time>/);
  assert.match(html, /<div class="hs-timeline-title">Launch<\/div>/);
});

test("Timeline: renders markdown body when present", () => {
  const html = Timeline({
    items: [{ when: "now", title: "T", body: "**bold**" }],
    orientation: "vertical"
  });
  assert.match(html, /<div class="hs-timeline-body"><p><strong>bold<\/strong><\/p><\/div>/);
});

test("Timeline: omits body div when absent", () => {
  const html = Timeline({
    items: [{ when: "now", title: "T" }],
    orientation: "vertical"
  });
  assert.doesNotMatch(html, /hs-timeline-body/);
});

test("Timeline: renders tag badge when present", () => {
  const html = Timeline({
    items: [{ when: "now", title: "T", tag: "milestone" }],
    orientation: "vertical"
  });
  assert.match(html, /<span class="hs-timeline-tag">milestone<\/span>/);
});

test("Timeline: escapes when/title/tag", () => {
  const html = Timeline({
    items: [{ when: "<w>", title: "<t>", tag: "<g>" }],
    orientation: "vertical"
  });
  assert.match(html, /&lt;w&gt;/);
  assert.match(html, /&lt;t&gt;/);
  assert.match(html, /&lt;g&gt;/);
});

test("Timeline: multiple items", () => {
  const html = Timeline({
    items: [
      { when: "1", title: "A" },
      { when: "2", title: "B" }
    ],
    orientation: "vertical"
  });
  const matches = html.match(/hs-timeline-item/g) || [];
  assert.equal(matches.length, 2);
});
