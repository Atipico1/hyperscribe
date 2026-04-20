import { test } from "node:test";
import assert from "node:assert/strict";
import { StepList } from "../../plugins/hyperscribe/scripts/components/step-list.mjs";

test("StepList: renders ol by default", () => {
  const html = StepList({ steps: [{ title: "A", body: "x" }] });
  assert.match(html, /^<ol class="hs-steps hs-steps-numbered"/);
  assert.match(html, /<span class="hs-step-index">1<\/span>/);
});

test("StepList: renders ul when numbered=false", () => {
  const html = StepList({ steps: [{ title: "A", body: "x" }], numbered: false });
  assert.match(html, /^<ul class="hs-steps"/);
  assert.doesNotMatch(html, /hs-steps-numbered/);
});

test("StepList: renders step title and body as markdown", () => {
  const html = StepList({ steps: [{ title: "Setup", body: "**install** deps" }] });
  assert.match(html, /<div class="hs-step-title">Setup<\/div>/);
  assert.match(html, /<div class="hs-step-body"><p><strong>install<\/strong> deps<\/p><\/div>/);
});

test("StepList: applies state class", () => {
  for (const state of ["done","doing","todo","skipped"]) {
    const html = StepList({ steps: [{ title: "x", body: "y", state }] });
    assert.match(html, new RegExp(`hs-step-${state}`));
  }
});

test("StepList: no state class when state absent", () => {
  const html = StepList({ steps: [{ title: "x", body: "y" }] });
  assert.doesNotMatch(html, /hs-step-(done|doing|todo|skipped)/);
});

test("StepList: state indicator symbol for done/doing/skipped", () => {
  const done = StepList({ steps: [{ title: "x", body: "y", state: "done" }] });
  const doing = StepList({ steps: [{ title: "x", body: "y", state: "doing" }] });
  const skipped = StepList({ steps: [{ title: "x", body: "y", state: "skipped" }] });
  assert.match(done, /<span class="hs-step-indicator" aria-label="done">✓<\/span>/);
  assert.match(doing, /<span class="hs-step-indicator" aria-label="doing">●<\/span>/);
  assert.match(skipped, /<span class="hs-step-indicator" aria-label="skipped">○<\/span>/);
});

test("StepList: groups index and indicator into a dedicated meta rail", () => {
  const html = StepList({ steps: [{ title: "x", body: "y", state: "doing" }] });
  assert.match(html, /<div class="hs-step-meta"><span class="hs-step-index">1<\/span><span class="hs-step-indicator" aria-label="doing">●<\/span><\/div>/);
});

test("StepList: escapes title", () => {
  const html = StepList({ steps: [{ title: "<x>", body: "y" }] });
  assert.match(html, /&lt;x&gt;/);
});
