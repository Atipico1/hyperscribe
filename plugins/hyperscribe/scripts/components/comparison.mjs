import { escape } from "../lib/html.mjs";

function renderItem(item) {
  const subtitle = item.subtitle ? `<div class="hs-compare-subtitle">${escape(item.subtitle)}</div>` : "";
  const bullets = Array.isArray(item.bullets) && item.bullets.length > 0
    ? `<ul class="hs-compare-bullets">${item.bullets.map(b => `<li>${escape(b)}</li>`).join("")}</ul>`
    : "";
  const verdict = item.verdict
    ? `<div class="hs-compare-verdict hs-compare-verdict-${escape(item.verdict.tone)}">${escape(item.verdict.label)}</div>`
    : "";
  return `<article class="hs-compare-item"><div class="hs-compare-head"><div class="hs-compare-title">${escape(item.title)}</div>${subtitle}</div>${bullets}${verdict}</article>`;
}

export function Comparison(props) {
  const items = (props.items || []).map(renderItem).join("");
  return `<div class="hs-compare hs-compare-${props.mode}">${items}</div>`;
}
