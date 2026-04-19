import { test } from "node:test";
import assert from "node:assert/strict";
import { Mermaid } from "../../plugins/hyperscribe/scripts/components/mermaid.mjs";

test("Mermaid: wraps source in pre.mermaid with zoom/pan container", () => {
  const html = Mermaid({ kind: "flowchart", source: "A --> B" });
  assert.match(html, /<div class="hs-mermaid-wrap"/);
  assert.match(html, /<pre class="mermaid">/);
  assert.match(html, /A --&gt; B/);
});

test("Mermaid: escapes source HTML but preserves content", () => {
  const html = Mermaid({ kind: "flowchart", source: "<x>" });
  assert.match(html, /&lt;x&gt;/);
});

test("Mermaid: includes loader script guard", () => {
  const html = Mermaid({ kind: "flowchart", source: "A" });
  assert.match(html, /window\.__hsMermaidLoaded/);
  assert.match(html, /cdn\.jsdelivr\.net.*mermaid/);
});

test("Mermaid: prefixes flowchart source with direction when provided", () => {
  const html = Mermaid({ kind: "flowchart", source: "A --> B", direction: "LR" });
  assert.match(html, /flowchart LR/);
});

test("Mermaid: does not prepend direction for non-flowchart kinds", () => {
  const html = Mermaid({ kind: "sequence", source: "A->>B: hi", direction: "LR" });
  assert.doesNotMatch(html, /flowchart LR/);
});

test("Mermaid: kind attribute on outer wrap", () => {
  const html = Mermaid({ kind: "sequence", source: "x" });
  assert.match(html, /data-kind="sequence"/);
});
