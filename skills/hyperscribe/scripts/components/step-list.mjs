import { escape } from "../lib/html.mjs";
import { renderMarkdown } from "../lib/markdown.mjs";

const INDICATORS = { done: "✓", doing: "●", skipped: "○" };

function renderStep(step) {
  const stateClass = step.state ? ` hs-step-${step.state}` : "";
  const indicator = INDICATORS[step.state]
    ? `<span class="hs-step-indicator" aria-label="${step.state}">${INDICATORS[step.state]}</span>`
    : "";
  return `<li class="hs-step${stateClass}">${indicator}<div class="hs-step-content"><div class="hs-step-title">${escape(step.title)}</div><div class="hs-step-body">${renderMarkdown(step.body)}</div></div></li>`;
}

export function StepList(props) {
  const numbered = props.numbered !== false;
  const tag = numbered ? "ol" : "ul";
  const classes = numbered ? "hs-steps hs-steps-numbered" : "hs-steps";
  const items = (props.steps || []).map(renderStep).join("");
  return `<${tag} class="${classes}">${items}</${tag}>`;
}
