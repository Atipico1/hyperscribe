import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { Sequence } from "../../plugins/hyperscribe/scripts/components/sequence.mjs";

test("Sequence: renders wrapper + svg root", () => {
  const html = Sequence({
    participants: [{ id: "a", title: "A" }, { id: "b", title: "B" }],
    messages: [{ from: "a", to: "b", text: "hi" }]
  });
  assert.match(html, /<div class="hs-seq-wrap">/);
  assert.match(html, /<svg[^>]*class="hs-seq"/);
});

test("Sequence: renders one header + footer box per participant", () => {
  const html = Sequence({
    participants: [{ id: "a", title: "A" }, { id: "b", title: "B" }],
    messages: []
  });
  const boxes = html.match(/class="hs-seq-pbox"/g);
  assert.equal(boxes.length, 4);
});

test("Sequence: renders subtitle when provided", () => {
  const html = Sequence({
    participants: [{ id: "a", title: "A", subtitle: "LLM" }],
    messages: []
  });
  assert.match(html, /class="hs-seq-psub">LLM<\/text>/);
});

test("Sequence: renders sync message with filled arrow", () => {
  const html = Sequence({
    participants: [{ id: "a", title: "A" }, { id: "b", title: "B" }],
    messages: [{ from: "a", to: "b", text: "call", kind: "sync" }]
  });
  assert.match(html, /marker-end="url\(#hsSeqFilled\)"/);
  assert.match(html, /class="hs-seq-msg-text">call<\/text>/);
});

test("Sequence: async message uses dashed line", () => {
  const html = Sequence({
    participants: [{ id: "a", title: "A" }, { id: "b", title: "B" }],
    messages: [{ from: "a", to: "b", text: "evt", kind: "async" }]
  });
  assert.match(html, /class="hs-seq-arrow hs-seq-arrow-dashed"/);
  assert.match(html, /marker-end="url\(#hsSeqFilled\)"/);
});

test("Sequence: return message uses dashed + open arrow", () => {
  const html = Sequence({
    participants: [{ id: "a", title: "A" }, { id: "b", title: "B" }],
    messages: [{ from: "b", to: "a", text: "200 OK", kind: "return" }]
  });
  assert.match(html, /class="hs-seq-arrow hs-seq-arrow-dashed"/);
  assert.match(html, /marker-end="url\(#hsSeqOpen\)"/);
});

test("Sequence: self message renders loop path", () => {
  const html = Sequence({
    participants: [{ id: "a", title: "A" }],
    messages: [{ from: "a", to: "a", text: "internal", kind: "self" }]
  });
  assert.match(html, /data-kind="self"/);
  assert.match(html, /<path d="M/);
});

test("Sequence: note renders box + text", () => {
  const html = Sequence({
    participants: [{ id: "a", title: "A" }, { id: "b", title: "B" }],
    messages: [{ kind: "note", over: ["a", "b"], text: "shared state" }]
  });
  assert.match(html, /<rect[^>]*class="hs-seq-note-box"/);
  assert.match(html, /class="hs-seq-note-text">shared state<\/text>/);
});

test("Sequence: escapes user content", () => {
  const html = Sequence({
    participants: [{ id: "a", title: "<x>" }],
    messages: [{ from: "a", to: "a", text: "<hack>", kind: "self" }]
  });
  assert.match(html, /&lt;x&gt;/);
  assert.match(html, /&lt;hack&gt;/);
});

test("Sequence: silently skips messages with unknown participant ids", () => {
  const html = Sequence({
    participants: [{ id: "a", title: "A" }],
    messages: [{ from: "a", to: "ghost", text: "bad ref" }]
  });
  assert.doesNotMatch(html, /bad ref/);
});

test("Sequence CSS: uses theme variables for lifelines and arrows", () => {
  const css = readFileSync(new URL("../../plugins/hyperscribe/assets/components/sequence.css", import.meta.url), "utf8");
  assert.match(css, /var\(--hs-color-fg-muted\)/);
  assert.match(css, /var\(--hs-color-fg\)/);
});
