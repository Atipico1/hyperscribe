import { test } from "node:test";
import assert from "node:assert/strict";
import { Heading } from "../../plugins/hyperscribe/scripts/components/heading.mjs";

test("Heading: renders h2", () => {
  const html = Heading({ level: 2, text: "Title" });
  assert.equal(html, '<h2 class="hs-heading hs-heading-h2">Title</h2>');
});

test("Heading: renders h3", () => {
  const html = Heading({ level: 3, text: "Subtitle" });
  assert.equal(html, '<h3 class="hs-heading hs-heading-h3">Subtitle</h3>');
});

test("Heading: renders h4", () => {
  const html = Heading({ level: 4, text: "Minor" });
  assert.equal(html, '<h4 class="hs-heading hs-heading-h4">Minor</h4>');
});

test("Heading: adds id from anchor", () => {
  const html = Heading({ level: 2, text: "T", anchor: "my-anchor" });
  assert.equal(html, '<h2 class="hs-heading hs-heading-h2" id="my-anchor">T</h2>');
});

test("Heading: escapes text", () => {
  const html = Heading({ level: 2, text: "<x>" });
  assert.match(html, />&lt;x&gt;</);
});
