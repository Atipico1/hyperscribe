import { test } from "node:test";
import assert from "node:assert/strict";
import { Prose } from "../../plugins/hyperscribe/scripts/components/prose.mjs";

test("Prose: wraps markdown in hs-prose container", () => {
  const html = Prose({ markdown: "hello" });
  assert.equal(html, '<div class="hs-prose"><p>hello</p></div>');
});

test("Prose: renders bold", () => {
  const html = Prose({ markdown: "**bold**" });
  assert.equal(html, '<div class="hs-prose"><p><strong>bold</strong></p></div>');
});

test("Prose: renders list", () => {
  const html = Prose({ markdown: "- a\n- b" });
  assert.equal(html, '<div class="hs-prose"><ul><li>a</li><li>b</li></ul></div>');
});

test("Prose: empty markdown produces empty container", () => {
  const html = Prose({ markdown: "" });
  assert.equal(html, '<div class="hs-prose"></div>');
});
