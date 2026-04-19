import { test } from "node:test";
import assert from "node:assert/strict";
import { loadTheme, listThemes, modeTogglerHtml } from "../../plugins/hyperscribe/scripts/lib/theme.mjs";

test("listThemes: finds all four bundled themes", () => {
  const names = listThemes();
  for (const n of ["studio", "midnight", "void", "gallery"]) {
    assert.ok(names.includes(n), `missing theme ${n}`);
  }
});

test("loadTheme: returns CSS string for known theme", () => {
  const css = loadTheme("studio");
  assert.match(css, /\[data-theme="studio"\]/);
  assert.match(css, /--hs-color-fg/);
});

test("loadTheme: studio theme exposes tone + surface variables", () => {
  const css = loadTheme("studio");
  assert.match(css, /--hs-color-surface:/);
  assert.match(css, /--hs-tone-success-bg:/);
  assert.match(css, /--hs-tone-danger-fg:/);
});

test("loadTheme: studio theme defines a [data-mode=\"dark\"] override block", () => {
  const css = loadTheme("studio");
  assert.match(css, /\[data-theme="studio"\]\[data-mode="dark"\]/);
});

test("loadTheme: midnight theme defines both light (default) and dark", () => {
  const css = loadTheme("midnight");
  assert.match(css, /\[data-theme="midnight"\]\s*\{/);
  assert.match(css, /\[data-theme="midnight"\]\[data-mode="dark"\]/);
});

test("loadTheme: void theme defines both light and dark", () => {
  const css = loadTheme("void");
  assert.match(css, /\[data-theme="void"\]\s*\{/);
  assert.match(css, /\[data-theme="void"\]\[data-mode="dark"\]/);
});

test("loadTheme: gallery theme defines both light and dark", () => {
  const css = loadTheme("gallery");
  assert.match(css, /\[data-theme="gallery"\]\s*\{/);
  assert.match(css, /\[data-theme="gallery"\]\[data-mode="dark"\]/);
});

test("loadTheme: throws on unknown theme", () => {
  assert.throws(() => loadTheme("does-not-exist"), /theme/i);
});

test("loadTheme: old names notion/linear no longer resolve", () => {
  assert.throws(() => loadTheme("notion"), /Unknown theme/);
  assert.throws(() => loadTheme("linear"), /Unknown theme/);
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
