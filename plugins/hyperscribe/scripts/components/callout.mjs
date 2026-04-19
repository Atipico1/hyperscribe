import { escape } from "../lib/html.mjs";
import { renderMarkdown } from "../lib/markdown.mjs";

export function Callout(props) {
  const sev = props.severity;
  const title = props.title
    ? `<div class="hs-callout-title">${escape(props.title)}</div>`
    : "";
  const body = `<div class="hs-callout-body">${renderMarkdown(props.body)}</div>`;
  return `<aside class="hs-callout hs-callout-${sev}">${title}${body}</aside>`;
}
