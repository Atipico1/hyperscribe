import { escape } from "../lib/html.mjs";

const MARGIN_X = 24;
const COL_W = 180;
const HEADER_H = 56;
const HEADER_PAD = 12;
const FOOTER_H = 56;
const PAD_TOP = 28;
const PAD_BOTTOM = 28;
const MSG_H = 54;
const SELF_H = 64;
const NOTE_H = 48;

function xFor(i) {
  return MARGIN_X + COL_W * i + COL_W / 2;
}

function measureHeights(messages) {
  const ys = [];
  let y = HEADER_H + PAD_TOP;
  for (const m of messages) {
    ys.push(y);
    const kind = m.kind || "sync";
    if (kind === "self") y += SELF_H;
    else if (kind === "note") y += NOTE_H;
    else y += MSG_H;
  }
  return { ys, bodyBottom: y + PAD_BOTTOM };
}

function renderMessage(m, y, pIdx, participantCount) {
  const kind = m.kind || "sync";
  if (kind === "note") {
    const over = Array.isArray(m.over) ? m.over : (m.over ? [m.over] : []);
    const xs = over.map(id => pIdx[id]).filter(i => i !== undefined).map(xFor);
    if (xs.length === 0) return "";
    const left = Math.min(...xs) - 84;
    const right = Math.max(...xs) + 84;
    const bodyY = y + 6;
    const bodyH = NOTE_H - 16;
    return `<g class="hs-seq-note">
      <rect x="${left}" y="${bodyY}" width="${right - left}" height="${bodyH}" rx="4" class="hs-seq-note-box"/>
      <text x="${(left + right) / 2}" y="${bodyY + bodyH / 2 + 4}" text-anchor="middle" class="hs-seq-note-text">${escape(m.text)}</text>
    </g>`;
  }
  if (kind === "self") {
    if (pIdx[m.from] === undefined) return "";
    const x = xFor(pIdx[m.from]);
    const loopTop = y + 16;
    const loopBottom = y + 46;
    return `<g class="hs-seq-msg" data-kind="self">
      <text x="${x + 8}" y="${y + 12}" class="hs-seq-msg-text">${escape(m.text)}</text>
      <path d="M${x},${loopTop} C${x + 64},${loopTop} ${x + 64},${loopBottom} ${x + 4},${loopBottom}" fill="none" class="hs-seq-arrow" marker-end="url(#hsSeqFilled)"/>
    </g>`;
  }
  if (pIdx[m.from] === undefined || pIdx[m.to] === undefined) return "";
  const x1 = xFor(pIdx[m.from]);
  const x2 = xFor(pIdx[m.to]);
  const cx = (x1 + x2) / 2;
  const dashed = kind === "async" || kind === "return";
  const marker = kind === "return" ? "url(#hsSeqOpen)" : "url(#hsSeqFilled)";
  const arrowY = y + 30;
  return `<g class="hs-seq-msg" data-kind="${escape(kind)}">
    <text x="${cx}" y="${y + 18}" text-anchor="middle" class="hs-seq-msg-text">${escape(m.text)}</text>
    <line x1="${x1}" y1="${arrowY}" x2="${x2}" y2="${arrowY}" class="hs-seq-arrow${dashed ? " hs-seq-arrow-dashed" : ""}" marker-end="${marker}"/>
  </g>`;
}

export function Sequence(props) {
  const participants = props.participants || [];
  const messages = props.messages || [];
  const pIdx = {};
  participants.forEach((p, i) => { pIdx[p.id] = i; });

  const { ys, bodyBottom } = measureHeights(messages);
  const totalW = MARGIN_X * 2 + COL_W * participants.length;
  const totalH = bodyBottom + FOOTER_H;

  const defs = `<defs>
    <marker id="hsSeqFilled" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto">
      <path d="M0,0 L10,5 L0,10 Z" class="hs-seq-head"/>
    </marker>
    <marker id="hsSeqOpen" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto">
      <path d="M0,0 L10,5 L0,10" fill="none" class="hs-seq-head-open"/>
    </marker>
  </defs>`;

  let cols = "";
  participants.forEach((p, i) => {
    const cx = xFor(i);
    const x = MARGIN_X + COL_W * i + HEADER_PAD;
    const w = COL_W - HEADER_PAD * 2;
    const headerTitleY = p.subtitle ? 26 : 32;
    const footerTitleY = bodyBottom + 4 + (p.subtitle ? 20 : 26);
    cols += `<g class="hs-seq-col">
      <rect x="${x}" y="8" width="${w}" height="${HEADER_H - HEADER_PAD}" rx="8" class="hs-seq-pbox"/>
      <text x="${cx}" y="${headerTitleY}" text-anchor="middle" class="hs-seq-ptitle">${escape(p.title)}</text>
      ${p.subtitle ? `<text x="${cx}" y="42" text-anchor="middle" class="hs-seq-psub">${escape(p.subtitle)}</text>` : ""}
      <line x1="${cx}" y1="${HEADER_H}" x2="${cx}" y2="${bodyBottom}" class="hs-seq-lifeline"/>
      <rect x="${x}" y="${bodyBottom + 4}" width="${w}" height="${FOOTER_H - HEADER_PAD}" rx="8" class="hs-seq-pbox"/>
      <text x="${cx}" y="${footerTitleY}" text-anchor="middle" class="hs-seq-ptitle">${escape(p.title)}</text>
      ${p.subtitle ? `<text x="${cx}" y="${bodyBottom + 38}" text-anchor="middle" class="hs-seq-psub">${escape(p.subtitle)}</text>` : ""}
    </g>`;
  });

  let msgs = "";
  messages.forEach((m, idx) => {
    msgs += renderMessage(m, ys[idx], pIdx, participants.length);
  });

  return `<div class="hs-seq-wrap">
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${totalW} ${totalH}" class="hs-seq" preserveAspectRatio="xMidYMid meet">
${defs}
${cols}
${msgs}
</svg>
</div>`;
}
