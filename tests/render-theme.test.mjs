import { test } from "node:test";
import assert from "node:assert/strict";
import { render } from "../plugins/hyperscribe/scripts/render.mjs";

const envelope = {
  a2ui_version: "0.9",
  catalog: "hyperscribe/v1",
  is_task_complete: true,
  parts: [{ component: "hyperscribe/Page", props: { title: "t" }, children: [] }]
};

test("render: default theme is studio", async () => {
  const html = await render(envelope);
  assert.match(html, /data-theme="studio"/);
  assert.match(html, /\[data-theme="studio"\]/);
});

for (const name of ["studio", "midnight", "void", "gallery"]) {
  test(`render: --theme ${name} applied`, async () => {
    const html = await render(envelope, { theme: name });
    assert.match(html, new RegExp(`data-theme="${name}"`));
    assert.match(html, new RegExp(`\\[data-theme="${name}"\\]`));
  });
}

test("render: mode toggler always injected", async () => {
  const html = await render(envelope, { theme: "studio" });
  assert.match(html, /id="hs-mode-toggler"/);
});

test("render: unknown theme throws", async () => {
  await assert.rejects(() => render(envelope, { theme: "nope" }), /theme/i);
});

test("render: old theme name notion throws with clear error", async () => {
  await assert.rejects(() => render(envelope, { theme: "notion" }), /Unknown theme/);
});

test("render: old theme name linear throws with clear error", async () => {
  await assert.rejects(() => render(envelope, { theme: "linear" }), /Unknown theme/);
});
