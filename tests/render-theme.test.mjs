import { test } from "node:test";
import assert from "node:assert/strict";
import { render } from "../plugins/hyperscribe/scripts/render.mjs";

const envelope = {
  a2ui_version: "0.9",
  catalog: "hyperscribe/v1",
  is_task_complete: true,
  parts: [{ component: "hyperscribe/Page", props: { title: "t" }, children: [] }]
};

test("render: default theme notion applied", async () => {
  const html = await render(envelope);
  assert.match(html, /\[data-theme="notion"\]/);
  assert.match(html, /data-theme="notion"/); // also as html attribute
});

test("render: --theme name picked up via options.theme", async () => {
  const html = await render(envelope, { theme: "notion" });
  assert.match(html, /data-theme="notion"/);
});

test("render: linear theme applied", async () => {
  const html = await render(envelope, { theme: "linear" });
  assert.match(html, /data-theme="linear"/);
  assert.match(html, /\[data-theme="linear"\]/);
});

test("render: mode toggler always injected regardless of theme", async () => {
  const notionHtml = await render(envelope, { theme: "notion" });
  const linearHtml = await render(envelope, { theme: "linear" });
  assert.match(notionHtml, /id="hs-mode-toggler"/);
  assert.match(linearHtml, /id="hs-mode-toggler"/);
});

test("render: unknown theme throws", async () => {
  await assert.rejects(() => render(envelope, { theme: "nope" }), /theme/i);
});
