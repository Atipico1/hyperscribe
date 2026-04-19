import { test } from "node:test";
import assert from "node:assert/strict";
import { ERDDiagram } from "../../plugins/hyperscribe/scripts/components/erd-diagram.mjs";

const sample = {
  entities: [
    { id: "user", name: "User", fields: [
      { name: "id", type: "uuid", key: "pk" },
      { name: "email", type: "text" }
    ]},
    { id: "post", name: "Post", fields: [
      { name: "id", type: "uuid", key: "pk" },
      { name: "user_id", type: "uuid", key: "fk" },
      { name: "body", type: "text", nullable: true }
    ]}
  ],
  relationships: [
    { from: "user", to: "post", cardinality: "1-n", label: "authors" }
  ]
};

test("ERDDiagram: root + entity tables", () => {
  const html = ERDDiagram(sample);
  assert.match(html, /class="hs-erd/);
  assert.match(html, />User</);
  assert.match(html, />Post</);
});

test("ERDDiagram: pk/fk fields get key classes", () => {
  const html = ERDDiagram(sample);
  assert.match(html, /hs-erd-field-key-pk/);
  assert.match(html, /hs-erd-field-key-fk/);
});

test("ERDDiagram: nullable fields marked", () => {
  const html = ERDDiagram(sample);
  assert.match(html, /hs-erd-field-nullable/);
});

test("ERDDiagram: relationship cardinality label rendered", () => {
  const html = ERDDiagram(sample);
  assert.match(html, />1-n</);
  assert.match(html, />authors</);
});

test("ERDDiagram: layout default = grid", () => {
  const html = ERDDiagram(sample);
  assert.match(html, /data-layout="grid"/);
});

test("ERDDiagram: layout columns renders", () => {
  const html = ERDDiagram({ ...sample, layout: "columns" });
  assert.match(html, /data-layout="columns"/);
});

test("ERDDiagram: escapes entity names and fields", () => {
  const html = ERDDiagram({
    entities: [{ id: "x", name: "<x>", fields: [{ name: "<f>", type: "<t>" }] }],
    relationships: []
  });
  assert.match(html, />&lt;x&gt;</);
  assert.match(html, />&lt;f&gt;</);
  assert.match(html, />&lt;t&gt;</);
});
