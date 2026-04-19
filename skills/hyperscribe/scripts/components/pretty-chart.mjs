import { escape } from "../lib/html.mjs";

const W = 480, H = 320;
const PAD_L = 44, PAD_R = 16, PAD_T = 48, PAD_B = 60;
const PLOT_W = W - PAD_L - PAD_R;
const PLOT_H = H - PAD_T - PAD_B;

const GRADIENT_STOPS = [
  ["#6d28d9", "#7c3aed"],
  ["#7c3aed", "#a855f7"],
  ["#14b8a6", "#5eead4"],
  ["#d946ef", "#f0abfc"],
  ["#3b82f6", "#60a5fa"],
  ["#6366f1", "#818cf8"],
  ["#22d3ee", "#67e8f9"]
];

function niceMax(v) {
  if (v <= 0) return 10;
  const e = Math.pow(10, Math.floor(Math.log10(v)));
  const n = v / e;
  return (n <= 1 ? 1 : n <= 2 ? 2 : n <= 5 ? 5 : 10) * e;
}

function gradientDefs(seriesCount) {
  let defs = `<filter id="hs-pchart-shadow" x="-20%" y="-20%" width="140%" height="140%">
    <feGaussianBlur in="SourceAlpha" stdDeviation="6"/>
    <feOffset dx="0" dy="3" result="off"/>
    <feComponentTransfer><feFuncA type="linear" slope="0.25"/></feComponentTransfer>
    <feMerge><feMergeNode/><feMergeNode in="SourceGraphic"/></feMerge>
  </filter>`;
  const count = Math.max(seriesCount, GRADIENT_STOPS.length);
  for (let i = 0; i < count; i++) {
    const [a, b] = GRADIENT_STOPS[i % GRADIENT_STOPS.length];
    defs += `<linearGradient id="hs-pchart-grad-${i}" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="${b}"/><stop offset="100%" stop-color="${a}"/>
    </linearGradient>`;
  }
  return `<defs>${defs}</defs>`;
}

function gridAndYTicks(max) {
  const rows = 5;
  let g = "";
  for (let i = 0; i <= rows; i++) {
    const y = PAD_T + (PLOT_H * i) / rows;
    const val = max * (1 - i / rows);
    g += `<line x1="${PAD_L}" y1="${y}" x2="${W - PAD_R}" y2="${y}" class="hs-pchart-grid"/>`;
    g += `<text x="${PAD_L - 8}" y="${y + 4}" text-anchor="end" class="hs-pchart-tick">${val.toFixed(max < 10 ? 1 : 0)}</text>`;
  }
  return g;
}

function xLabels(labels) {
  const step = PLOT_W / labels.length;
  return labels.map((lbl, i) => {
    const x = PAD_L + step * (i + 0.5);
    const y = H - PAD_B + 18;
    return `<text x="${x}" y="${y}" text-anchor="end" transform="rotate(-40 ${x} ${y})" class="hs-pchart-xlabel">${escape(lbl)}</text>`;
  }).join("");
}

function renderBar(data) {
  const series = data.series[0]; // v0.3: single series for bar
  const labels = data.labels;
  const max = niceMax(Math.max(...series.values, 1));
  const step = PLOT_W / labels.length;
  const barW = Math.min(step * 0.6, 36);
  let bars = "";
  series.values.forEach((v, i) => {
    const h = (v / max) * PLOT_H;
    const x = PAD_L + step * (i + 0.5) - barW / 2;
    const y = PAD_T + PLOT_H - h;
    bars += `<rect x="${x}" y="${y}" width="${barW}" height="${h}" rx="4" class="hs-pchart-bar-rect" fill="url(#hs-pchart-grad-${i % GRADIENT_STOPS.length})" filter="url(#hs-pchart-shadow)"/>`;
  });
  return { max, body: bars };
}

function renderLine(data) {
  const labels = data.labels;
  const allVals = data.series.flatMap(s => s.values);
  const max = niceMax(Math.max(...allVals, 1));
  const step = PLOT_W / (labels.length - 1 || 1);
  let out = "";
  data.series.forEach((s, sIdx) => {
    const pts = s.values.map((v, i) => {
      const x = PAD_L + step * i;
      const y = PAD_T + PLOT_H - (v / max) * PLOT_H;
      return `${x},${y}`;
    });
    out += `<path d="M${pts.join(" L")}" class="hs-pchart-line" stroke="url(#hs-pchart-grad-${sIdx % GRADIENT_STOPS.length})" filter="url(#hs-pchart-shadow)"/>`;
    s.values.forEach((v, i) => {
      const x = PAD_L + step * i;
      const y = PAD_T + PLOT_H - (v / max) * PLOT_H;
      out += `<circle cx="${x}" cy="${y}" r="3.5" class="hs-pchart-dot" fill="url(#hs-pchart-grad-${sIdx % GRADIENT_STOPS.length})"/>`;
    });
  });
  return { max, body: out };
}

export function PrettyChart(props) {
  if (!props || !props.kind) throw new Error("PrettyChart: 'kind' is required");
  if (!props.data || !Array.isArray(props.data.labels) || !Array.isArray(props.data.series)) {
    throw new Error("PrettyChart: 'data' with 'labels' and 'series' is required");
  }
  const kind = props.kind;
  const data = props.data;
  const { max, body } = kind === "line" ? renderLine(data) : renderBar(data);
  const titleEl = props.title ? `<text x="${PAD_L}" y="28" class="hs-pchart-title">${escape(props.title)}</text>` : "";
  return `<div class="hs-pchart hs-pchart-${escape(kind)} hs-zoomable">
<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" preserveAspectRatio="xMidYMid meet">
${gradientDefs(data.series.length)}
${titleEl}
${gridAndYTicks(max)}
${body}
${xLabels(data.labels)}
</svg>
</div>`;
}
