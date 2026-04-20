import { escape } from "../lib/html.mjs";
import { highlightCode, languageLabel, normalizeLang } from "../lib/code-format.mjs";

export function CodeBlock(props) {
  const label = languageLabel(props.lang);
  const lang = normalizeLang(props.lang);
  const filename = props.filename
    ? `<div class="hs-code-filename">${escape(props.filename)}</div>`
    : "";
  const badge = `<span class="hs-code-badge">${escape(label)}</span>`;
  const meta = `<div class="hs-code-meta">${filename}${badge}</div>`;
  const hl = new Set(props.highlight || []);
  const highlightedLines = highlightCode(props.code, lang);
  const lines = String(props.code ?? "").split("\n").map((_, i) => {
    const isHl = hl.has(i + 1);
    const cls = isHl ? "hs-code-line hs-code-line-hl" : "hs-code-line";
    return `<span class="${cls}"><span class="hs-code-line-no">${i + 1}</span><span class="hs-code-line-content">${highlightedLines[i] || "&nbsp;"}</span></span>`;
  }).join("");
  return `<div class="hs-code-wrap" data-lang="${escape(lang)}">${meta}<pre class="hs-code hs-code-lang-${escape(lang)}"><code>${lines}</code></pre></div>`;
}
