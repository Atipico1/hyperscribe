import { escape } from "../lib/html.mjs";

const NODE_W = 160;
const NODE_H = 40;
const GAP_X  = 60;
const GAP_Y  = 28;
const PAD    = 24;

export function DependencyGraph(props) {
  if (props.layout !== "ranks") {
    throw new Error(`DependencyGraph layout "${props.layout}" not supported (v1 supports "ranks" only)`);
  }
  if (!Array.isArray(props.ranks) || props.ranks.length === 0) {
    throw new Error("DependencyGraph with layout=ranks requires a non-empty ranks array");
  }

  const nodeById = new Map();
  for (const n of props.nodes || []) nodeById.set(n.id, n);

  // Layout: ranks = columns (left→right). x = rank index, y = position in rank.
  const positions = new Map();
  let maxRankHeight = 0;
  props.ranks.forEach((rank, xi) => {
    maxRankHeight = Math.max(maxRankHeight, rank.length);
    rank.forEach((id, yi) => {
      positions.set(id, {
        x: PAD + xi * (NODE_W + GAP_X),
        y: PAD + yi * (NODE_H + GAP_Y)
      });
    });
  });

  const width  = PAD * 2 + props.ranks.length * (NODE_W + GAP_X) - GAP_X;
  const height = PAD * 2 + maxRankHeight * (NODE_H + GAP_Y) - GAP_Y;

  const nodeSvg = [];
  for (const [id, pos] of positions) {
    const n = nodeById.get(id);
    if (!n) continue;
    const typeCls = n.type ? ` hs-dep-graph-node-${escape(n.type)}` : "";
    nodeSvg.push(
      `<g class="hs-dep-graph-node${typeCls}" data-node-id="${escape(id)}" transform="translate(${pos.x},${pos.y})">` +
      `<rect class="hs-dep-graph-node-box" width="${NODE_W}" height="${NODE_H}" rx="8"/>` +
      `<text class="hs-dep-graph-node-label" x="${NODE_W/2}" y="${NODE_H/2}" text-anchor="middle" dominant-baseline="central">${escape(n.label || id)}</text>` +
      `</g>`
    );
  }

  const edgeSvg = [];
  for (const e of props.edges || []) {
    const from = positions.get(e.from);
    const to   = positions.get(e.to);
    if (!from || !to) continue;
    const cycleCls = e.cyclic ? " hs-dep-graph-edge-cyclic" : "";
    const kindCls  = e.kind ? ` hs-dep-graph-edge-${escape(e.kind)}` : "";
    // Self-loop
    if (e.from === e.to) {
      const cx = from.x + NODE_W;
      const cy = from.y + NODE_H / 2;
      edgeSvg.push(`<path class="hs-dep-graph-edge${kindCls}${cycleCls}" d="M${cx},${cy} q 30,-20 0,-30 q -15,-5 -30,0" fill="none"/>`);
      continue;
    }
    const x1 = from.x + NODE_W;
    const y1 = from.y + NODE_H / 2;
    const x2 = to.x;
    const y2 = to.y + NODE_H / 2;
    const mx = (x1 + x2) / 2;
    edgeSvg.push(`<path class="hs-dep-graph-edge${kindCls}${cycleCls}" d="M${x1},${y1} C${mx},${y1} ${mx},${y2} ${x2},${y2}" fill="none" marker-end="url(#hs-dep-arrow)"/>`);
  }

  return `<svg class="hs-dep-graph" viewBox="0 0 ${width} ${height}" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Dependency graph">
<defs>
  <marker id="hs-dep-arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="8" markerHeight="8" orient="auto-start-reverse">
    <path d="M0,0 L10,5 L0,10 z" class="hs-dep-graph-arrow-head"/>
  </marker>
</defs>
${edgeSvg.join("\n")}
${nodeSvg.join("\n")}
</svg>`;
}
