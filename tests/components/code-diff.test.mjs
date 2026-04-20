import { test } from "node:test";
import assert from "node:assert/strict";
import { CodeDiff } from "../../plugins/hyperscribe/scripts/components/code-diff.mjs";

test("CodeDiff: wraps with filename + lang", () => {
  const html = CodeDiff({ filename: "a.js", lang: "js", hunks: [{ before: "x", after: "y" }] });
  assert.match(html, /<div class="hs-diff hs-diff-lang-js"/);
  assert.match(html, /<div class="hs-diff-filename">a\.js<\/div>/);
});

test("CodeDiff: escapes filename", () => {
  const html = CodeDiff({ filename: "<bad>", lang: "js", hunks: [{ before: "", after: "" }] });
  assert.match(html, /&lt;bad&gt;/);
});

test("CodeDiff: marks removed lines with minus", () => {
  const html = CodeDiff({ filename: "f", lang: "js", hunks: [{ before: "old line", after: "" }] });
  assert.match(html, /<span class="hs-diff-line hs-diff-remove"><span class="hs-diff-marker">-<\/span>old line<\/span>/);
});

test("CodeDiff: marks added lines with plus", () => {
  const html = CodeDiff({ filename: "f", lang: "js", hunks: [{ before: "", after: "new line" }] });
  assert.match(html, /<span class="hs-diff-line hs-diff-add"><span class="hs-diff-marker">\+<\/span>new line<\/span>/);
});

test("CodeDiff: unchanged lines (present in both) rendered as context", () => {
  const html = CodeDiff({ filename: "f", lang: "js", hunks: [{ before: "kept\nold", after: "kept\nnew" }] });
  assert.match(html, /<span class="hs-diff-line hs-diff-context"><span class="hs-diff-marker"> <\/span>kept<\/span>/);
  assert.match(html, /hs-diff-remove[^>]*><span[^>]*>-<\/span>old/);
  assert.match(html, /hs-diff-add[^>]*><span[^>]*>\+<\/span>new/);
});

test("CodeDiff: escapes code content", () => {
  const html = CodeDiff({ filename: "f", lang: "html", hunks: [{ before: "<div>", after: "<span>" }] });
  assert.match(html, /&lt;div&gt;/);
  assert.match(html, /&lt;span&gt;/);
});

test("CodeDiff: renders atLine hint when present", () => {
  const html = CodeDiff({ filename: "f", lang: "js", hunks: [{ before: "a", after: "b", atLine: 42 }] });
  assert.match(html, /<div class="hs-diff-hunk-header">@@ line 42<\/div>/);
});

test("CodeDiff: multiple hunks separated", () => {
  const html = CodeDiff({ filename: "f", lang: "js", hunks: [{ before: "a", after: "b" }, { before: "c", after: "d" }] });
  const matches = html.match(/hs-diff-hunk(?!-header)/g) || [];
  assert.equal(matches.length, 2);
});

test("CodeDiff: does not preserve blank newline text nodes between rendered lines", () => {
  const html = CodeDiff({ filename: "f", lang: "js", hunks: [{ before: "a\nb", after: "a\nc" }] });
  assert.doesNotMatch(html, /<\/span>\n<span class="hs-diff-line/);
});
