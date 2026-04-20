import { escape } from "../lib/html.mjs";

function renderStep(step) {
  const tag = step.tag ? `<span class="hs-swimlane-step-tag">${escape(step.tag)}</span>` : "";
  const description = step.description
    ? `<div class="hs-swimlane-step-description">${escape(step.description)}</div>`
    : "";
  return `<article class="hs-swimlane-step" data-step-id="${escape(step.id)}">
  <div class="hs-swimlane-step-head">
    <div class="hs-swimlane-step-title">${escape(step.title)}</div>
    ${tag}
  </div>
  ${description}
</article>`;
}

export function Swimlane(props) {
  const lanes = Array.isArray(props.lanes) ? props.lanes : [];
  const steps = Array.isArray(props.steps) ? props.steps : [];
  const edges = Array.isArray(props.edges) ? props.edges : [];
  const stepById = new Map(steps.map((step) => [step.id, step]));
  const cols = Math.max(steps.length, 1);

  const laneRows = lanes.map((lane) => {
    const subtitle = lane.subtitle
      ? `<div class="hs-swimlane-lane-subtitle">${escape(lane.subtitle)}</div>`
      : "";
    const cells = steps.map((step) => {
      if (step.lane !== lane.id) {
        return `<div class="hs-swimlane-slot hs-swimlane-slot-empty" aria-hidden="true"></div>`;
      }
      return `<div class="hs-swimlane-slot">${renderStep(step)}</div>`;
    }).join("");
    return `<section class="hs-swimlane-lane" data-lane-id="${escape(lane.id)}">
  <header class="hs-swimlane-lane-head">
    <div class="hs-swimlane-lane-title">${escape(lane.title)}</div>
    ${subtitle}
  </header>
  <div class="hs-swimlane-track" style="--hs-swimlane-cols:${cols};">${cells}</div>
</section>`;
  }).join("");

  const edgeList = edges.length === 0 ? "" : `<ol class="hs-swimlane-edges">
${edges.map((edge) => {
    const from = stepById.get(edge.from)?.title || edge.from;
    const to = stepById.get(edge.to)?.title || edge.to;
    const label = edge.label ? `<span class="hs-swimlane-edge-label">${escape(edge.label)}</span>` : "";
    return `<li class="hs-swimlane-edge">${escape(from)} &rarr; ${escape(to)} ${label}</li>`;
  }).join("")}
</ol>`;

  return `<div class="hs-swimlane">
  <div class="hs-swimlane-lanes">${laneRows}</div>
  ${edgeList}
</div>`;
}
