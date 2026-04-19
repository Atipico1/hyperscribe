import { escape } from "../lib/html.mjs";

const STATES = new Set(["stable", "modified", "added", "removed"]);
const KINDS  = new Set(["function", "class", "const", "type"]);

export function FileCard(props) {
  const state = STATES.has(props.state) ? props.state : "stable";
  const stateCls = `hs-file-card-state-${state}`;
  const path = props.path
    ? `<div class="hs-file-card-path">${escape(props.path)}</div>`
    : "";
  const iconAttr = props.icon ? ` data-icon="${escape(props.icon)}"` : "";
  const exports = Array.isArray(props.exports) && props.exports.length
    ? `<ul class="hs-file-card-exports">` +
      props.exports.map(e => {
        const kind = KINDS.has(e.kind) ? e.kind : "const";
        return `<li class="hs-file-card-export hs-file-card-export-${kind}" data-kind="${kind}">${escape(e.name)}</li>`;
      }).join("") +
      `</ul>`
    : "";
  const loc = (typeof props.loc === "number")
    ? `<span class="hs-file-card-loc">${escape(String(props.loc))} LOC</span>`
    : "";
  const footer = (loc || state !== "stable")
    ? `<footer class="hs-file-card-footer">${loc}<span class="hs-file-card-state-chip">${escape(state)}</span></footer>`
    : "";
  return `<article class="hs-file-card ${stateCls}"${iconAttr}>
<header class="hs-file-card-header">
  <h4 class="hs-file-card-name">${escape(props.name)}</h4>
  ${path}
</header>
<p class="hs-file-card-resp">${escape(props.responsibility)}</p>
${exports}
${footer}
</article>`;
}
