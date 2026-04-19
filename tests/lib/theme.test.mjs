import { test } from "node:test";
import assert from "node:assert/strict";
import { loadTheme, listThemes, themeSwitcherHtml } from "../../plugins/hyperscribe/scripts/lib/theme.mjs";

test("listThemes: finds bundled themes", () => {
  const names = listThemes();
  assert.ok(names.includes("notion"));
});

test("loadTheme: returns CSS string for known theme", () => {
  const css = loadTheme("notion");
  assert.match(css, /\[data-theme="notion"\]/);
  assert.match(css, /--hs-color-fg/);
});

test("loadTheme: throws on unknown theme", () => {
  assert.throws(() => loadTheme("does-not-exist"), /theme/i);
});

test("themeSwitcherHtml: returns empty when <2 themes", () => {
  assert.equal(themeSwitcherHtml(["notion"], "notion"), "");
});

test("themeSwitcherHtml: renders select with all themes", () => {
  const html = themeSwitcherHtml(["notion", "notion-dark"], "notion");
  assert.match(html, /<select id="hs-theme-select">/);
  assert.match(html, /<option value="notion-dark">notion-dark<\/option>/);
  assert.match(html, /<option value="notion" selected>notion<\/option>/);
});
