import { escape } from "../lib/html.mjs";

function clampPercent(value) {
  const n = Number(value);
  if (!Number.isFinite(n)) return 0;
  return Math.max(0, Math.min(100, n));
}

function toneClass(tone) {
  switch (tone) {
    case "accent":
    case "success":
    case "warn":
    case "muted":
      return ` hs-quadrant-point-${tone}`;
    default:
      return "";
  }
}

export function Quadrant(props) {
  const quadrants = Array.isArray(props.quadrants) ? props.quadrants.slice(0, 4) : [];
  const points = Array.isArray(props.points) ? props.points : [];

  const quadrantCells = quadrants.map((quadrant, index) => {
    const description = quadrant.description
      ? `<div class="hs-quadrant-description">${escape(quadrant.description)}</div>`
      : "";
    return `<article class="hs-quadrant-cell hs-quadrant-cell-q${index + 1}" data-quadrant-id="${escape(quadrant.id || `q${index + 1}`)}">
  <div class="hs-quadrant-title">${escape(quadrant.title || `Quadrant ${index + 1}`)}</div>
  ${description}
</article>`;
  }).join("");

  const pointMarkers = points.map((point) => {
    const tag = point.tag ? `<span class="hs-quadrant-point-tag">${escape(point.tag)}</span>` : "";
    const x = clampPercent(point.x);
    const y = clampPercent(point.y);
    return `<div class="hs-quadrant-point${toneClass(point.tone)}" style="--hs-quadrant-x:${x}%; --hs-quadrant-y:${y}%;">
  <span class="hs-quadrant-point-dot"></span>
  <span class="hs-quadrant-point-label">${escape(point.label)}${tag}</span>
</div>`;
  }).join("");

  return `<figure class="hs-quadrant">
  <div class="hs-quadrant-plot">
    <div class="hs-quadrant-axis hs-quadrant-axis-y">${escape(props.yLabel || "Y")}</div>
    <div class="hs-quadrant-axis hs-quadrant-axis-x">${escape(props.xLabel || "X")}</div>
    <div class="hs-quadrant-grid">${quadrantCells}</div>
    <div class="hs-quadrant-points">${pointMarkers}</div>
  </div>
</figure>`;
}
