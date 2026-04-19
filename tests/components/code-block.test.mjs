import { test } from "node:test";
import assert from "node:assert/strict";
import { CodeBlock } from "../../plugins/hyperscribe/scripts/components/code-block.mjs";

test("CodeBlock: renders pre/code with lang class", () => {
  const html = CodeBlock({ lang: "js", code: "const x = 1;" });
  assert.match(html, /<pre class="hs-code hs-code-lang-js"/);
  assert.match(html, /<code>/);
});

test("CodeBlock: escapes code HTML", () => {
  const html = CodeBlock({ lang: "html", code: "<div>" });
  assert.match(html, /&lt;div&gt;/);
});

test("CodeBlock: renders filename header when present", () => {
  const html = CodeBlock({ lang: "js", code: "x", filename: "a.js" });
  assert.match(html, /<div class="hs-code-filename">a\.js<\/div>/);
});

test("CodeBlock: omits filename when absent", () => {
  const html = CodeBlock({ lang: "js", code: "x" });
  assert.doesNotMatch(html, /hs-code-filename/);
});

test("CodeBlock: wraps each line in a span", () => {
  const html = CodeBlock({ lang: "js", code: "a\nb\nc" });
  const matches = html.match(/<span class="hs-code-line[^"]*">/g) || [];
  assert.equal(matches.length, 3);
});

test("CodeBlock: highlights specified lines (1-indexed)", () => {
  const html = CodeBlock({ lang: "js", code: "a\nb\nc", highlight: [2] });
  assert.match(html, /<span class="hs-code-line hs-code-line-hl">b<\/span>/);
});

test("CodeBlock: escapes filename HTML", () => {
  const html = CodeBlock({ lang: "js", code: "x", filename: "<bad>" });
  assert.match(html, />&lt;bad&gt;</);
});
