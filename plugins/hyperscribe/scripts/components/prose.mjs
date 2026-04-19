import { renderMarkdown } from "../lib/markdown.mjs";

export function Prose(props) {
  return `<div class="hs-prose">${renderMarkdown(props.markdown)}</div>`;
}
