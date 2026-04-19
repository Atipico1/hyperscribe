import { escape } from "../lib/html.mjs";

const LOADER = `
if (!window.__hsMermaidLoaded) {
  window.__hsMermaidLoaded = true;
  var s = document.createElement('script');
  s.src = 'https://cdn.jsdelivr.net/npm/mermaid@10/dist/mermaid.min.js';
  s.onload = function() {
    window.mermaid.initialize({ startOnLoad: false, theme: 'base', themeVariables: {
      primaryColor: '#ffffff',
      primaryTextColor: 'rgba(0,0,0,0.95)',
      primaryBorderColor: 'rgba(0,0,0,0.1)',
      lineColor: '#615d59',
      fontFamily: 'Inter, system-ui, sans-serif'
    }});
    window.mermaid.run();
  };
  document.head.appendChild(s);
}
`.trim();

export function Mermaid(props) {
  const kind = props.kind;
  let source = props.source;
  if (kind === "flowchart" && props.direction && !/^\s*flowchart/.test(source)) {
    source = `flowchart ${props.direction}\n${source}`;
  }
  return `<div class="hs-mermaid-wrap" data-kind="${escape(kind)}"><pre class="mermaid">${escape(source)}</pre><script>${LOADER}</script></div>`;
}
