import { escape } from "../lib/html.mjs";

const LOADER = `
if (!window.__hsMermaidLoaded) {
  window.__hsMermaidLoaded = true;
  var s = document.createElement('script');
  s.src = 'https://cdn.jsdelivr.net/npm/mermaid@10/dist/mermaid.min.js';
  s.onload = function() {
    var cs = getComputedStyle(document.documentElement);
    function v(name, fallback) { return (cs.getPropertyValue(name) || '').trim() || fallback; }
    window.mermaid.initialize({
      startOnLoad: false,
      theme: 'base',
      fontFamily: v('--hs-font-sans', 'Inter, system-ui, sans-serif'),
      themeVariables: {
        primaryColor: v('--hs-color-surface-alt', '#f6f5f4'),
        primaryTextColor: v('--hs-color-fg', 'rgba(0,0,0,0.95)'),
        primaryBorderColor: 'rgba(0,0,0,0.12)',
        lineColor: v('--hs-color-fg-muted', '#615d59'),
        actorBkg: v('--hs-color-surface-alt', '#f6f5f4'),
        actorTextColor: v('--hs-color-fg', 'rgba(0,0,0,0.95)'),
        signalColor: v('--hs-color-fg', 'rgba(0,0,0,0.85)'),
        signalTextColor: v('--hs-color-fg', 'rgba(0,0,0,0.95)'),
        labelBoxBkgColor: v('--hs-color-surface-alt', '#f6f5f4'),
        labelTextColor: v('--hs-color-fg', 'rgba(0,0,0,0.95)'),
        noteBkgColor: v('--hs-note-bg', '#fef9c3'),
        noteBorderColor: v('--hs-note-border', '#eab308'),
        noteTextColor: v('--hs-note-text', '#713f12')
      }
    });
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
