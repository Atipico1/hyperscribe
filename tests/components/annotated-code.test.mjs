import { test } from "node:test";
import assert from "node:assert/strict";
import { AnnotatedCode } from "../../plugins/hyperscribe/scripts/components/annotated-code.mjs";

const sample = {
  lang: "js",
  filename: "index.js",
  code: "const x = 1;\nconst y = 2;\nconsole.log(x + y);",
  annotations: [
    { line: 1, pin: 1, title: "Declare x", body: "x is the first operand." },
    { line: 3, pin: 2, title: "Log", body: "Output to stdout." }
  ]
};

test("AnnotatedCode: root wrapper + pair layout", () => {
  const html = AnnotatedCode(sample);
  assert.match(html, /<div class="hs-annotated-code/);
  assert.match(html, /hs-annotated-code-code/);
  assert.match(html, /hs-annotated-code-notes/);
});

test("AnnotatedCode: filename shown when provided", () => {
  const html = AnnotatedCode(sample);
  assert.match(html, />index\.js</);
});

test("AnnotatedCode: pins in code line correspond to annotations", () => {
  const html = AnnotatedCode(sample);
  // pin markers must appear twice: once in the code body near line 1 and line 3,
  // once in the notes column
  assert.equal((html.match(/hs-annotated-code-pin">1</g) || []).length, 2);
  assert.equal((html.match(/hs-annotated-code-pin">2</g) || []).length, 2);
});

test("AnnotatedCode: annotation title and body render", () => {
  const html = AnnotatedCode(sample);
  assert.match(html, />Declare x</);
  assert.match(html, />x is the first operand\.</);
});

test("AnnotatedCode: pinStyle=lettered uses A,B letters", () => {
  const html = AnnotatedCode({ ...sample, pinStyle: "lettered" });
  assert.match(html, /hs-annotated-code-pin">A</);
  assert.match(html, /hs-annotated-code-pin">B</);
});

test("AnnotatedCode: escapes code html", () => {
  const html = AnnotatedCode({
    lang: "html",
    code: "<script>alert(1)</script>",
    annotations: [{ line: 1, pin: 1, title: "t", body: "b" }]
  });
  assert.match(html, /&lt;script&gt;/);
  assert.doesNotMatch(html, /<script>alert/);
});

test("AnnotatedCode: annotation for line beyond code length is skipped in-line but shown in notes", () => {
  const html = AnnotatedCode({
    lang: "js",
    code: "a",
    annotations: [{ line: 99, pin: 1, title: "gone", body: "missing line" }]
  });
  assert.match(html, />gone</);
});
