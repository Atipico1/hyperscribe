import { escape } from "../lib/html.mjs";
import { renderMarkdown } from "../lib/markdown.mjs";

const INDICATORS = { done: "✓", doing: "●", skipped: "○" };

function renderStep(step, index, numbered) {
  const stateClass = step.state ? ` hs-step-${step.state}` : "";
  const indexChip = numbered
    ? `<span class="hs-step-index">${index + 1}</span>`
    : "";
  const indicator = INDICATORS[step.state]
    ? `<span class="hs-step-indicator" aria-label="${step.state}">${INDICATORS[step.state]}</span>`
    : "";
  const meta = (indexChip || indicator)
    ? `<div class="hs-step-meta">${indexChip}${indicator}</div>`
    : "";
  return `<li class="hs-step${stateClass}">${meta}<div class="hs-step-content"><div class="hs-step-title">${escape(step.title)}</div><div class="hs-step-body">${renderMarkdown(step.body)}</div></div></li>`;
}

export function StepList(props) {
  const numbered = props.numbered !== false;
  const tag = numbered ? "ol" : "ul";
  const classes = numbered ? "hs-steps hs-steps-numbered" : "hs-steps";
  const items = (props.steps || []).map((step, index) => renderStep(step, index, numbered)).join("");
  return `<${tag} class="${classes}">${items}</${tag}>`;
}
