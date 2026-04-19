import { escape } from "../lib/html.mjs";

export function CodeBlock(props) {
  const filename = props.filename
    ? `<div class="hs-code-filename">${escape(props.filename)}</div>`
    : "";
  const hl = new Set(props.highlight || []);
  const lines = props.code.split("\n").map((line, i) => {
    const isHl = hl.has(i + 1);
    const cls = isHl ? "hs-code-line hs-code-line-hl" : "hs-code-line";
    return `<span class="${cls}">${escape(line)}</span>`;
  }).join("\n");
  return `<div class="hs-code-wrap">${filename}<pre class="hs-code hs-code-lang-${escape(props.lang)}"><code>${lines}</code></pre></div>`;
}
