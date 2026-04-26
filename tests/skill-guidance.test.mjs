import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const rootSkill = readFileSync(
  new URL("../skills/hyperscribe/SKILL.md", import.meta.url),
  "utf8"
);

const pluginSkill = readFileSync(
  new URL("../plugins/hyperscribe/skills/hyperscribe/SKILL.md", import.meta.url),
  "utf8"
);

for (const [label, content] of [
  ["root skill", rootSkill],
  ["plugin skill", pluginSkill]
]) {
  test(`${label}: pushes diagram-first composition`, () => {
    assert.match(content, /one dominant visual/i);
    assert.match(content, /Do not open with long prose/i);
    assert.match(content, /Do not stack unrelated components/i);
  });

  test(`${label}: limits prose-heavy repo explainers`, () => {
    assert.match(content, /repo explainer/i);
    assert.match(content, /no more than 2 Prose blocks/i);
    assert.match(content, /at least one of `ArchitectureGrid`, `FlowChart`, `Swimlane`, `Sequence`, or `Comparison`/i);
    assert.match(content, /avoid `Comparison` as the dominant visual for repo explainers unless the source is explicitly about alternatives/i);
  });

  test(`${label}: makes repo explainers diagram-first`, () => {
    assert.match(content, /first content section should usually be diagram-led/i);
    assert.match(content, /ArchitectureGrid`, `FlowChart`, `Swimlane`, or `Sequence`/i);
    assert.match(content, /Use `FileTree`, `FileCard`, or `AnnotatedCode` as evidence surfaces instead of long explanatory prose/i);
  });

  test(`${label}: discourages overusing inline code formatting`, () => {
    assert.match(content, /Use inline code sparingly/i);
    assert.match(content, /Do not wrap every tool, noun, or phrase in backticks/i);
    assert.match(content, /No more than 1-2 inline code spans per paragraph or list item/i);
  });
}
