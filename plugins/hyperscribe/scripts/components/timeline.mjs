import { escape } from "../lib/html.mjs";
import { renderMarkdown } from "../lib/markdown.mjs";

function renderItem(item) {
  const tag = item.tag ? `<span class="hs-timeline-tag">${escape(item.tag)}</span>` : "";
  const body = item.body ? `<div class="hs-timeline-body">${renderMarkdown(item.body)}</div>` : "";
  return `<li class="hs-timeline-item"><time class="hs-timeline-when">${escape(item.when)}</time><div class="hs-timeline-content"><div class="hs-timeline-head"><div class="hs-timeline-title">${escape(item.title)}</div>${tag}</div>${body}</div></li>`;
}

export function Timeline(props) {
  const items = (props.items || []).map(renderItem).join("");
  return `<ol class="hs-timeline hs-timeline-${props.orientation}">${items}</ol>`;
}
