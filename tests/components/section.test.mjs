import { test } from "node:test";
import assert from "node:assert/strict";
import { Section } from "../../plugins/hyperscribe/scripts/components/section.mjs";

test("Section: renders with id anchor", () => {
  const html = Section({ id: "intro", title: "Intro" }, () => "");
  assert.match(html, /<section[^>]*id="intro"/);
});

test("Section: renders title as h2", () => {
  const html = Section({ id: "x", title: "Hello" }, () => "");
  assert.match(html, /<h2[^>]*class="hs-section-title"[^>]*>Hello<\/h2>/);
});

test("Section: renders lead as markdown paragraph", () => {
  const html = Section({ id: "x", title: "T", lead: "**bold** lead" }, () => "");
  assert.match(html, /<div class="hs-section-lead"><p><strong>bold<\/strong> lead<\/p><\/div>/);
});

test("Section: omits lead container when not provided", () => {
  const html = Section({ id: "x", title: "T" }, () => "");
  assert.doesNotMatch(html, /hs-section-lead/);
});

test("Section: includes children", () => {
  const html = Section({ id: "x", title: "T" }, () => "<div>body</div>");
  assert.match(html, /<div class="hs-section-body"><div>body<\/div><\/div>/);
});

test("Section: escapes title", () => {
  const html = Section({ id: "x", title: "<x>" }, () => "");
  assert.match(html, /<h2[^>]*>&lt;x&gt;<\/h2>/);
});
