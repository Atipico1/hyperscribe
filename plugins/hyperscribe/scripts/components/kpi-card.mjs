import { escape } from "../lib/html.mjs";

const DELTA_ICON = { up: "↑", down: "↓", flat: "→" };

export function KPICard(props) {
  const delta = props.delta
    ? `<div class="hs-kpi-delta hs-kpi-delta-${props.delta.direction}"><span class="hs-kpi-delta-icon">${DELTA_ICON[props.delta.direction] || "→"}</span>${escape(props.delta.value)}</div>`
    : "";
  const hint = props.hint ? `<div class="hs-kpi-hint">${escape(props.hint)}</div>` : "";
  return `<article class="hs-kpi"><div class="hs-kpi-label">${escape(props.label)}</div><div class="hs-kpi-value">${escape(props.value)}</div>${delta}${hint}</article>`;
}
