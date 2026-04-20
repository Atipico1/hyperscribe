import { escape } from "../lib/html.mjs";

function diffLines(before, after) {
  const b = before === "" ? [] : before.split("\n");
  const a = after === "" ? [] : after.split("\n");
  const bSet = new Set(b);
  const aSet = new Set(a);
  const out = [];
  let i = 0, j = 0;
  while (i < b.length || j < a.length) {
    const bl = i < b.length ? b[i] : null;
    const al = j < a.length ? a[j] : null;
    if (bl !== null && al !== null && bl === al) {
      out.push({ kind: "context", text: bl });
      i++; j++;
    } else if (bl !== null && (al === null || !aSet.has(bl))) {
      out.push({ kind: "remove", text: bl });
      i++;
    } else if (al !== null && (bl === null || !bSet.has(al))) {
      out.push({ kind: "add", text: al });
      j++;
    } else {
      // Fallback: advance both
      if (bl !== null) { out.push({ kind: "remove", text: bl }); i++; }
      if (al !== null) { out.push({ kind: "add", text: al }); j++; }
    }
  }
  return out;
}

function renderLine(line) {
  const marker = line.kind === "add" ? "+" : line.kind === "remove" ? "-" : " ";
  const cls = `hs-diff-line hs-diff-${line.kind}`;
  return `<span class="${cls}"><span class="hs-diff-marker">${marker}</span>${escape(line.text)}</span>`;
}

function renderHunk(hunk) {
  const header = typeof hunk.atLine === "number"
    ? `<div class="hs-diff-hunk-header">@@ line ${hunk.atLine}</div>`
    : "";
  const lines = diffLines(hunk.before, hunk.after).map(renderLine).join("");
  return `<div class="hs-diff-hunk">${header}<pre class="hs-diff-pre"><code>${lines}</code></pre></div>`;
}

export function CodeDiff(props) {
  const hunks = (props.hunks || []).map(renderHunk).join("");
  return `<div class="hs-diff hs-diff-lang-${escape(props.lang)}"><div class="hs-diff-filename">${escape(props.filename)}</div>${hunks}</div>`;
}
