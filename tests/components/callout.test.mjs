import { test } from "node:test";
import assert from "node:assert/strict";
import { Callout } from "../../plugins/hyperscribe/scripts/components/callout.mjs";

test("Callout: wraps with severity class", () => {
  const html = Callout({ severity: "warn", body: "hi" });
  assert.match(html, /<aside class="hs-callout hs-callout-warn"/);
});

test("Callout: renders title when present", () => {
  const html = Callout({ severity: "info", title: "Heads up", body: "x" });
  assert.match(html, /<div class="hs-callout-title">Heads up<\/div>/);
});

test("Callout: omits title div when absent", () => {
  const html = Callout({ severity: "info", body: "x" });
  assert.doesNotMatch(html, /hs-callout-title/);
});

test("Callout: renders body as markdown", () => {
  const html = Callout({ severity: "info", body: "**bold** body" });
  assert.match(html, /<div class="hs-callout-body"><p><strong>bold<\/strong> body<\/p><\/div>/);
});

test("Callout: escapes title HTML", () => {
  const html = Callout({ severity: "info", title: "<x>", body: "y" });
  assert.match(html, />&lt;x&gt;</);
});

test("Callout: all 5 severity variants produce matching class", () => {
  for (const s of ["info","note","warn","success","danger"]) {
    const html = Callout({ severity: s, body: "x" });
    assert.match(html, new RegExp(`hs-callout-${s}`));
  }
});
