import { escape } from "../lib/html.mjs";
import { renderMarkdown } from "../lib/markdown.mjs";

export function Section(props, renderChildren, ctx = {}) {
  const lead = props.lead
    ? `<div class="hs-section-lead">${renderMarkdown(props.lead)}</div>`
    : "";
  const title = `<h2 class="hs-section-title">${escape(props.title)}</h2>`;
  const body = `<div class="hs-section-body">${renderChildren()}</div>`;
  return `<section class="hs-section" id="${escape(props.id)}">${title}${lead}${body}</section>`;
}
