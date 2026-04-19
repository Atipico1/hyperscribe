import { escape } from "../lib/html.mjs";

const MIN_NODE_W = 140;
const NODE_H = 44;
const RANK_GAP = 80;
const LANE_GAP = 28;
const PAD = 20;
const CHAR_W = 7.8;       // approx char width at 13px font
const LABEL_PAD_H = 20;   // horizontal padding inside node
const MAX_NODE_W = 280;   // upper cap so one absurdly long label doesn't blow up all columns

function estimateLabelWidth(label) {
  const len = String(label || "").length;
  return Math.ceil(len * CHAR_W + LABEL_PAD_H * 2);
}

function layoutCoords(layout, ranks, nodeW) {
  const maxLane = Math.max(...ranks.map(r => r.length));
  const coords = {};
  ranks.forEach((rank, rIdx) => {
    rank.forEach((id, lIdx) => {
      if (layout === "LR") {
        coords[id] = {
          x: PAD + rIdx * (nodeW + RANK_GAP),
          y: PAD + lIdx * (NODE_H + LANE_GAP) + (maxLane - rank.length) * (NODE_H + LANE_GAP) / 2
        };
      } else {
        coords[id] = {
          x: PAD + lIdx * (nodeW + LANE_GAP) + (maxLane - rank.length) * (nodeW + LANE_GAP) / 2,
          y: PAD + rIdx * (NODE_H + RANK_GAP)
        };
      }
    });
  });
  const totalW = layout === "LR"
    ? PAD * 2 + ranks.length * nodeW + (ranks.length - 1) * RANK_GAP
    : PAD * 2 + maxLane * nodeW + (maxLane - 1) * LANE_GAP;
  const totalH = layout === "LR"
    ? PAD * 2 + maxLane * NODE_H + (maxLane - 1) * LANE_GAP
    : PAD * 2 + ranks.length * NODE_H + (ranks.length - 1) * RANK_GAP;
  return { coords, totalW, totalH };
}

function renderNode(n, c, nodeW) {
  const shape = n.shape || "box";
  const label = `<text x="${c.x + nodeW / 2}" y="${c.y + NODE_H / 2 + 4}" text-anchor="middle" class="hs-flow-label">${escape(n.label)}</text>`;
  const tag = n.tag ? `<text x="${c.x + nodeW / 2}" y="${c.y - 6}" text-anchor="middle" class="hs-flow-tag">${escape(n.tag)}</text>` : "";
  if (shape === "pill") {
    return `<g class="hs-flow-node"><rect x="${c.x}" y="${c.y}" width="${nodeW}" height="${NODE_H}" rx="${NODE_H / 2}" class="hs-flow-shape-pill"/>${label}${tag}</g>`;
  }
  if (shape === "diamond") {
    const cx = c.x + nodeW / 2, cy = c.y + NODE_H / 2;
    const pts = [
      [cx, c.y - 4],
      [c.x + nodeW + 8, cy],
      [cx, c.y + NODE_H + 4],
      [c.x - 8, cy]
    ].map(p => p.join(",")).join(" ");
    return `<g class="hs-flow-node"><polygon points="${pts}" class="hs-flow-shape-diamond"/>${label}${tag}</g>`;
  }
  return `<g class="hs-flow-node"><rect x="${c.x}" y="${c.y}" width="${nodeW}" height="${NODE_H}" rx="8" class="hs-flow-shape-box"/>${label}${tag}</g>`;
}

function renderEdge(e, coords, layout, nodeW) {
  const a = coords[e.from], b = coords[e.to];
  if (!a || !b) return "";
  let x1, y1, x2, y2;
  if (layout === "LR") {
    x1 = a.x + nodeW; y1 = a.y + NODE_H / 2;
    x2 = b.x;         y2 = b.y + NODE_H / 2;
  } else {
    x1 = a.x + nodeW / 2; y1 = a.y + NODE_H;
    x2 = b.x + nodeW / 2; y2 = b.y;
  }
  const midX = (x1 + x2) / 2, midY = (y1 + y2) / 2;
  const path = layout === "LR"
    ? `M${x1},${y1} C${midX},${y1} ${midX},${y2} ${x2},${y2}`
    : `M${x1},${y1} C${x1},${midY} ${x2},${midY} ${x2},${y2}`;
  const label = e.label ? `<text x="${midX}" y="${midY - 6}" text-anchor="middle" class="hs-flow-edge-label">${escape(e.label)}</text>` : "";
  return `<g class="hs-flow-edge"><path d="${path}" class="hs-flow-edge-path" marker-end="url(#hsFlowArrow)"/>${label}</g>`;
}

export function FlowChart(props) {
  const { layout, nodes, edges, ranks } = props;
  // Derive a uniform node width from the longest label so text never overflows.
  const widest = nodes.reduce((w, n) => Math.max(w, estimateLabelWidth(n.label)), MIN_NODE_W);
  const nodeW = Math.min(widest, MAX_NODE_W);
  const { coords, totalW, totalH } = layoutCoords(layout, ranks, nodeW);

  const defs = `<defs><marker id="hsFlowArrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto">
    <path d="M0,0 L10,5 L0,10 Z" class="hs-flow-arrowhead"/>
  </marker></defs>`;

  const edgeSvg = edges.map(e => renderEdge(e, coords, layout, nodeW)).join("");
  const nodeSvg = nodes.map(n => coords[n.id] ? renderNode(n, coords[n.id], nodeW) : "").join("");

  return `<div class="hs-flow hs-flow-${layout.toLowerCase()} hs-zoomable">
<svg xmlns="http://www.w3.org/2000/svg" width="${totalW}" height="${totalH}" viewBox="0 0 ${totalW} ${totalH}">
${defs}
${edgeSvg}
${nodeSvg}
</svg>
</div>`;
}
