import { escape } from "../lib/html.mjs";

function escapeJson(str) {
  // Prevent </script> injection and HTML entity interpretation inside <script>
  return str.replace(/</g, "\\u003c").replace(/>/g, "\\u003e").replace(/&/g, "\\u0026");
}

const LOADER = `
if (!window.__hsChartLoaded) {
  window.__hsChartLoaded = true;
  var s = document.createElement('script');
  s.src = 'https://cdn.jsdelivr.net/npm/chart.js@4.4.0/dist/chart.umd.min.js';
  s.onload = function() { window.__hsChartReady && window.__hsChartReady(); };
  document.head.appendChild(s);
}
`.trim();

export function Chart(props) {
  const kind = props.kind;
  const data = props.data;
  const chartKind = kind === "area" ? "line" : kind; // area = line with fill
  const datasets = data.series.map(s => ({
    name: s.name,
    label: s.name,
    data: s.values,
    fill: kind === "area"
  }));
  const config = {
    type: chartKind,
    data: { labels: data.labels, datasets },
    options: {
      responsive: true,
      plugins: {
        legend: { display: datasets.length > 1 }
      },
      scales: ["pie"].includes(kind) ? undefined : {
        x: { title: { display: !!props.xLabel, text: props.xLabel || "" }},
        y: { title: { display: !!props.yLabel, text: props.yLabel || "" }}
      }
    }
  };
  const canvasId = "hsChart_" + Math.random().toString(36).slice(2, 10);
  const cap = (props.xLabel || props.yLabel)
    ? `<figcaption class="hs-chart-cap">${escape(props.xLabel || "")} ${props.yLabel ? "× " + escape(props.yLabel) : ""}${props.unit ? " (" + escape(props.unit) + ")" : ""}</figcaption>`
    : "";

  const initScript = `
(function(){
  var id = '${canvasId}';
  var config = JSON.parse('${escapeJson(JSON.stringify(config))}');
  function render() {
    var canvas = document.getElementById(id);
    if (!canvas || !window.Chart) { setTimeout(render, 50); return; }
    new window.Chart(canvas, config);
  }
  if (window.Chart) render(); else {
    var prev = window.__hsChartReady;
    window.__hsChartReady = function(){ prev && prev(); render(); };
  }
})();
`.trim();

  return `<figure class="hs-chart-wrap"><canvas class="hs-chart" data-kind="${escape(kind)}" id="${canvasId}"></canvas>${cap}<script>${LOADER}</script><script>${initScript}</script></figure>`;
}
