import { test } from "node:test";
import assert from "node:assert/strict";
import { PrettyChart } from "../../plugins/hyperscribe/scripts/components/pretty-chart.mjs";

const data1 = { labels: ["A","B","C"], series: [{ name: "s1", values: [10,20,15] }] };

test("PrettyChart: renders bar wrapper + svg", () => {
  const html = PrettyChart({ kind: "bar", data: data1 });
  assert.match(html, /<div class="hs-pchart hs-pchart-bar[^"]*"/);
  assert.match(html, /<svg[^>]+viewBox/);
});

test("PrettyChart: renders one <rect class=\"hs-pchart-bar-rect\"> per value", () => {
  const html = PrettyChart({ kind: "bar", data: data1 });
  const matches = html.match(/class="hs-pchart-bar-rect"/g);
  assert.equal(matches.length, 3);
});

test("PrettyChart: renders gradient def", () => {
  const html = PrettyChart({ kind: "bar", data: data1 });
  assert.match(html, /<linearGradient id="hs-pchart-grad-0"/);
});

test("PrettyChart: line kind renders a path", () => {
  const html = PrettyChart({ kind: "line", data: data1 });
  assert.match(html, /<path[^>]+class="hs-pchart-line"/);
});

test("PrettyChart: x-axis labels are rendered", () => {
  const html = PrettyChart({ kind: "bar", data: data1 });
  assert.match(html, />A</);
  assert.match(html, />B</);
  assert.match(html, />C</);
});

test("PrettyChart: title rendered when given", () => {
  const html = PrettyChart({ kind: "bar", data: data1, title: "Incident Report" });
  assert.match(html, />Incident Report</);
});

test("PrettyChart: escapes labels", () => {
  const html = PrettyChart({ kind: "bar", data: { labels: ["<x>"], series: [{ name: "s", values: [1] }] } });
  assert.match(html, /&lt;x&gt;/);
});
