import { test } from "node:test";
import assert from "node:assert/strict";
import { renderMarkdown } from "../plugins/hyperscribe/scripts/lib/markdown.mjs";

test("renders plain paragraph", () => {
  assert.equal(renderMarkdown("hello"), "<p>hello</p>");
});

test("escapes HTML in plain text", () => {
  assert.equal(renderMarkdown("<script>"), "<p>&lt;script&gt;</p>");
});

test("splits paragraphs on blank line", () => {
  assert.equal(renderMarkdown("a\n\nb"), "<p>a</p>\n<p>b</p>");
});

test("bold with asterisks", () => {
  assert.equal(renderMarkdown("a **b** c"), "<p>a <strong>b</strong> c</p>");
});

test("bold with underscores", () => {
  assert.equal(renderMarkdown("__b__"), "<p><strong>b</strong></p>");
});

test("italic with asterisks", () => {
  assert.equal(renderMarkdown("*b*"), "<p><em>b</em></p>");
});

test("italic with underscores", () => {
  assert.equal(renderMarkdown("_b_"), "<p><em>b</em></p>");
});

test("inline code", () => {
  assert.equal(renderMarkdown("use `foo()`"), "<p>use <code>foo()</code></p>");
});

test("inline code escapes HTML inside", () => {
  assert.equal(renderMarkdown("`<x>`"), "<p><code>&lt;x&gt;</code></p>");
});

test("link", () => {
  assert.equal(
    renderMarkdown("[x](https://a.com)"),
    '<p><a href="https://a.com">x</a></p>'
  );
});

test("link escapes href", () => {
  assert.equal(
    renderMarkdown('[x](javascript:alert(1))'),
    '<p><a href="javascript:alert(1)">x</a></p>'
  );
});

test("unordered list", () => {
  assert.equal(
    renderMarkdown("- a\n- b"),
    "<ul><li>a</li><li>b</li></ul>"
  );
});

test("ordered list", () => {
  assert.equal(
    renderMarkdown("1. a\n2. b"),
    "<ol><li>a</li><li>b</li></ol>"
  );
});

test("list with inline formatting", () => {
  assert.equal(
    renderMarkdown("- **a**\n- *b*"),
    "<ul><li><strong>a</strong></li><li><em>b</em></li></ul>"
  );
});

test("list separated from paragraph by blank line", () => {
  assert.equal(
    renderMarkdown("intro\n\n- a\n- b\n\noutro"),
    "<p>intro</p>\n<ul><li>a</li><li>b</li></ul>\n<p>outro</p>"
  );
});

test("handles combined inline markers", () => {
  assert.equal(
    renderMarkdown("**a** _b_ `c` [d](e)"),
    '<p><strong>a</strong> <em>b</em> <code>c</code> <a href="e">d</a></p>'
  );
});

test("empty input returns empty string", () => {
  assert.equal(renderMarkdown(""), "");
  assert.equal(renderMarkdown("   "), "");
});
