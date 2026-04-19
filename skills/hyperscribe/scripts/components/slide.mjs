import { escape } from "../lib/html.mjs";

function renderBullets(bullets) {
  if (!Array.isArray(bullets) || bullets.length === 0) return "";
  return `<ul class="hs-slide-bullets">${bullets.map(b => `<li>${escape(b)}</li>`).join("")}</ul>`;
}

function renderTwoColBullets(bullets) {
  if (!Array.isArray(bullets) || bullets.length === 0) return "";
  const mid = Math.ceil(bullets.length / 2);
  const left = bullets.slice(0, mid);
  const right = bullets.slice(mid);
  return `<div class="hs-slide-col">${renderBullets(left)}</div><div class="hs-slide-col">${renderBullets(right)}</div>`;
}

function body(props) {
  switch (props.layout) {
    case "title":
      return `<h1 class="hs-slide-title-text">${escape(props.title || "")}</h1>${props.subtitle ? `<p class="hs-slide-subtitle">${escape(props.subtitle)}</p>` : ""}`;
    case "content":
      return `<h2 class="hs-slide-heading">${escape(props.title || "")}</h2>${renderBullets(props.bullets)}`;
    case "two-col":
      return `<h2 class="hs-slide-heading">${escape(props.title || "")}</h2><div class="hs-slide-cols">${renderTwoColBullets(props.bullets)}</div>`;
    case "quote":
      return `<blockquote class="hs-slide-quote">${escape(props.quote || "")}</blockquote>${props.subtitle ? `<cite class="hs-slide-attrib">${escape(props.subtitle)}</cite>` : ""}`;
    case "image":
      return `<h2 class="hs-slide-heading">${escape(props.title || "")}</h2>${props.image ? `<img class="hs-slide-image" src="${escape(props.image)}" alt="${escape(props.title || "")}">` : ""}${props.subtitle ? `<p class="hs-slide-caption">${escape(props.subtitle)}</p>` : ""}`;
    case "section":
      return `<h1 class="hs-slide-section-title">${escape(props.title || "")}</h1>${props.subtitle ? `<p class="hs-slide-subtitle">${escape(props.subtitle)}</p>` : ""}`;
    default:
      return "";
  }
}

export function Slide(props) {
  return `<article class="hs-slide hs-slide-${props.layout}">${body(props)}</article>`;
}
