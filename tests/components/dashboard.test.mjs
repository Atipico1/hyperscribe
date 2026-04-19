import { test } from "node:test";
import assert from "node:assert/strict";
import { Dashboard } from "../../plugins/hyperscribe/scripts/components/dashboard.mjs";

const fakeCtx = {
  renderNode: (node) => `<mock>${node.component}:${node.props?.label || node.props?.value || ""}</mock>`
};

test("Dashboard: wraps in hs-dashboard 12-col grid", () => {
  const html = Dashboard({ panels: [] }, () => "", fakeCtx);
  assert.match(html, /<div class="hs-dashboard"/);
});

test("Dashboard: renders each panel with span class", () => {
  const html = Dashboard({
    panels: [
      { span: 2, child: { component: "hyperscribe/KPICard", props: { label: "A" } } },
      { span: 4, child: { component: "hyperscribe/Chart", props: { value: "B" } } }
    ]
  }, () => "", fakeCtx);
  assert.match(html, /<div class="hs-dashboard-panel hs-dashboard-span-2">[^<]*<mock>hyperscribe\/KPICard:A<\/mock>/);
  assert.match(html, /<div class="hs-dashboard-panel hs-dashboard-span-4">[^<]*<mock>hyperscribe\/Chart:B<\/mock>/);
});

test("Dashboard: empty panels array renders empty grid", () => {
  const html = Dashboard({ panels: [] }, () => "", fakeCtx);
  assert.match(html, /<div class="hs-dashboard"><\/div>/);
});

test("Dashboard: delegates child rendering to ctx.renderNode", () => {
  let seenNode = null;
  const captureCtx = { renderNode: (n) => { seenNode = n; return "x"; }};
  const child = { component: "hyperscribe/Callout", props: { severity: "info", body: "hi" } };
  Dashboard({ panels: [{ span: 1, child }] }, () => "", captureCtx);
  assert.deepEqual(seenNode, child);
});
