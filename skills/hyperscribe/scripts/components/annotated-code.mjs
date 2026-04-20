import { escape } from "../lib/html.mjs";
import { highlightCode, languageLabel, normalizeLang } from "../lib/code-format.mjs";

function pinLabel(n, style) {
  if (style === "lettered") {
    return String.fromCharCode(64 + n); // 1 -> A, 2 -> B, ...
  }
  return String(n);
}

export function AnnotatedCode(props) {
  const lang = normalizeLang(props.lang);
  const langLabel = languageLabel(props.lang);
  const filename = props.filename
    ? `<div class="hs-annotated-code-filename">${escape(props.filename)}</div>`
    : "";
  const badge = `<span class="hs-annotated-code-badge hs-code-badge">${escape(langLabel)}</span>`;
  const meta = `<div class="hs-annotated-code-meta">${filename}${badge}</div>`;
  const pinStyle = props.pinStyle === "lettered" ? "lettered" : "numbered";
  const anns = Array.isArray(props.annotations) ? props.annotations : [];

  // Group annotations by line (1-based)
  const byLine = new Map();
  for (const a of anns) {
    const key = a.line;
    if (!byLine.has(key)) byLine.set(key, []);
    byLine.get(key).push(a);
  }

  const codeLines = String(props.code ?? "").split(/\r?\n/);
  const highlightedLines = highlightCode(props.code, lang);
  const codeBody = codeLines.map((raw, i) => {
    const lineNo = i + 1;
    const pins = (byLine.get(lineNo) || [])
      .map(a => `<span class="hs-annotated-code-pin">${escape(pinLabel(a.pin, pinStyle))}</span>`)
      .join("");
    const pinRail = `<span class="hs-annotated-code-pin-rail">${pins}</span>`;
    return `<tr class="hs-annotated-code-line"><td class="hs-annotated-code-lineno">${lineNo}</td><td class="hs-annotated-code-src">${pinRail}<pre>${highlightedLines[i] || "&nbsp;"}</pre></td></tr>`;
  }).join("");

  const notes = anns.map(a => `
<li class="hs-annotated-code-note" data-pin="${escape(String(a.pin))}">
  <span class="hs-annotated-code-pin">${escape(pinLabel(a.pin, pinStyle))}</span>
  <div class="hs-annotated-code-note-body">
    <div class="hs-annotated-code-note-title">${escape(a.title)}</div>
    <div class="hs-annotated-code-note-text">${escape(a.body)}</div>
  </div>
</li>`).join("");

  return `<div class="hs-annotated-code" data-lang="${escape(lang)}" data-pin-style="${pinStyle}">
${meta}
<div class="hs-annotated-code-grid">
  <div class="hs-annotated-code-code">
    <table><tbody>${codeBody}</tbody></table>
  </div>
  <ol class="hs-annotated-code-notes">${notes}</ol>
</div>
</div>`;
}
