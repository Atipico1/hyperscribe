import { test } from "node:test";
import assert from "node:assert/strict";
import { DataTable } from "../../plugins/hyperscribe/scripts/components/data-table.mjs";

const cols = [
  { key: "name", label: "Name" },
  { key: "age", label: "Age", align: "right" }
];

test("DataTable: renders table wrapper with density class", () => {
  const html = DataTable({ columns: cols, rows: [], density: "compact" });
  assert.match(html, /<table class="hs-table hs-table-compact"/);
});

test("DataTable: defaults to standard density", () => {
  const html = DataTable({ columns: cols, rows: [] });
  assert.match(html, /hs-table-standard/);
});

test("DataTable: renders thead from columns", () => {
  const html = DataTable({ columns: cols, rows: [] });
  assert.match(html, /<thead><tr><th[^>]*>Name<\/th><th[^>]*>Age<\/th><\/tr><\/thead>/);
});

test("DataTable: align class on th", () => {
  const html = DataTable({ columns: cols, rows: [] });
  assert.match(html, /<th class="hs-td-right">Age<\/th>/);
});

test("DataTable: renders rows", () => {
  const html = DataTable({ columns: cols, rows: [{ name: "A", age: 1 }] });
  assert.match(html, /<tr><td[^>]*>A<\/td><td class="hs-td-right">1<\/td><\/tr>/);
});

test("DataTable: escapes string cell values", () => {
  const html = DataTable({ columns: [{ key: "x", label: "X" }], rows: [{ x: "<bad>" }] });
  assert.match(html, /&lt;bad&gt;/);
});

test("DataTable: renders caption when present", () => {
  const html = DataTable({ columns: cols, rows: [], caption: "My table" });
  assert.match(html, /<caption>My table<\/caption>/);
});

test("DataTable: omits caption when absent", () => {
  const html = DataTable({ columns: cols, rows: [] });
  assert.doesNotMatch(html, /<caption>/);
});

test("DataTable: renders footer row", () => {
  const html = DataTable({ columns: cols, rows: [], footer: { name: "Total", age: 42 } });
  assert.match(html, /<tfoot><tr><td[^>]*>Total<\/td><td class="hs-td-right">42<\/td><\/tr><\/tfoot>/);
});

test("DataTable: empty cell rendered as empty string", () => {
  const html = DataTable({ columns: cols, rows: [{ name: "A" }] });
  assert.match(html, /<td[^>]*>A<\/td><td class="hs-td-right"><\/td>/);
});
