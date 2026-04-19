export function Dashboard(props, renderChildren, ctx) {
  const panels = (props.panels || []).map(p => {
    const rendered = ctx && typeof ctx.renderNode === "function"
      ? ctx.renderNode(p.child)
      : "";
    return `<div class="hs-dashboard-panel hs-dashboard-span-${p.span}">${rendered}</div>`;
  }).join("");
  return `<div class="hs-dashboard">${panels}</div>`;
}
