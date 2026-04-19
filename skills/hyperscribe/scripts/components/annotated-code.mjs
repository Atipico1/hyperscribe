import { escape } from "../lib/html.mjs";

function pinLabel(n, style) {
  if (style === "lettered") {
    return String.fromCharCode(64 + n); // 1 -> A, 2 -> B, ...
  }
  return String(n);
}

export function AnnotatedCode(props) {
  const lang = escape(props.lang || "text");
  const filename = props.filename
    ? `<div class="hs-annotated-code-filename">${escape(props.filename)}</div>`
    : "";
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
  const codeBody = codeLines.map((raw, i) => {
    const lineNo = i + 1;
    const pins = (byLine.get(lineNo) || [])
      .map(a => `<span class="hs-annotated-code-pin">${escape(pinLabel(a.pin, pinStyle))}</span>`)
      .join("");
    return `<tr class="hs-annotated-code-line"><td class="hs-annotated-code-lineno">${lineNo}</td><td class="hs-annotated-code-src"><pre>${escape(raw)}</pre>${pins}</td></tr>`;
  }).join("");

  const notes = anns.map(a => `
<li class="hs-annotated-code-note" data-pin="${a.pin}">
  <span class="hs-annotated-code-pin">${escape(pinLabel(a.pin, pinStyle))}</span>
  <div class="hs-annotated-code-note-body">
    <div class="hs-annotated-code-note-title">${escape(a.title)}</div>
    <div class="hs-annotated-code-note-text">${escape(a.body)}</div>
  </div>
</li>`).join("");

  return `<div class="hs-annotated-code" data-lang="${lang}" data-pin-style="${pinStyle}">
${filename}
<div class="hs-annotated-code-grid">
  <div class="hs-annotated-code-code">
    <table><tbody>${codeBody}</tbody></table>
  </div>
  <ol class="hs-annotated-code-notes">${notes}</ol>
</div>
</div>`;
}
