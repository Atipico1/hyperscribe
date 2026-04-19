import { test } from "node:test";
import assert from "node:assert/strict";
import { renderTree } from "../plugins/hyperscribe/scripts/lib/tree.mjs";

const fakeRegistry = {
  "hyperscribe/Page": (props, renderChildren) => `<page title="${props.title}">${renderChildren()}</page>`,
  "hyperscribe/Prose": (props) => `<p>${props.markdown}</p>`,
  "hyperscribe/Section": (props, renderChildren) => `<section id="${props.id}">${renderChildren()}</section>`
};

test("renderTree: renders single leaf", () => {
  const node = { component: "hyperscribe/Prose", props: { markdown: "hi" } };
  assert.equal(renderTree(node, fakeRegistry), "<p>hi</p>");
});

test("renderTree: renders nested children", () => {
  const node = {
    component: "hyperscribe/Page",
    props: { title: "T" },
    children: [
      { component: "hyperscribe/Prose", props: { markdown: "a" } }
    ]
  };
  assert.equal(renderTree(node, fakeRegistry), '<page title="T"><p>a</p></page>');
});

test("renderTree: renders multiple children", () => {
  const node = {
    component: "hyperscribe/Section",
    props: { id: "s" },
    children: [
      { component: "hyperscribe/Prose", props: { markdown: "a" } },
      { component: "hyperscribe/Prose", props: { markdown: "b" } }
    ]
  };
  assert.equal(renderTree(node, fakeRegistry), '<section id="s"><p>a</p><p>b</p></section>');
});

test("renderTree: throws on unregistered component", () => {
  const node = { component: "hyperscribe/Nope", props: {} };
  assert.throws(
    () => renderTree(node, fakeRegistry),
    /No renderer.*hyperscribe\/Nope/
  );
});

test("renderTree: passes ctx through", () => {
  const registry = {
    "hyperscribe/Page": (props, renderChildren, ctx) => `<page theme="${ctx.theme}">${renderChildren()}</page>`,
    "hyperscribe/Prose": (props, _, ctx) => `<p theme="${ctx.theme}">${props.markdown}</p>`
  };
  const node = {
    component: "hyperscribe/Page",
    props: { title: "T" },
    children: [{ component: "hyperscribe/Prose", props: { markdown: "x" } }]
  };
  const out = renderTree(node, registry, { theme: "notion" });
  assert.equal(out, '<page theme="notion"><p theme="notion">x</p></page>');
});

test("renderTree: empty children renders empty string", () => {
  const node = { component: "hyperscribe/Page", props: { title: "T" }, children: [] };
  assert.equal(renderTree(node, fakeRegistry), '<page title="T"></page>');
});
