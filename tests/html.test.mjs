import { test } from "node:test";
import assert from "node:assert/strict";
import { escape, attr, tag } from "../plugins/hyperscribe/scripts/lib/html.mjs";

test("escape: replaces special chars", () => {
  assert.equal(escape("<script>"), "&lt;script&gt;");
  assert.equal(escape("a & b"), "a &amp; b");
  assert.equal(escape('"quoted"'), "&quot;quoted&quot;");
  assert.equal(escape("it's"), "it&#39;s");
});

test("escape: passes through safe text", () => {
  assert.equal(escape("hello world"), "hello world");
});

test("attr: renders key='value' with escape", () => {
  assert.equal(attr("id", "x"), ' id="x"');
  assert.equal(attr("data-x", "a&b"), ' data-x="a&amp;b"');
});

test("attr: omits when value is undefined or null", () => {
  assert.equal(attr("id", undefined), "");
  assert.equal(attr("id", null), "");
});

test("attr: renders boolean attribute when true", () => {
  assert.equal(attr("hidden", true), " hidden");
  assert.equal(attr("hidden", false), "");
});

test("tag: wraps content", () => {
  assert.equal(tag("p", {}, "hi"), "<p>hi</p>");
  assert.equal(tag("div", { class: "x" }, "c"), '<div class="x">c</div>');
});

test("tag: self-closing when no children", () => {
  assert.equal(tag("br", {}), "<br>");
  assert.equal(tag("img", { src: "a.png" }), '<img src="a.png">');
});

test("tag: escapes attribute values", () => {
  assert.equal(tag("a", { href: 'a"b' }, "x"), '<a href="a&quot;b">x</a>');
});
