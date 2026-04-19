import { escape } from "../lib/html.mjs";

function renderNode(node) {
  const icon = node.icon ? `<span class="hs-arch-node-icon">${escape(node.icon)}</span>` : "";
  const tag = node.tag ? `<span class="hs-arch-node-tag">${escape(node.tag)}</span>` : "";
  const desc = node.description ? `<div class="hs-arch-node-desc">${escape(node.description)}</div>` : "";
  return `<article class="hs-arch-node" data-node-id="${escape(node.id)}"><div class="hs-arch-node-head">${icon}<div class="hs-arch-node-title">${escape(node.title)}</div>${tag}</div>${desc}</article>`;
}

function renderEdges(nodes, edges) {
  if (!Array.isArray(edges) || edges.length === 0) return "";
  const byId = new Map(nodes.map(n => [n.id, n]));
  const items = edges.map(e => {
    const from = byId.get(e.from)?.title ?? e.from;
    const to = byId.get(e.to)?.title ?? e.to;
    const label = e.label ? `<em>: ${escape(e.label)}</em>` : "";
    const cls = e.style ? ` class="hs-arch-edge-${e.style}"` : "";
    return `<li${cls}>${escape(from)} → ${escape(to)}${label}</li>`;
  }).join("");
  return `<ul class="hs-arch-edges">${items}</ul>`;
}

export function ArchitectureGrid(props) {
  const layout = props.layout;
  const edges = renderEdges(props.nodes || [], props.edges);

  let body;
  if (Array.isArray(props.groups) && props.groups.length > 0) {
    const nodesById = new Map((props.nodes || []).map(n => [n.id, n]));
    body = props.groups.map(g => {
      const groupNodes = g.nodeIds.map(id => nodesById.get(id)).filter(Boolean);
      const items = groupNodes.map(renderNode).join("");
      return `<section class="hs-arch-group" data-group-id="${escape(g.id)}"><div class="hs-arch-group-title">${escape(g.title)}</div><div class="hs-arch-group-body">${items}</div></section>`;
    }).join("");
  } else {
    body = (props.nodes || []).map(renderNode).join("");
  }

  return `<div class="hs-arch hs-arch-${layout}">${body}${edges}</div>`;
}
