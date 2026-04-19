import { test } from "node:test";
import assert from "node:assert/strict";
import { loadTheme, listThemes, modeTogglerHtml } from "../../plugins/hyperscribe/scripts/lib/theme.mjs";

test("listThemes: finds bundled themes", () => {
  const names = listThemes();
  assert.ok(names.includes("notion"));
  assert.ok(names.includes("linear"));
});

test("loadTheme: returns CSS string for known theme", () => {
  const css = loadTheme("notion");
  assert.match(css, /\[data-theme="notion"\]/);
  assert.match(css, /--hs-color-fg/);
});

test("loadTheme: notion theme exposes tone + surface variables", () => {
  const css = loadTheme("notion");
  assert.match(css, /--hs-color-surface:/);
  assert.match(css, /--hs-tone-success-bg:/);
  assert.match(css, /--hs-tone-danger-fg:/);
});

test("loadTheme: notion theme defines a [data-mode=\"dark\"] override block", () => {
  const css = loadTheme("notion");
  assert.match(css, /\[data-theme="notion"\]\[data-mode="dark"\]/);
});

test("loadTheme: linear theme defines both light (default) and dark", () => {
  const css = loadTheme("linear");
  assert.match(css, /\[data-theme="linear"\]\s*\{/);
  assert.match(css, /\[data-theme="linear"\]\[data-mode="dark"\]/);
});

test("loadTheme: throws on unknown theme", () => {
  assert.throws(() => loadTheme("does-not-exist"), /theme/i);
});

test("modeTogglerHtml: emits a single toggle button + init script", () => {
  const html = modeTogglerHtml();
  assert.match(html, /<button[^>]+class="hs-mode-toggler"/);
  assert.match(html, /id="hs-mode-toggler"/);
  assert.match(html, /aria-label="Toggle light\/dark mode"/);
  assert.match(html, /hs-mode-icon-sun/);
  assert.match(html, /hs-mode-icon-moon/);
  assert.match(html, /hyperscribe\.mode/);
});

test("modeTogglerHtml: respects prefers-color-scheme on first load", () => {
  const html = modeTogglerHtml();
  assert.match(html, /prefers-color-scheme: dark/);
});
