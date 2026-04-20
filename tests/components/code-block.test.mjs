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
  const matches = html.match(/<span class="hs-code-line(?: hs-code-line-hl)?">/g) || [];
  assert.equal(matches.length, 3);
});

test("CodeBlock: renders line numbers by default", () => {
  const html = CodeBlock({ lang: "js", code: "a\nb" });
  assert.match(html, /hs-code-line-no">1</);
  assert.match(html, /hs-code-line-no">2</);
});

test("CodeBlock: does not preserve blank text nodes between line spans", () => {
  const html = CodeBlock({ lang: "js", code: "a\nb" });
  assert.doesNotMatch(html, /<\/span>\n<span class="hs-code-line"/);
});

test("CodeBlock: highlights specified lines (1-indexed)", () => {
  const html = CodeBlock({ lang: "js", code: "a\nb\nc", highlight: [2] });
  assert.match(
    html,
    /<span class="hs-code-line hs-code-line-hl"><span class="hs-code-line-no">2<\/span><span class="hs-code-line-content">b<\/span><\/span>/
  );
});

test("CodeBlock: escapes filename HTML", () => {
  const html = CodeBlock({ lang: "js", code: "x", filename: "<bad>" });
  assert.match(html, />&lt;bad&gt;</);
});

test("CodeBlock: renders language badge in metadata header", () => {
  const html = CodeBlock({ lang: "python", code: "print('hi')", filename: "main.py" });
  assert.match(html, /hs-code-meta/);
  assert.match(html, /hs-code-badge/);
  assert.match(html, />python</);
});

test("CodeBlock: applies lightweight token styling spans", () => {
  const html = CodeBlock({
    lang: "js",
    code: "const answer = 42; // note\nconst msg = \"hi\";"
  });
  assert.match(html, /hs-code-token-keyword/);
  assert.match(html, /hs-code-token-number/);
  assert.match(html, /hs-code-token-comment/);
  assert.match(html, /hs-code-token-string/);
});
