import { escape } from "../lib/html.mjs";

const LAYOUTS = new Set(["grid", "columns"]);

function renderEntity(e) {
  const rows = (e.fields || []).map(f => {
    const keyCls = f.key ? ` hs-erd-field-key-${escape(f.key)}` : "";
    const nullCls = f.nullable ? " hs-erd-field-nullable" : "";
    const keyTag = f.key ? `<span class="hs-erd-field-key-tag">${escape(f.key.toUpperCase())}</span>` : "";
    return `<tr class="hs-erd-field${keyCls}${nullCls}">
      <td class="hs-erd-field-name">${escape(f.name)}${keyTag}</td>
      <td class="hs-erd-field-type">${escape(f.type)}${f.nullable ? "?" : ""}</td>
    </tr>`;
  }).join("");
  return `<article class="hs-erd-entity" data-entity-id="${escape(e.id)}">
<header class="hs-erd-entity-name">${escape(e.name)}</header>
<table class="hs-erd-fields"><tbody>${rows}</tbody></table>
</article>`;
}

function renderRelationship(r) {
  return `<li class="hs-erd-rel" data-from="${escape(r.from)}" data-to="${escape(r.to)}">
  <span class="hs-erd-rel-from">${escape(r.from)}</span>
  <span class="hs-erd-rel-arrow" aria-hidden="true">→</span>
  <span class="hs-erd-rel-card">${escape(r.cardinality)}</span>
  <span class="hs-erd-rel-arrow" aria-hidden="true">→</span>
  <span class="hs-erd-rel-to">${escape(r.to)}</span>
  ${r.label ? `<span class="hs-erd-rel-label">${escape(r.label)}</span>` : ""}
</li>`;
}

export function ERDDiagram(props) {
  const layout = LAYOUTS.has(props.layout) ? props.layout : "grid";
  const entities = (props.entities || []).map(renderEntity).join("");
  const rels = (props.relationships || []).map(renderRelationship).join("");
  return `<section class="hs-erd" data-layout="${layout}">
<div class="hs-erd-entities">${entities}</div>
${rels ? `<ul class="hs-erd-rels">${rels}</ul>` : ""}
</section>`;
}
