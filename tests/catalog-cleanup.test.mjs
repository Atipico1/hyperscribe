import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const catalog = JSON.parse(
  readFileSync(new URL("../plugins/hyperscribe/spec/catalog.json", import.meta.url), "utf8")
);

test("catalog cleanup: removed components are absent from the default catalog", () => {
  for (const name of [
    "hyperscribe/PrettyChart",
    "hyperscribe/Pyramid",
    "hyperscribe/Dashboard",
    "hyperscribe/Timeline"
  ]) {
    assert.equal(name in catalog.components, false, `${name} should not be in catalog`);
  }
});

test("render registry cleanup: removed components and dashboard nested-child special case are gone", () => {
  const renderSource = readFileSync(
    new URL("../plugins/hyperscribe/scripts/render.mjs", import.meta.url),
    "utf8"
  );

  assert.doesNotMatch(renderSource, /PrettyChart/);
  assert.doesNotMatch(renderSource, /Pyramid/);
  assert.doesNotMatch(renderSource, /Dashboard/);
  assert.doesNotMatch(renderSource, /Timeline/);
  assert.doesNotMatch(renderSource, /panels\[\]\.child/);
});

test("main hyperscribe skill: slide components are documented as slide-mode-only", () => {
  const skill = readFileSync(
    new URL("../plugins/hyperscribe/skills/hyperscribe/SKILL.md", import.meta.url),
    "utf8"
  );

  assert.match(skill, /slide-mode-only/i);
  assert.match(skill, /\/hyperscribe:slides/);
});

test("reference catalog: separates default components from slide-only components", () => {
  const reference = readFileSync(
    new URL("../plugins/hyperscribe/references/catalog.md", import.meta.url),
    "utf8"
  );

  assert.match(reference, /Slide Mode Only/i);
  assert.doesNotMatch(reference, /### `hyperscribe\/PrettyChart`/);
  assert.doesNotMatch(reference, /### `hyperscribe\/Pyramid`/);
  assert.doesNotMatch(reference, /### `hyperscribe\/Dashboard`/);
  assert.doesNotMatch(reference, /### `hyperscribe\/Timeline`/);
});
