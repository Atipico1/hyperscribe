import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";
import { validate } from "../plugins/hyperscribe/scripts/lib/schema.mjs";

const __dirname = dirname(fileURLToPath(import.meta.url));
const catalog = JSON.parse(
  readFileSync(resolve(__dirname, "../spec/catalog.json"), "utf8")
);

test("validate: accepts minimal valid envelope", () => {
  const doc = {
    a2ui_version: "0.9",
    catalog: "hyperscribe/v1",
    parts: [
      {
        component: "hyperscribe/Page",
        props: { title: "Hi" },
        children: [
          { component: "hyperscribe/Prose", props: { markdown: "hello" } }
        ]
      }
    ]
  };
  const errors = validate(doc, catalog);
  assert.deepEqual(errors, []);
});

test("validate: rejects missing envelope field", () => {
  const doc = { catalog: "hyperscribe/v1", parts: [] };
  const errors = validate(doc, catalog);
  assert.ok(errors.length > 0);
  assert.match(errors[0].message, /a2ui_version/);
});

test("validate: rejects unknown component", () => {
  const doc = {
    a2ui_version: "0.9",
    catalog: "hyperscribe/v1",
    parts: [
      { component: "hyperscribe/UnknownThing", props: {} }
    ]
  };
  const errors = validate(doc, catalog);
  assert.ok(errors.length > 0);
  assert.match(errors[0].message, /Unknown component/);
  assert.equal(errors[0].path, "parts[0]");
});

test("validate: rejects missing required prop", () => {
  const doc = {
    a2ui_version: "0.9",
    catalog: "hyperscribe/v1",
    parts: [
      {
        component: "hyperscribe/Page",
        props: {},
        children: [
          { component: "hyperscribe/Prose", props: { markdown: "x" } }
        ]
      }
    ]
  };
  const errors = validate(doc, catalog);
  assert.ok(errors.some(e => /title/.test(e.message)));
});

test("validate: rejects wrong type on prop", () => {
  const doc = {
    a2ui_version: "0.9",
    catalog: "hyperscribe/v1",
    parts: [
      {
        component: "hyperscribe/Page",
        props: { title: 42 },
        children: [
          { component: "hyperscribe/Prose", props: { markdown: "x" } }
        ]
      }
    ]
  };
  const errors = validate(doc, catalog);
  assert.ok(errors.some(e => /title.*string/.test(e.message)));
});

test("validate: rejects enum violation", () => {
  const doc = {
    a2ui_version: "0.9",
    catalog: "hyperscribe/v1",
    parts: [
      {
        component: "hyperscribe/Page",
        props: { title: "x" },
        children: [
          { component: "hyperscribe/Heading", props: { level: 5, text: "bad" } }
        ]
      }
    ]
  };
  const errors = validate(doc, catalog);
  assert.ok(errors.some(e => /level/.test(e.message)));
});

test("validate: root must be Page", () => {
  const doc = {
    a2ui_version: "0.9",
    catalog: "hyperscribe/v1",
    parts: [
      { component: "hyperscribe/Prose", props: { markdown: "x" } }
    ]
  };
  const errors = validate(doc, catalog);
  assert.ok(errors.some(e => /root.*Page/i.test(e.message)));
});

test("validate: catalog must match", () => {
  const doc = {
    a2ui_version: "0.9",
    catalog: "other/v2",
    parts: []
  };
  const errors = validate(doc, catalog);
  assert.ok(errors.some(e => /catalog/.test(e.message)));
});

test("validate: pattern enforced on Section.id", () => {
  const doc = {
    a2ui_version: "0.9",
    catalog: "hyperscribe/v1",
    parts: [
      {
        component: "hyperscribe/Page",
        props: { title: "x" },
        children: [
          { component: "hyperscribe/Section", props: { id: "BadID!", title: "t" } }
        ]
      }
    ]
  };
  const errors = validate(doc, catalog);
  assert.ok(errors.some(e => /id.*pattern/.test(e.message)));
});

test("validate: returns path for nested errors", () => {
  const doc = {
    a2ui_version: "0.9",
    catalog: "hyperscribe/v1",
    parts: [
      {
        component: "hyperscribe/Page",
        props: { title: "x" },
        children: [
          {
            component: "hyperscribe/Section",
            props: { id: "s", title: "t" },
            children: [
              { component: "hyperscribe/Heading", props: { level: 2 } }
            ]
          }
        ]
      }
    ]
  };
  const errors = validate(doc, catalog);
  assert.ok(errors.some(e => e.path.includes("children[0].children[0]")));
});

test("validate: rejects non-array parts", () => {
  const doc = {
    a2ui_version: "0.9",
    catalog: "hyperscribe/v1",
    parts: {}
  };
  const errors = validate(doc, catalog);
  assert.ok(errors.some(e => e.path === "parts" && /must be an array/.test(e.message)));
});

test("validate: null-valued prop reports 'got null' not 'got object'", () => {
  const doc = {
    a2ui_version: "0.9",
    catalog: "hyperscribe/v1",
    parts: [
      {
        component: "hyperscribe/Page",
        props: { title: null },
        children: [
          { component: "hyperscribe/Prose", props: { markdown: "x" } }
        ]
      }
    ]
  };
  const errors = validate(doc, catalog);
  assert.ok(errors.some(e => /got null/.test(e.message)), "expected 'got null' in error message");
});
